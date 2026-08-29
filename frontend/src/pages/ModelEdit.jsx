import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { 
  Save, 
  File, 
  Image, 
  Tag, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  Settings,
  ArrowLeft
} from 'lucide-react'
import { modelCategoryNames } from '../data/modelCategories'

const ModelEdit = () => {
  const navigate = useNavigate()
  const { modelId } = useParams()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    license: 'CC-BY-4.0',
    isPublic: true,
    polygonCount: '',
    renderEngine: '',
    softwareUsed: '',
    version: '',
    features: []
  })
  
  const [originalModel, setOriginalModel] = useState(null)
  const [previewImages, setPreviewImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Categories for 3D models
  // License options
  const licenses = [
    { value: 'CC-BY-4.0', label: 'Creative Commons Attribution 4.0', description: 'Free to use with attribution' },
    { value: 'CC-BY-SA-4.0', label: 'Creative Commons Attribution-ShareAlike 4.0', description: 'Free to use and modify with attribution' },
    { value: 'CC-BY-NC-4.0', label: 'Creative Commons Attribution-NonCommercial 4.0', description: 'Free for non-commercial use with attribution' },
    { value: 'CC0', label: 'Creative Commons Zero', description: 'Public domain, no restrictions' },
    { value: 'Custom', label: 'Custom License', description: 'Specify your own terms' }
  ]

  // Render engines
  const renderEngines = [
    'Blender Cycles', 'Blender Eevee', 'V-Ray', 'Arnold', 'Redshift',
    'Octane', 'Unreal Engine', 'Unity', 'Maya Arnold', '3ds Max V-Ray', 'Other'
  ]

  // Software options
  const softwareOptions = [
    'Blender', 'Maya', '3ds Max', 'Cinema 4D', 'Houdini', 'ZBrush',
    'Substance Painter', 'Marmoset Toolbag', 'Unreal Engine', 'Unity', 'Other'
  ]

  // Model features
  const availableFeatures = [
    'Textured', 'Rigged', 'Animated', 'Low Poly', 'High Poly',
    'PBR Materials', 'Normal Maps', 'Displacement Maps', 'LODs', 'Optimized'
  ]

  // Load existing model data
  useEffect(() => {
    const loadModel = async () => {
      if (!modelId || !user) return
      
      try {
        setLoading(true)
        const result = await firebaseHelpers.getModel(modelId)
        
        if (result.success) {
          const model = result.model
          
          // Check if user owns this model
          if (model.userId !== user.uid) {
            setError('You can only edit your own models')
            navigate('/explore')
            return
          }
          
          setOriginalModel(model)
          
          // Pre-fill form with existing data
          setFormData({
            title: model.title || '',
            description: model.description || '',
            category: model.category || '',
            tags: model.tags ? model.tags.join(', ') : '',
            license: model.license || 'CC-BY-4.0',
            isPublic: model.isPublic !== false,
            polygonCount: model.polygonCount || '',
            renderEngine: model.renderEngine || '',
            softwareUsed: model.softwareUsed || '',
            version: model.version || '',
            features: model.features || []
          })
          
          // Set existing preview images
          if (model.previewImages && model.previewImages.length > 0) {
            setPreviewImages(model.previewImages.map(img => ({
              ...img,
              isExisting: true
            })))
          }
          
        } else {
          setError('Model not found')
          navigate('/explore')
        }
      } catch (error) {
        console.error('Error loading model:', error)
        setError('Failed to load model')
      } finally {
        setLoading(false)
      }
    }
    
    loadModel()
  }, [modelId, user, navigate])

  // Smart tag suggestions
  const getTagSuggestions = (title, description, category) => {
    const suggestions = []
    
    if (title) {
      const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3)
      suggestions.push(...titleWords)
    }
    
    if (description) {
      const descWords = description.toLowerCase().split(' ').filter(word => word.length > 3)
      suggestions.push(...descWords)
    }
    
    if (category) {
      suggestions.push(category.toLowerCase())
    }
    
    const commonTags = ['3d', 'model', 'render', 'sculpture', 'design', 'art', 'game', 'animation']
    suggestions.push(...commonTags)
    
    return [...new Set(suggestions)].slice(0, 10)
  }

  const addSuggestedTag = (tag) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ')
      setFormData(prev => ({ ...prev, tags: newTags }))
      setHasChanges(true)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setHasChanges(true)
  }

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
    setHasChanges(true)
  }

  const handlePreviewImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }))
    setPreviewImages(prev => [...prev, ...newImages])
    setHasChanges(true)
  }

  const removePreviewImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to edit models')
      return
    }
    
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!formData.category) {
      setError('Category is required')
      return
    }
    
    try {
      setSaving(true)
      setError('')
      
      // Prepare update data
      const updateData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        updatedAt: new Date().toISOString()
      }
      
      // Update model in Firestore
      const result = await firebaseHelpers.updateModel(modelId, updateData)
      
      if (result.success) {
        setSuccess('Model updated successfully!')
        setHasChanges(false)
        
        // Redirect to model detail page after 2 seconds
        setTimeout(() => {
          navigate(`/model/${modelId}`)
        }, 2000)
      } else {
        setError(result.error || 'Failed to update model')
      }
    } catch (error) {
      console.error('Error updating model:', error)
      setError('Failed to update model. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading model...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h1 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Explore
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/model/${modelId}`)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Model
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Model
            </h1>
          </div>
          
          {success && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {success}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <File className="h-6 w-6 mr-3 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter model title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select category</option>
                  {modelCategoryNames.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your 3D model..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter tags separated by commas"
                />
                
                {/* Tag Suggestions */}
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {getTagSuggestions(formData.title, formData.description, formData.category).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addSuggestedTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Settings className="h-6 w-6 mr-3 text-blue-600" />
              Technical Specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Polygon Count
                </label>
                <input
                  type="number"
                  name="polygonCount"
                  value={formData.polygonCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Render Engine
                </label>
                <select
                  name="renderEngine"
                  value={formData.renderEngine}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select render engine</option>
                  {renderEngines.map(engine => (
                    <option key={engine} value={engine}>{engine}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Software Used
                </label>
                <select
                  name="softwareUsed"
                  value={formData.softwareUsed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select software</option>
                  {softwareOptions.map(software => (
                    <option key={software} value={software}>{software}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Software Version
                </label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 3.6.0"
                />
              </div>
            </div>
            
            {/* Model Features */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Model Features
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Images */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Image className="h-6 w-6 mr-3 text-blue-600" />
              Preview Images
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add New Preview Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePreviewImageChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can add multiple images. Existing images will be preserved.
              </p>
            </div>
            
            {/* Current Preview Images */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview || image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {!image.isExisting && (
                      <button
                        type="button"
                        onClick={() => removePreviewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {image.isExisting && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        Existing
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* License and Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Globe className="h-6 w-6 mr-3 text-blue-600" />
              License & Privacy
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License
                </label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {licenses.map(license => (
                    <option key={license.value} value={license.value}>
                      {license.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {licenses.find(l => l.value === formData.license)?.description}
                </p>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make model public
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Public models are visible to everyone
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/model/${modelId}`)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Model
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModelEdit 
