import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  CheckCircle,
  Eye,
  File,
  FileText,
  Globe,
  Image,
  Info,
  Loader2,
  Lock,
  Plus,
  Save,
  Settings,
  Shield,
  Sparkles,
  Tag,
  Upload as UploadIcon,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { Button } from '../components/ui/Button'
import PageMeta from '../components/PageMeta'
import { modelCategoryNames } from '../data/modelCategories'

const licenses = [
  { value: 'CC-BY-4.0', label: 'Attribution', description: 'Free to use with creator credit.' },
  { value: 'CC-BY-SA-4.0', label: 'Attribution + Share Alike', description: 'Free to use and remix with the same license.' },
  { value: 'CC-BY-NC-4.0', label: 'Non-Commercial', description: 'Free for non-commercial use with creator credit.' },
  { value: 'CC0', label: 'Public Domain', description: 'Anyone can use it without restrictions.' },
  { value: 'Custom', label: 'Custom License', description: 'Use your own terms in the description.' }
]

const renderEngines = [
  'Blender Cycles',
  'Blender Eevee',
  'V-Ray',
  'Arnold',
  'Redshift',
  'Octane',
  'Unreal Engine',
  'Unity',
  'Maya Arnold',
  '3ds Max V-Ray',
  'Other'
]

const softwareOptions = [
  'Blender',
  'Maya',
  '3ds Max',
  'Cinema 4D',
  'Houdini',
  'ZBrush',
  'Substance Painter',
  'Marmoset Toolbag',
  'Unreal Engine',
  'Unity',
  'Other'
]

const availableFeatures = [
  'Textured',
  'Rigged',
  'Animated',
  'Low Poly',
  'High Poly',
  'PBR Materials',
  'Normal Maps',
  'Displacement Maps',
  'LODs',
  'Optimized'
]

const acceptedModelExtensions = /\.(glb|gltf|obj|fbx|3ds|dae|stl|ply|zip)$/i

const initialFormData = {
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
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 MB'
  const mb = bytes / 1024 / 1024
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`
}

const isModelFile = (file) => acceptedModelExtensions.test(file.name)

const AUTO_DETAILS_ENDPOINT = typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'
const AUTO_DETAILS_HEADERS = {
  'Content-Type': 'application/json'
}

const normalizeAiEndpoint = (value) => String(value || '').trim().replace(/\/+$/, '')

const getTagSuggestions = (title, description, category) => {
  const words = [title, description, category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)

  return [...new Set([...words, '3d', 'model', 'game', 'asset', 'render'])].slice(0, 10)
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    resolve(result.includes(',') ? result.split(',')[1] : result)
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const normalizeAiSuggestions = (suggestions) => {
  const category = modelCategoryNames.includes(suggestions.category)
    ? suggestions.category
    : 'Other'

  const tags = Array.isArray(suggestions.tags)
    ? suggestions.tags
    : String(suggestions.tags || '').split(',')

  const features = Array.isArray(suggestions.features)
    ? suggestions.features
    : String(suggestions.features || '').split(',')

  return {
    title: String(suggestions.title || '').trim().slice(0, 100),
    category,
    description: String(suggestions.description || '').trim().slice(0, 2000),
    tags: [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 10),
    features: features
      .map((feature) => String(feature).trim())
      .filter((feature) => availableFeatures.includes(feature))
  }
}

const Upload = () => {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const fileInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)

  const [formData, setFormData] = useState(initialFormData)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImages, setPreviewImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const autoDetailsEnabled = Boolean(normalizeAiEndpoint(AUTO_DETAILS_ENDPOINT))

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login', { replace: true, state: { from: { pathname: '/upload' } } })
      return
    }

    const savedDraft = localStorage.getItem(`upload_draft_${user.uid}`)
    if (!savedDraft) return

    try {
      const draft = JSON.parse(savedDraft)
      setFormData({
        title: draft.title || '',
        description: draft.description || '',
        category: draft.category || '',
        tags: draft.tags || '',
        license: draft.license || 'CC-BY-4.0',
        isPublic: draft.isPublic !== undefined ? draft.isPublic : true,
        polygonCount: draft.polygonCount || '',
        renderEngine: draft.renderEngine || '',
        softwareUsed: draft.softwareUsed || '',
        version: draft.version || '',
        features: draft.features || []
      })
    } catch (err) {
      console.error('Error loading draft:', err)
    }
  }, [authLoading, navigate, user])

  useEffect(() => {
    if (!user) return

    const hasDraftContent =
      formData.title ||
      formData.description ||
      formData.category ||
      formData.tags ||
      selectedFile

    if (!hasDraftContent) return

    const timeout = setTimeout(() => saveDraft(false), 1400)
    return () => clearTimeout(timeout)
  }, [formData, selectedFile, user])

  const tagSuggestions = getTagSuggestions(formData.title, formData.description, formData.category)
  const selectedTags = formData.tags
    ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  const fileReady = Boolean(selectedFile)
  const detailsReady = Boolean(
    formData.title.trim() &&
    formData.description.trim() &&
    formData.category
  )
  const publishReady = Boolean(formData.license)
  const readyToUpload = fileReady && detailsReady && publishReady
  const selectedLicense = licenses.find((license) => license.value === formData.license)
  const descriptionLength = formData.description.trim().length
  const seoChecks = [
    { label: 'Clear title', done: formData.title.trim().length >= 8, points: 15 },
    { label: 'Detailed description', done: descriptionLength >= 180, points: 25 },
    { label: 'Category selected', done: Boolean(formData.category), points: 15 },
    { label: '5+ useful tags', done: selectedTags.length >= 5, points: 15 },
    { label: '3+ preview renders', done: previewImages.length >= 3, points: 20 },
    { label: 'License selected', done: Boolean(formData.license), points: 10 }
  ]
  const seoScore = seoChecks.reduce((score, item) => score + (item.done ? item.points : 0), 0)
  const seoScoreLabel = seoScore >= 85 ? 'Excellent' : seoScore >= 65 ? 'Good' : seoScore >= 40 ? 'Needs work' : 'Weak'

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-black dark:text-white dark:focus:border-white dark:focus:ring-white/10'
  const labelClass = 'mb-2 block text-sm font-medium text-gray-900 dark:text-white'
  const helperClass = 'mt-1 text-xs text-gray-500 dark:text-gray-500'
  const sectionClass = 'rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black'

  function saveDraft(showMessage = true) {
    if (!user) return

    const hasDraftContent =
      formData.title ||
      formData.description ||
      formData.category ||
      formData.tags ||
      selectedFile

    if (!hasDraftContent) return

    const draft = {
      ...formData,
      timestamp: new Date().toISOString(),
      userId: user.uid
    }

    localStorage.setItem(`upload_draft_${user.uid}`, JSON.stringify(draft))
    setLastSaved(new Date())

    if (showMessage) {
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2500)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((item) => item !== feature)
        : [...prev.features, feature]
    }))
  }

  const addSuggestedTag = (tag) => {
    if (selectedTags.includes(tag)) return
    setFormData((prev) => ({
      ...prev,
      tags: [...selectedTags, tag].slice(0, 10).join(', ')
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isModelFile(file)) {
      setError('Please choose a 3D model file: GLB, GLTF, OBJ, FBX, 3DS, DAE, STL, PLY, or ZIP.')
      return
    }

    if (file.size > 250 * 1024 * 1024) {
      setError('File size must be less than 250MB.')
      return
    }

    setSelectedFile(file)
    setError('')

    if (!formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      }))
    }
  }

  const handlePreviewImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const validFiles = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Preview files must be images.')
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Each preview image must be less than 5MB.')
        continue
      }

      if (previewImages.length + validFiles.length >= 8) {
        setError('Maximum 8 preview images allowed.')
        break
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}_${Math.random()}`
      })
    }

    if (validFiles.length) {
      setPreviewImages((prev) => [...prev, ...validFiles])
      setError('')
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePreviewImage = (id) => {
    setPreviewImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === id)
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview)
      return prev.filter((image) => image.id !== id)
    })
  }

  const clearPreviewImages = () => {
    previewImages.forEach((image) => URL.revokeObjectURL(image.preview))
    setPreviewImages([])
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files || [])
    const modelFile = files.find(isModelFile)
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (modelFile) {
      handleFileSelect({ target: { files: [modelFile] } })
    }

    if (imageFiles.length) {
      handlePreviewImageSelect({ target: { files: imageFiles } })
    }

    if (!modelFile && !imageFiles.length) {
      setError('Drop a supported 3D model file or preview images.')
    }
  }, [formData.title, previewImages.length])

  const validateForm = () => {
    if (!selectedFile) {
      setError('Please add a 3D model file.')
      return false
    }

    if (!formData.title.trim()) {
      setError('Please add a model title.')
      return false
    }

    if (!formData.description.trim()) {
      setError('Please add a short description.')
      return false
    }

    if (!formData.category) {
      setError('Please choose a category.')
      return false
    }

    if (selectedTags.length > 10) {
      setError('Maximum 10 tags allowed.')
      return false
    }

    return true
  }

  const generateWithLocalAi = async () => {
    const previewFile = previewImages[0]?.file
    const hasAnyClue = selectedFile || previewFile || formData.title || formData.description

    if (!hasAnyClue) {
      setError('Add a model file, preview image, or title first so auto-fill has something to inspect.')
      return
    }

    const aiServiceUrl = normalizeAiEndpoint(AUTO_DETAILS_ENDPOINT)

    if (!aiServiceUrl) {
      setError('Auto-fill is not available right now.')
      return
    }

    setAiGenerating(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        file: selectedFile
          ? {
              name: selectedFile.name,
              type: selectedFile.type || 'model/unknown',
              size: selectedFile.size
            }
          : null,
        fields: {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          tags: formData.tags
        },
        allowedCategories: modelCategoryNames,
        allowedFeatures: availableFeatures,
        previewImages: previewFile
          ? [{
              name: previewFile.name,
              type: previewFile.type,
              data: await fileToBase64(previewFile)
            }]
          : []
      }

      const response = await fetch(`${aiServiceUrl}/api/upload-assist`, {
        method: 'POST',
        headers: AUTO_DETAILS_HEADERS,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Auto-fill failed to generate suggestions.')
      }

      const data = await response.json()
      const suggestions = normalizeAiSuggestions(data.suggestions || {})

      setFormData((prev) => ({
        ...prev,
        title: suggestions.title || prev.title,
        category: suggestions.category || prev.category,
        description: suggestions.description || prev.description,
        tags: suggestions.tags.length ? suggestions.tags.join(', ') : prev.tags,
        features: suggestions.features.length
          ? [...new Set([...prev.features, ...suggestions.features])]
          : prev.features
      }))

      setSuccess('Details added. Review them before uploading.')
    } catch (err) {
      console.warn('Auto-fill unavailable.')
      setError('Auto-fill is not available right now. Please try again later.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)

    try {
      const modelData = {
        uid: `${user.uid}_${Date.now()}`,
        userId: user.uid,
        user_id: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: selectedTags,
        license: formData.license,
        isPublic: formData.isPublic,
        is_private: !formData.isPublic,
        polygonCount: formData.polygonCount ? parseInt(formData.polygonCount, 10) : null,
        renderEngine: formData.renderEngine || null,
        softwareUsed: formData.softwareUsed || null,
        version: formData.version || null,
        features: formData.features,
        author: {
          username: profile?.username || user.email?.split('@')[0] || 'Unknown',
          avatar: profile?.avatar || null
        },
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        downloads: 0,
        likes: 0,
        views: 0,
        rating: 0,
        totalRatings: 0
      }

      const result = await firebaseHelpers.uploadModel(
        modelData,
        selectedFile,
        previewImages,
        (status, progress, message) => {
          setUploadProgress(progress)
          if (message) setSuccess(message)
        }
      )

      if (result.success) {
        localStorage.removeItem(`upload_draft_${user.uid}`)
        setSuccess('Model uploaded. Opening your profile...')
        setTimeout(() => navigate(`/profile/${user.uid}`), 1800)
      } else {
        setError(result.error || 'Failed to upload model.')
      }
    } catch (err) {
      setError('Failed to upload model. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-black dark:text-white">
      <PageMeta
        title="Upload 3D Model - Free | 3D ShareSpace"
        description="Upload your 3D model for free. Share GLB, GLTF, OBJ, FBX, STL, ZIP, and more with the 3D ShareSpace community."
        keywords="upload 3D model, free 3D upload, GLB, GLTF, OBJ, FBX, STL, ZIP"
        url="/upload"
        type="website"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-900 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500">
              Creator upload
            </p>
            <h1 className="text-3xl font-semibold tracking-normal text-gray-950 dark:text-white sm:text-4xl">
              Upload a 3D model
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Add the file, give it searchable details, choose how people can use it, then publish.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            {lastSaved && <span>Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            <Button type="button" variant="outline" onClick={() => saveDraft(true)} className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            {(error || success || draftSaved) && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  error
                    ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'
                    : 'border-gray-300 bg-white text-gray-800 dark:border-gray-800 dark:bg-black dark:text-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {error ? <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                  <span>{error || (draftSaved ? 'Draft saved.' : success)}</span>
                </div>
              </div>
            )}

            <section className={sectionClass}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-950 dark:text-white">
                    <UploadIcon className="h-5 w-5" />
                    Model file
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    GLB, GLTF, OBJ, FBX, 3DS, DAE, STL, PLY, or ZIP. Maximum 250MB.
                  </p>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
                    aria-label="Remove selected model file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf,.obj,.fbx,.3ds,.dae,.stl,.ply,.zip"
                onChange={handleFileSelect}
                className="hidden"
                id="model-file-input"
              />

              <label
                htmlFor="model-file-input"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition ${
                  isDragOver
                    ? 'border-gray-950 bg-gray-100 dark:border-white dark:bg-gray-900'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-600 dark:hover:bg-black'
                }`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-950 text-white dark:bg-white dark:text-black">
                  {selectedFile ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                </div>
                <p className="text-base font-medium text-gray-950 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Drop your model here'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  {selectedFile
                    ? `${formatBytes(selectedFile.size)} - ${selectedFile.name.split('.').pop().toUpperCase()}`
                    : 'or click to choose a file'}
                </p>
              </label>
            </section>

            <section className={sectionClass}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-950 dark:text-white">
                    <Image className="h-5 w-5" />
                    Preview images
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Add screenshots or renders so people can inspect the model quickly.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePreviewImageSelect}
                    className="hidden"
                    id="preview-input"
                  />
                  <Button type="button" variant="outline" onClick={() => thumbnailInputRef.current?.click()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Images
                  </Button>
                  {previewImages.length > 0 && (
                    <Button type="button" variant="ghost" onClick={clearPreviewImages} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {previewImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {previewImages.map((image, index) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950">
                      <img src={image.preview} alt={`Preview ${index + 1}`} className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreviewImage(image.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Remove preview image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center dark:border-gray-800 dark:bg-gray-950"
                >
                  <Image className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">No preview images yet</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">JPG, PNG, GIF, or WebP. Up to 8 images, 5MB each.</p>
                </div>
              )}
            </section>

            <section className={sectionClass}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-950 dark:text-white">
                    <FileText className="h-5 w-5" />
                    Model details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Good titles, descriptions, and tags help Google and users find your model.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateWithLocalAi}
                  disabled={aiGenerating || !autoDetailsEnabled}
                  className="gap-2"
                >
                  {aiGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Auto-fill
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="title" className={labelClass}>Title *</label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={100}
                    className={inputClass}
                    placeholder="Modern wooden chair"
                  />
                  <p className={helperClass}>{formData.title.length}/100 characters</p>
                </div>

                <div>
                  <label htmlFor="category" className={labelClass}>Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Choose category</option>
                    {modelCategoryNames.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className={labelClass}>Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className={inputClass}
                    placeholder="Tell users what is included, what it is best used for, and any important details."
                  />
                  <p className={helperClass}>{formData.description.length}/2000 characters</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="tags" className={labelClass}>Tags</label>
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10`}
                      placeholder="chair, wood, furniture, low poly"
                    />
                  </div>
                  <p className={helperClass}>Separate tags with commas. Maximum 10 tags.</p>

                  {tagSuggestions.filter((tag) => !selectedTags.includes(tag)).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tagSuggestions
                        .filter((tag) => !selectedTags.includes(tag))
                        .slice(0, 7)
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addSuggestedTag(tag)}
                            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-950 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:border-white dark:hover:text-white"
                          >
                            + {tag}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-950 dark:text-white">
                  <Shield className="h-5 w-5" />
                  Publish settings
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  Choose visibility and how others can use your file.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="license" className={labelClass}>License</label>
                  <select
                    id="license"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    {licenses.map((license) => (
                      <option key={license.value} value={license.value}>{license.label}</option>
                    ))}
                  </select>
                  <p className={helperClass}>{selectedLicense?.description}</p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <label htmlFor="isPublic" className="flex cursor-pointer items-start gap-3">
                    <input
                      id="isPublic"
                      name="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950 dark:border-gray-700 dark:bg-black"
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-950 dark:text-white">
                        Public model
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-500">
                        Public models can appear in search, profiles, and public collection pages.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <details className={sectionClass}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span>
                  <span className="flex items-center gap-2 text-lg font-semibold text-gray-950 dark:text-white">
                    <Settings className="h-5 w-5" />
                    Advanced details
                  </span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-500">
                    Optional technical details for serious downloaders.
                  </span>
                </span>
                <Plus className="h-5 w-5 text-gray-500" />
              </summary>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="polygonCount" className={labelClass}>Polygon count</label>
                  <input
                    id="polygonCount"
                    name="polygonCount"
                    type="number"
                    value={formData.polygonCount}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="50000"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="softwareUsed" className={labelClass}>Software used</label>
                  <select
                    id="softwareUsed"
                    name="softwareUsed"
                    value={formData.softwareUsed}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select software</option>
                    {softwareOptions.map((software) => (
                      <option key={software} value={software}>{software}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="renderEngine" className={labelClass}>Render engine</label>
                  <select
                    id="renderEngine"
                    name="renderEngine"
                    value={formData.renderEngine}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select engine</option>
                    {renderEngines.map((engine) => (
                      <option key={engine} value={engine}>{engine}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="version" className={labelClass}>Software version</label>
                  <input
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="4.2"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className={labelClass}>Features</p>
                  <div className="flex flex-wrap gap-2">
                    {availableFeatures.map((feature) => {
                      const active = formData.features.includes(feature)
                      return (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            active
                              ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-black'
                              : 'border-gray-300 text-gray-700 hover:border-gray-950 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:border-white dark:hover:text-white'
                          }`}
                        >
                          {feature}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </details>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Ready check</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                Complete these before uploading.
              </p>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-950 dark:text-white">Auto-fill details</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-500">
                      Suggests a detailed description, category, tags, and useful listing details for review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: 'Model file added', done: fileReady, icon: File },
                  { label: 'Title, description, category', done: detailsReady, icon: Info },
                  { label: 'License selected', done: publishReady, icon: Globe },
                  { label: 'Preview images', done: previewImages.length > 0, icon: Eye, optional: true }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-800">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        item.done
                          ? 'bg-gray-950 text-white dark:bg-white dark:text-black'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-500'
                      }`}>
                        {item.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-950 dark:text-white">{item.label}</p>
                        {item.optional && <p className="text-xs text-gray-500 dark:text-gray-500">Optional, but recommended</p>}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-950 dark:text-white">Google image SEO score</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{seoScoreLabel} listing strength</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-950 dark:text-white">{seoScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">/100</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-900">
                  <div
                    className="h-full rounded-full bg-gray-950 transition-all dark:bg-white"
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  {seoChecks.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                      <span className={item.done ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}>
                        {item.label}
                      </span>
                      <span className={item.done ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}>
                        {item.done ? 'Done' : `+${item.points}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>Uploading</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-900">
                    <div
                      className="h-full rounded-full bg-gray-950 transition-all dark:bg-white"
                      style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-start gap-3">
                  {formData.isPublic ? <Globe className="mt-0.5 h-4 w-4 text-gray-500" /> : <Lock className="mt-0.5 h-4 w-4 text-gray-500" />}
                  <div>
                    <p className="text-sm font-medium text-gray-950 dark:text-white">
                      {formData.isPublic ? 'Public upload' : 'Private upload'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-500">
                      {formData.isPublic
                        ? 'People can discover, view, and download it after publishing.'
                        : 'Only you can see it after upload.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button type="submit" disabled={loading || !readyToUpload} size="lg" className="w-full gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4" />
                      Upload Model
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="w-full">
                  Cancel
                </Button>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-500">
                Your draft saves automatically in this browser. Model files are uploaded only when you press Upload Model.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}

export default Upload
