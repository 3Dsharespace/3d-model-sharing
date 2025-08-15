import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Upload as UploadIcon, X, File, Image, CheckCircle, AlertCircle, Info } from 'lucide-react'

const Upload = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    tags: '',
    is_public: true
  })
  
  const [file, setFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState({ file: false, thumbnail: false })
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileSelect = (e, type) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (type === 'file') {
        setFile(selectedFile)
      } else if (type === 'thumbnail') {
        setThumbnail(selectedFile)
      }
    }
  }

  const handleDrag = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [type]: true }))
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [type]: false }))
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (type === 'file') {
        setFile(droppedFile)
      } else if (type === 'thumbnail') {
        setThumbnail(droppedFile)
      }
    }
  }

  const removeFile = (type) => {
    if (type === 'file') {
      setFile(null)
    } else if (type === 'thumbnail') {
      setThumbnail(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file, type) => {
    if (type === 'file') {
      const allowedTypes = ['.obj', '.fbx', '.dae', '.blend', '.3ds', '.max', '.c4d', '.ma', '.mb', '.lwo', '.lws', '.ply', '.stl', '.wrl', '.x3d']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        return 'Invalid file type. Please select a 3D model file.'
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB
        return 'File size too large. Maximum size is 100MB.'
      }
    } else if (type === 'thumbnail') {
      if (!file.type.startsWith('image/')) {
        return 'Please select an image file for the thumbnail.'
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        return 'Thumbnail size too large. Maximum size is 10MB.'
      }
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to upload models')
      return
    }

    if (!file) {
      setError('Please select a 3D model file')
      return
    }

    if (!thumbnail) {
      setError('Please select a thumbnail image')
      return
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for your model')
      return
    }

    // Validate files
    const fileError = validateFile(file, 'file')
    const thumbnailError = validateFile(thumbnail, 'thumbnail')
    
    if (fileError) {
      setError(fileError)
      return
    }
    
    if (thumbnailError) {
      setError(thumbnailError)
      return
    }
    
    setLoading(true)
    setError('')
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Prepare model data
      const modelData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        user_id: user.uid,
        is_public: formData.is_public
      }

      // Upload model using Firebase
      const result = await firebaseHelpers.uploadModel(modelData, file, thumbnail)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Success - redirect to the new model
      setTimeout(() => {
        navigate(`/model/${result.modelId}`)
      }, 500)
      
    } catch (err) {
      setError(err.message || 'Failed to upload model')
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You must be logged in to upload 3D models.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload 3D Model
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your 3D models with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
                </div>
              )}

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter model title"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="other">Other</option>
                <option value="architecture">Architecture</option>
                <option value="characters">Characters</option>
                <option value="vehicles">Vehicles</option>
                <option value="props">Props</option>
                <option value="landscapes">Landscapes</option>
                <option value="furniture">Furniture</option>
                <option value="weapons">Weapons</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Describe your 3D model..."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="e.g., sci-fi, robot, futuristic"
              />
            </div>

            <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                    onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Make this model public
                  </span>
                </label>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            3D Model File *
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive.file
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={(e) => handleDrag(e, 'file')}
            onDragLeave={(e) => handleDrag(e, 'file')}
            onDragOver={(e) => handleDrag(e, 'file')}
            onDrop={(e) => handleDrop(e, 'file')}
          >
            {file ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <File className="w-8 h-8 text-blue-500" />
                  <span className="text-gray-900 dark:text-white font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('file')}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Size: {formatFileSize(file.size)}
                </div>
                <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">File selected</span>
                </div>
              </div>
            ) : (
              <div>
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".obj,.fbx,.dae,.blend,.3ds,.max,.c4d,.ma,.mb,.lwo,.lws,.ply,.stl,.wrl,.x3d"
                    onChange={(e) => handleFileSelect(e, 'file')}
                    className="sr-only"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  OBJ, FBX, DAE, BLEND, 3DS, MAX, C4D, MA, MB, LWO, LWS, PLY, STL, WRL, X3D up to 100MB
                </p>
                </div>
              )}
            </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Thumbnail Image *
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive.thumbnail
                ? 'border-green-400 bg-green-50 dark:bg-green-900/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={(e) => handleDrag(e, 'thumbnail')}
            onDragLeave={(e) => handleDrag(e, 'thumbnail')}
            onDragOver={(e) => handleDrag(e, 'thumbnail')}
            onDrop={(e) => handleDrop(e, 'thumbnail')}
          >
            {thumbnail ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <Image className="w-8 h-8 text-green-500" />
                  <span className="text-gray-900 dark:text-white font-medium">{thumbnail.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('thumbnail')}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Size: {formatFileSize(thumbnail.size)}
                </div>
                <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Thumbnail selected</span>
                </div>
              </div>
            ) : (
              <div>
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <span className="text-green-600 hover:text-green-500 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                  </label>
                  <input
                    id="thumbnail-upload"
                    name="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'thumbnail')}
                    className="sr-only"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Uploading Model...
            </h3>
            <div className="space-y-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {uploadProgress}% Complete
            </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !file || !thumbnail}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Uploading...' : 'Upload Model'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Upload
