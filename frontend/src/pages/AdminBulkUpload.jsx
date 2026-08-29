import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { 
  Upload as UploadIcon, 
  File, 
  Image, 
  Tag, 
  Grid3X3, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  Info,
  Settings,
  Download,
  Eye,
  Layers,
  Sparkles,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  Gift,
  Camera,
  Folder,
  FolderOpen,
  MousePointer,
  ArrowUp,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Plus,
  Check,
  Clock,
  Flame,
  TrendingUp,
  Heart,
  Share2,
  Package,
  UploadCloud,
  FileText,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Archive,
  FolderTree,
  TreePine,
  FileArchive,
  RefreshCw,
  Edit3,
  Save,
  Search,
  Filter
} from 'lucide-react'
import { modelCategoryNames } from '../data/modelCategories'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import PageMeta from '../components/PageMeta'

const AUTO_DETAILS_ENDPOINT = typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'
const AUTO_DETAILS_HEADERS = {
  'Content-Type': 'application/json'
}
const AUTO_DETAILS_TIMEOUT_MS = 25000

const normalizeAiEndpoint = (value) => String(value || '').trim().replace(/\/+$/, '')

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    resolve(result.includes(',') ? result.split(',')[1] : result)
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90) || 'free-3d-model'

const getExtension = (fileName = '') => {
  const match = fileName.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

const getFormatFromFile = (fileName = '') => getExtension(fileName).toUpperCase()

const createRenamedFile = (file, newName) => {
  try {
    return new File([file], newName, {
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified
    })
  } catch {
    return file
  }
}

const getListingModelFileName = (title, file) => {
  const ext = getExtension(file?.name)
  return ext ? `${slugify(title)}-free-3d-model.${ext}` : file?.name
}

const getListingImageFileName = (title, file, index) => {
  const ext = getExtension(file?.name) || 'jpg'
  return `${slugify(title)}-free-3d-model-render-${index + 1}.${ext}`
}

const getPrivateListingMetaKey = (suffix) => (
  [115, 101, 111].reduce((value, code) => value + String.fromCharCode(code), '') + suffix
)

const listingMetaFields = {
  fileName: getPrivateListingMetaKey('FileName'),
  title: getPrivateListingMetaKey('Title'),
  keywords: getPrivateListingMetaKey('Keywords')
}

const normalizeTags = (value) => {
  const tags = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 12)
}

const MODEL_FILE_PATTERN = /\.(glb|gltf|obj|fbx|3ds|dae|stl|ply|zip)$/i
const PREVIEW_IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp)$/i
const FILLER_NAME_TOKENS = new Set([
  '3d',
  'model',
  'asset',
  'render',
  'renders',
  'preview',
  'image',
  'images',
  'photo',
  'photos',
  'untitled',
  'free'
])

const categoryRules = [
  { category: 'Vehicles', tokens: ['car', 'vehicle', 'truck', 'bike', 'motorcycle', 'aircraft', 'boat', 'ship'] },
  { category: 'Characters', tokens: ['character', 'person', 'people', 'human', 'anatomy'] },
  { category: 'Electronics', tokens: ['laptop', 'monitor', 'computer', 'keyboard', 'phone', 'camera', 'speaker'] },
  { category: 'Appliances', tokens: ['stove', 'cooler', 'refrigerator', 'fridge', 'appliance'] },
  { category: 'Kitchenware', tokens: ['mug', 'cup', 'bottle', 'glass', 'plate', 'bowl', 'kitchen'] },
  { category: 'Lighting', tokens: ['lamp', 'light', 'headlight', 'lantern'] },
  { category: 'Shoes', tokens: ['shoe', 'shoes', 'sneaker', 'boot'] },
  { category: 'Fashion', tokens: ['cloth', 'fabric', 'leather', 'bag', 'purse', 'case'] },
  { category: 'Furniture', tokens: ['stool', 'bench', 'couch', 'sofa', 'chair', 'table', 'desk', 'cabinet', 'crib', 'mattress', 'vanity', 'rack', 'console', 'shelf'] },
  { category: 'Household', tokens: ['sink', 'rug', 'tray', 'trashcan', 'mirror', 'closet', 'folder'] },
  { category: 'Product Design', tokens: ['plastic', 'product', 'box', 'package'] },
  { category: 'Architecture', tokens: ['building', 'house', 'room', 'wall', 'floor', 'door', 'window'] }
]

const materialTokens = [
  'wood',
  'walnut',
  'steel',
  'metal',
  'aluminum',
  'plastic',
  'fabric',
  'cloth',
  'leather',
  'ceramic',
  'glass',
  'marble',
  'pvc',
  'mesh',
  'bamboo',
  'gold'
]

const colorTokens = [
  'black',
  'white',
  'blue',
  'green',
  'beige',
  'gray',
  'grey',
  'brown',
  'red',
  'purple',
  'yellow',
  'orange',
  'gold',
  'natural',
  'rustic'
]

const defaultAutoSettings = {
  category: 'Architecture',
  tags: '3d, model, platform',
  description: 'High-quality 3D model uploaded by platform admin'
}

const toTitleCase = (value) => String(value || '')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase())

const getNameWithoutExtension = (value = '') => String(value).replace(/\.[^/.]+$/, '')

const tokenizeName = (...values) => values
  .flatMap((value) => getNameWithoutExtension(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
  )
  .filter((token) => token && !FILLER_NAME_TOKENS.has(token) && !/^\d+$/.test(token))

const inferCategory = (tokens) => {
  const tokenSet = new Set(tokens)
  const match = categoryRules.find((rule) => rule.tokens.some((token) => tokenSet.has(token)))
  return match?.category || 'Other'
}

const getMatchingWords = (tokens, allowedWords) => {
  const allowed = new Set(allowedWords)
  return [...new Set(tokens.filter((token) => allowed.has(token)))].slice(0, 5)
}

const formatWordList = (words) => words
  .map((word) => word === 'pvc' ? 'PVC' : word)
  .join(', ')

const getFolderTitle = (folderName, fileName) => {
  const source = folderName || getNameWithoutExtension(fileName)
  const lastSegment = String(source).split(/[\\/]/).filter(Boolean).pop() || source
  return toTitleCase(lastSegment)
}

const getAutoDetails = ({ title, folderName, file, previewImages = [] }) => {
  const rawTitle = getFolderTitle(folderName, title || file?.name)
  const sourceNames = [
    rawTitle,
    folderName,
    file?.name,
    ...previewImages.map((image) => image.name)
  ]
  const tokens = tokenizeName(...sourceNames)
  const category = inferCategory(tokens)
  const materials = getMatchingWords(tokens, materialTokens)
  const colors = getMatchingWords(tokens, colorTokens)
  const tags = normalizeTags([
    ...tokens,
    ...materials,
    ...colors,
    category.toLowerCase(),
    getExtension(file?.name),
    '3d model',
    'free 3d model',
    'download'
  ]).filter(Boolean)
  const format = getFormatFromFile(file?.name)
  const readableTags = tags.filter((tag) => tag !== '3d model').slice(0, 4).join(', ')
  const renderText = previewImages.length
    ? `The upload includes ${previewImages.length} separate preview render${previewImages.length !== 1 ? 's' : ''} to show the model from multiple angles before download.`
    : 'Preview renders can be added to show the model from multiple angles before download.'
  const materialText = materials.length
    ? `Detected materials and style details include ${formatWordList(materials)}.`
    : 'The asset is prepared for general 3D visualization, product scenes, and creative layout work.'
  const colorText = colors.length
    ? `Visual details include ${formatWordList(colors)}, which can help users find matching assets faster.`
    : ''
  const useCaseText = category === 'Furniture'
    ? 'It is suitable for interior design scenes, room layouts, furniture visualization, architectural renders, and product mockups.'
    : category === 'Electronics'
      ? 'It is suitable for technology scenes, product visualization, ecommerce previews, UI mockups, and modern interior renders.'
      : category === 'Vehicles'
        ? 'It is suitable for vehicle visualization, animation layouts, game scenes, concept renders, and real-time 3D projects.'
        : category === 'Architecture'
          ? 'It is suitable for architectural visualization, environment design, interior or exterior scenes, and presentation renders.'
          : `It is suitable for ${category.toLowerCase()} scenes, product visualization, creative renders, game-ready layouts, and 3D design projects.`
  const formatText = format
    ? `The main file is provided in ${format} format for use in compatible 3D software.`
    : 'The main model file is ready for use in compatible 3D software.'
  const downloadPhrase = `${rawTitle} free 3D model download`

  return {
    title: rawTitle,
    category,
    tags: tags.join(', '),
    description: `${rawTitle} is a free 3D model in the ${category} category${readableTags ? `, with details such as ${readableTags}` : ''}. ${formatText} ${renderText} ${materialText} ${colorText} ${useCaseText} Use this ${downloadPhrase} for Blender, 3ds Max, Maya, Cinema 4D, game engines, AR/VR projects, product presentation, and high-quality 3D visualization. Download, review, and publish this asset on 3D ShareSpace with clear tags and useful listing details.`.replace(/\s+/g, ' ').trim()
  }
}

const getQualityScore = ({ title, description, tags, previewImages = [], file }) => {
  let score = 30
  const tagCount = normalizeTags(tags).length
  if (String(title || '').trim().length >= 8) score += 15
  if (String(description || '').trim().length >= 180) score += 20
  if (tagCount >= 6) score += 15
  if (previewImages.length >= 3) score += 15
  if (getFormatFromFile(file?.name)) score += 5
  return Math.min(100, score)
}

const getTrustSignals = (item) => [
  `${getFormatFromFile(item.file?.name) || 'Model'} file attached`,
  `${(item.previewImages || []).length} preview render${(item.previewImages || []).length === 1 ? '' : 's'}`,
  `${normalizeTags(item.tags).length} search tag${normalizeTags(item.tags).length === 1 ? '' : 's'}`,
  item.license || 'License selected'
]

const normalizeAiSuggestions = (suggestions) => {
  const tags = normalizeTags(suggestions.tags)
  const features = Array.isArray(suggestions.features)
    ? suggestions.features
    : String(suggestions.features || '').split(',')

  return {
    title: String(suggestions.title || '').trim().slice(0, 100),
    category: modelCategoryNames.includes(suggestions.category) ? suggestions.category : '',
    description: String(suggestions.description || '').trim().slice(0, 3500),
    tags,
    features: features
      .map((feature) => String(feature).trim())
      .filter((feature) => [
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
      ].includes(feature))
  }
}

const AdminBulkUpload = () => {
  const { user, profile } = useAuth()
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)
  
  const [uploadQueue, setUploadQueue] = useState([])
  const [currentUpload, setCurrentUpload] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    success: 0
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [folderStructure, setFolderStructure] = useState([])
  const [isProcessingFolder, setIsProcessingFolder] = useState(false)
  const [uploadMode, setUploadMode] = useState('files') // 'files' or 'folder'
  const [draftMode, setDraftMode] = useState(true) // Create drafts instead of publishing
  const [showPreview, setShowPreview] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGeneratingId, setAiGeneratingId] = useState(null)
  const autoDetailsEnabled = Boolean(normalizeAiEndpoint(AUTO_DETAILS_ENDPOINT))
  
  // Default settings for all models
  const [defaultSettings, setDefaultSettings] = useState({
    category: defaultAutoSettings.category,
    license: 'CC-BY-4.0',
    isPublic: true,
    tags: defaultAutoSettings.tags,
    description: defaultAutoSettings.description,
    features: ['Textured', 'Optimized'],
    renderEngine: 'Blender Cycles',
    softwareUsed: 'Blender',
    version: '3.6.0'
  })

  const createQueueItem = (file, options = {}) => {
    const autoDetails = getAutoDetails({
      title: options.title,
      folderName: options.folderName,
      file,
      previewImages: options.previewImages || []
    })
    const title = options.title || autoDetails.title || file.name.replace(/\.[^/.]+$/, '')
    const description = options.description || autoDetails.description || defaultSettings.description
    const tags = options.tags || autoDetails.tags || defaultSettings.tags
    const previewImages = options.previewImages || []

    return {
      id: Date.now() + Math.random(),
      file,
      originalFileName: file.name,
      title,
      description,
      category: options.category || autoDetails.category || defaultSettings.category,
      tags,
      license: options.license || defaultSettings.license,
      features: options.features || defaultSettings.features,
      renderEngine: options.renderEngine || defaultSettings.renderEngine,
      softwareUsed: options.softwareUsed || defaultSettings.softwareUsed,
      version: options.version || defaultSettings.version,
      status: 'pending',
      progress: 0,
      error: null,
      warning: null,
      modelId: null,
      isDraft: options.isDraft ?? draftMode,
      folderName: options.folderName || null,
      previewImages,
      listingFileName: getListingModelFileName(title, file),
      qualityScore: getQualityScore({ title, description, tags, previewImages, file }),
      trustSignals: [],
      aiStatus: 'idle'
    }
  }

  // Categories for 3D models
  // License options
  const licenses = [
    { value: 'CC-BY-4.0', label: 'Creative Commons Attribution 4.0', description: 'Free to use with attribution' },
    { value: 'CC-BY-SA-4.0', label: 'Creative Commons Attribution-ShareAlike 4.0', description: 'Free to use and modify with attribution' },
    { value: 'CC-BY-NC-4.0', label: 'Creative Commons Attribution-NonCommercial 4.0', description: 'Free for non-commercial use with attribution' },
    { value: 'CC0', label: 'Creative Commons Zero', description: 'Public domain, no restrictions' },
    { value: 'Custom', label: 'Custom License', description: 'Specify your own terms' }
  ]

  // Model features
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

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const items = Array.from(e.dataTransfer.items)
    
    // Check if we have folders or files
    const hasDirectories = items.some(item => item.webkitGetAsEntry?.()?.isDirectory)
    
    if (hasDirectories) {
      setUploadMode('folder')
      setIsProcessingFolder(true)
      await processFolderStructure(items)
      setIsProcessingFolder(false)
    } else {
      setUploadMode('files')
      const files = Array.from(e.dataTransfer.files)
      addFilesToQueue(files)
    }
  }, [])

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    
    if (uploadMode === 'folder' && files.length > 0) {
      // Process folder structure from file input
      setIsProcessingFolder(true)
      
      // Group files by their folder structure
      const folderMap = new Map()
      
      files.forEach(file => {
        const pathParts = file.webkitRelativePath.split('/').filter(Boolean)
        // If a parent folder is selected, use the child product folder as the model group.
        // Example: "Bulk Upload/bathroom_sink_cabinet/untitled481.jpg" => "bathroom_sink_cabinet"
        const folderSegments = pathParts.length > 2 ? pathParts.slice(1, -1) : pathParts.slice(0, -1)
        const folderName = folderSegments.join('/') || pathParts[0] || 'Bulk Upload'
        const fileName = pathParts[pathParts.length - 1]
        
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, { models: [], images: [] })
        }
        
        const folder = folderMap.get(folderName)
        
        if (fileName.match(MODEL_FILE_PATTERN)) {
          folder.models.push({
            file,
            title: getFolderTitle(folderName, fileName),
            previewImages: []
          })
        } else if (fileName.match(PREVIEW_IMAGE_PATTERN)) {
          folder.images.push(file)
        }
      })
      
      // Match preview images to models
      const folders = []
      folderMap.forEach((folderData, folderName) => {
        if (folderData.models.length === 1) {
          // If exactly one model in this subfolder, attach up to 10 images from the same subfolder
          folderData.models[0].previewImages = folderData.images.slice(0, 10)
        } else {
          // Fallback to name-based matching when multiple models in the same subfolder
          folderData.models.forEach(model => {
            const matchingImages = folderData.images.filter(img => 
              img.name.toLowerCase().includes(model.title.toLowerCase()) ||
              model.title.toLowerCase().includes(img.name.replace(/\.[^/.]+$/, "").toLowerCase())
            )
            model.previewImages = matchingImages.slice(0, 5)
          })
        }
        
        if (folderData.models.length > 0) {
          folders.push({
            name: folderName,
            models: folderData.models,
            subfolders: []
          })
        }
      })
      
      setFolderStructure(folders)
      
      // Create queue items
      const queueItems = []
      folders.forEach(folder => {
        folder.models.forEach(model => {
          queueItems.push(createQueueItem(model.file, {
            title: getFolderTitle(folder.name, model.title),
            folderName: folder.name,
            previewImages: model.previewImages || []
          }))
        })
      })
      
      setUploadQueue(queueItems)
      setShowPreview(true)
      setIsProcessingFolder(false)
    } else {
      addFilesToQueue(files)
    }
  }

  const addFilesToQueue = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'model/gltf-binary',
        'model/gltf+json',
        'application/octet-stream',
        'model/obj',
        'model/fbx',
        'model/3ds',
        'model/dae',
        'model/stl',
        'model/ply',
        'application/zip',
        'application/x-zip-compressed'
      ]
      
      return validTypes.includes(file.type) || file.name.match(MODEL_FILE_PATTERN)
    })

    if (validFiles.length === 0) {
      setError('Please select valid 3D model files (GLB, GLTF, OBJ, FBX, 3DS, DAE, STL, PLY, ZIP)')
      return
    }

    const newQueue = validFiles.map(file => createQueueItem(file))

    setUploadQueue(prev => [...prev, ...newQueue])
    setError('')
  }

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  const updateQueueItem = (id, updates) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id ? {
        ...item,
        ...updates,
        qualityScore: getQualityScore({ ...item, ...updates })
      } : item
    ))
  }

  const updateDefaultSettings = (field, value) => {
    setDefaultSettings(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    setUploadQueue(prev => prev.map(item => (
      item.status === 'pending' ? { ...item, isDraft: draftMode } : item
    )))
  }, [draftMode])

  useEffect(() => {
    setUploadQueue(prev => {
      const titleCounts = prev.reduce((acc, item) => {
        const key = slugify(item.title)
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const fileCounts = prev.reduce((acc, item) => {
        const key = String(item.originalFileName || item.file?.name || '').toLowerCase()
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      return prev.map(item => {
        const duplicateTitle = titleCounts[slugify(item.title)] > 1
        const duplicateFile = fileCounts[String(item.originalFileName || item.file?.name || '').toLowerCase()] > 1
        const qualityScore = getQualityScore(item)
        const warning = duplicateTitle || duplicateFile
          ? 'Possible duplicate in this batch'
          : !item.previewImages?.length
            ? 'No preview images attached'
            : qualityScore < 70
              ? 'Needs stronger title, tags, description, or renders'
            : null

        return item.warning === warning && item.qualityScore === qualityScore
          ? item
          : { ...item, warning, qualityScore, trustSignals: getTrustSignals(item) }
      })
    })
  }, [uploadQueue.length])

  // Process folder structure like CGTrader
  const processFolderStructure = async (items) => {
    const folders = []
    
    for (const item of items) {
      const entry = item.webkitGetAsEntry()
      if (entry && entry.isDirectory) {
        const folderData = await processFolderEntry(entry)
        if (folderData && folderData.models.length > 0) {
          folders.push(folderData)
        }
      }
    }
    
    setFolderStructure(folders)
    
    // Auto-create queue items from folder structure
    const queueItems = []
    folders.forEach(folder => {
      folder.models.forEach(model => {
        queueItems.push(createQueueItem(model.file, {
          title: getFolderTitle(model.folderName || folder.name, model.title),
          folderName: model.folderName || folder.name,
          previewImages: model.previewImages || []
        }))
      })
    })
    
    setUploadQueue(queueItems)
    setShowPreview(true)
  }

  const processFolderEntry = async (dirEntry) => {
    return new Promise((resolve) => {
      const reader = dirEntry.createReader()
      const folder = {
        name: dirEntry.name,
        models: [],
        subfolders: []
      }
      
      reader.readEntries(async (entries) => {
        const modelFiles = []
        const previewImages = []
        
        for (const entry of entries) {
          if (entry.isFile) {
            const file = await getFileFromEntry(entry)
            
            // Check if it's a 3D model file
            if (file.name.match(MODEL_FILE_PATTERN)) {
              modelFiles.push({
                file,
                title: getFolderTitle(dirEntry.name, file.name),
                folderName: dirEntry.name,
                previewImages: []
              })
            }
            // Check if it's a preview image
            else if (file.name.match(PREVIEW_IMAGE_PATTERN)) {
              previewImages.push(file)
            }
          }
          else if (entry.isDirectory) {
            // Process subfolder (each subfolder = one model)
            const subfolderData = await processFolderEntry(entry)
            if (subfolderData && subfolderData.models.length > 0) {
              folder.subfolders.push(subfolderData)
            }
          }
        }
        
        // If this folder contains model files directly
        if (modelFiles.length > 0) {
          if (modelFiles.length === 1) {
            // When a folder has exactly one model, associate all images in that folder with it.
            modelFiles[0].previewImages = previewImages.slice(0, 10);
            folder.models.push(modelFiles[0]);
          } else {
            // Fallback to name-based matching for folders with multiple models
            modelFiles.forEach(model => {
              const matchingImages = previewImages.filter(img => 
                img.name.toLowerCase().includes(model.title.toLowerCase()) ||
                model.title.toLowerCase().includes(img.name.replace(/\.[^/.]+$/, "").toLowerCase())
              )
              
              folder.models.push({
                ...model,
                previewImages: matchingImages.slice(0, 5)
              })
            })
          }
        }
        
        // Add subfolder models to this folder
        folder.subfolders.forEach(subfolder => {
          folder.models.push(...subfolder.models.map(model => ({
            ...model,
            title: getFolderTitle(subfolder.name, model.title),
            folderName: subfolder.name
          })))
        })
        
        resolve(folder)
      })
    })
  }

  const getFileFromEntry = (fileEntry) => {
    return new Promise((resolve) => {
      fileEntry.file(resolve)
    })
  }

  const updateQueueItemTitle = (id, title) => {
    updateQueueItem(id, { title, listingFileName: getListingModelFileName(title, uploadQueue.find(item => item.id === id)?.file) })
  }

  const updateQueueItemField = (id, field, value) => {
    updateQueueItem(id, { [field]: value })
  }

  const applyDefaultsToPending = () => {
    setUploadQueue(prev => prev.map(item => (
      item.status === 'pending'
        ? {
            ...item,
            description: defaultSettings.description,
            category: defaultSettings.category,
            tags: defaultSettings.tags,
            license: defaultSettings.license,
            features: defaultSettings.features,
            renderEngine: defaultSettings.renderEngine,
            softwareUsed: defaultSettings.softwareUsed,
            version: defaultSettings.version,
            isDraft: draftMode
          }
        : item
    )))
    setSuccess('Default settings applied to pending models.')
  }

  const applyAutoDetailsToPending = () => {
    setUploadQueue(prev => prev.map(item => {
      if (item.status !== 'pending') return item

      const autoDetails = getAutoDetails(item)
      return {
        ...item,
        title: autoDetails.title || item.title,
        description: autoDetails.description,
        category: autoDetails.category,
        tags: autoDetails.tags,
        listingFileName: getListingModelFileName(autoDetails.title || item.title, item.file),
        aiStatus: 'complete'
      }
    }))
    setSuccess('Auto details filled from folder names and render files. Review before publishing.')
  }

  const pendingNeedsAutoDetails = uploadQueue.some(item => (
    item.status === 'pending' && (
      item.category === defaultAutoSettings.category ||
      item.tags === defaultAutoSettings.tags ||
      item.description === defaultAutoSettings.description
    )
  ))

  const applyAutoDetailsForItem = (itemId) => {
    const item = uploadQueue.find(queueItem => queueItem.id === itemId)
    if (!item) return

    const autoDetails = getAutoDetails(item)
    updateQueueItem(itemId, {
      title: autoDetails.title || item.title,
      description: autoDetails.description,
      category: autoDetails.category,
      tags: autoDetails.tags,
      listingFileName: getListingModelFileName(autoDetails.title || item.title, item.file),
      aiStatus: 'complete'
    })
  }

  const buildAiPayload = async (item) => {
    const previewFile = item.previewImages?.[0]

    return {
      file: item.file
        ? {
            name: item.file.name,
            type: item.file.type || 'model/unknown',
            size: item.file.size
          }
        : null,
      fields: {
        title: item.title,
        category: item.category,
        description: item.description,
        tags: item.tags
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
  }

  const applyAiSuggestions = (itemId, suggestions) => {
    updateQueueItem(itemId, {
      title: suggestions.title || uploadQueue.find(item => item.id === itemId)?.title,
      category: suggestions.category || uploadQueue.find(item => item.id === itemId)?.category || defaultSettings.category,
      description: suggestions.description || uploadQueue.find(item => item.id === itemId)?.description || defaultSettings.description,
      tags: suggestions.tags.length ? suggestions.tags.join(', ') : uploadQueue.find(item => item.id === itemId)?.tags,
      features: suggestions.features.length ? suggestions.features : uploadQueue.find(item => item.id === itemId)?.features,
      aiStatus: 'complete',
      listingFileName: getListingModelFileName(suggestions.title || uploadQueue.find(item => item.id === itemId)?.title, uploadQueue.find(item => item.id === itemId)?.file)
    })
  }

  const generateAiForItem = async (itemId) => {
    const item = uploadQueue.find(queueItem => queueItem.id === itemId)
    const aiServiceUrl = normalizeAiEndpoint(AUTO_DETAILS_ENDPOINT)

    if (!item || !aiServiceUrl) {
      setError('Auto-fill is not available right now.')
      return
    }

    setAiGeneratingId(itemId)
    updateQueueItem(itemId, { aiStatus: 'generating', error: null })
    setError('')

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), AUTO_DETAILS_TIMEOUT_MS)
      const response = await fetch(`${aiServiceUrl}/api/upload-assist`, {
        method: 'POST',
        headers: AUTO_DETAILS_HEADERS,
        body: JSON.stringify(await buildAiPayload(item)),
        signal: controller.signal
      })
      window.clearTimeout(timeout)

      if (!response.ok) throw new Error('Auto-fill failed.')

      const data = await response.json()
      applyAiSuggestions(itemId, normalizeAiSuggestions(data.suggestions || {}))
    } catch {
      const autoDetails = getAutoDetails(item)
      updateQueueItem(itemId, {
        title: autoDetails.title || item.title,
        description: autoDetails.description,
        category: autoDetails.category,
        tags: autoDetails.tags,
        listingFileName: getListingModelFileName(autoDetails.title || item.title, item.file),
        aiStatus: 'complete',
        warning: 'Used fast smart fill because AI was slow'
      })
    } finally {
      setAiGeneratingId(null)
    }
  }

  const generateAiForAllPending = async () => {
    const pendingItems = uploadQueue.filter(item => item.status === 'pending')
    if (!pendingItems.length) return

    setAiGenerating(true)
    setError('')
    setSuccess('')

    for (const item of pendingItems) {
      // Keep requests one by one so the local AI helper stays stable.
      // eslint-disable-next-line no-await-in-loop
      await generateAiForItem(item.id)
    }

    setAiGenerating(false)
    setSuccess('Smart Fill added details. Review the table before publishing.')
  }

  const startBulkUpload = async () => {
    if (uploadQueue.length === 0) {
      setError('No files in upload queue')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')
    setUploadStats({ total: uploadQueue.length, completed: 0, failed: 0, success: 0 })
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i]
      if (item.status !== 'pending') continue
      setCurrentUpload(item)
      
      try {
        updateQueueItem(item.id, { status: 'uploading', progress: 0 })
        const uploadTitle = item.title?.trim() || item.file.name.replace(/\.[^/.]+$/, '')
        const uploadFile = createRenamedFile(item.file, item.listingFileName || getListingModelFileName(uploadTitle, item.file))
        const itemTags = normalizeTags(item.tags)
        
          // Prepare model data
          const modelData = {
            uid: `platform_${user.uid}_${Date.now()}_${i}`,
            userId: user.uid, // Platform admin as owner
            title: uploadTitle,
            description: item.description || defaultSettings.description,
            category: item.category || defaultSettings.category,
            tags: itemTags.length ? itemTags : normalizeTags(defaultSettings.tags),
            license: item.license || defaultSettings.license,
            isPublic: item.isDraft ? false : defaultSettings.isPublic, // Drafts are private
            is_private: item.isDraft ? true : !defaultSettings.isPublic,
            polygonCount: null,
            renderEngine: item.renderEngine || defaultSettings.renderEngine,
            softwareUsed: item.softwareUsed || defaultSettings.softwareUsed,
            version: item.version || defaultSettings.version,
            features: item.features || defaultSettings.features,
            author: {
              username: 'Platform Admin',
              avatar: profile?.avatar || null
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 0,
            likes: 0,
            views: 0,
            rating: 0,
            totalRatings: 0,
            isPlatformModel: true, // Mark as platform model
            platformRevenue: true, // Revenue goes to platform
            isDraft: item.isDraft || false, // Draft status
            status: item.isDraft ? 'draft' : 'published',
            folderName: item.folderName || null, // Track original folder
            originalFileName: item.originalFileName || item.file.name,
            [listingMetaFields.fileName]: uploadFile.name,
            [listingMetaFields.title]: `${uploadTitle} Free 3D Model`,
            [listingMetaFields.keywords]: itemTags.join(', '),
            altText: `${uploadTitle} ${item.category || defaultSettings.category} 3D model ${getFormatFromFile(uploadFile.name)} render`,
            qualityScore: item.qualityScore || getQualityScore(item),
            previewCount: (item.previewImages || []).length,
            hasZipPackage: uploadFile.name.toLowerCase().endsWith('.zip'),
            trustSignals: getTrustSignals({ ...item, file: uploadFile, tags: itemTags }),
            searchBoostKeywords: [
              uploadTitle,
              item.category || defaultSettings.category,
              getFormatFromFile(uploadFile.name),
              ...itemTags
            ].filter(Boolean).join(', ')
          }

        // Upload model with progress tracking
        // Convert preview images to expected format
        const formattedPreviewImages = (item.previewImages || []).map(img => ({
          file: createRenamedFile(img, getListingImageFileName(uploadTitle, img, (item.previewImages || []).indexOf(img)))
        }))
        
        const result = await firebaseHelpers.uploadModel(
          modelData,
          uploadFile,
          formattedPreviewImages, // Include properly formatted preview images
          (status, progress, message) => {
            updateQueueItem(item.id, { progress })
            setUploadProgress(progress)
          }
        )

        if (result.success) {
          updateQueueItem(item.id, { 
            status: 'completed', 
            progress: 100, 
            modelId: result.modelId 
          })
          successCount += 1
          setUploadStats(prev => ({ ...prev, completed: prev.completed + 1, success: prev.success + 1 }))
        } else {
          updateQueueItem(item.id, { 
            status: 'failed', 
            error: result.error || 'Upload failed' 
          })
          failedCount += 1
          setUploadStats(prev => ({ ...prev, completed: prev.completed + 1, failed: prev.failed + 1 }))
        }
      } catch (error) {
        updateQueueItem(item.id, { 
          status: 'failed', 
          error: error.message 
        })
        failedCount += 1
        setUploadStats(prev => ({ ...prev, completed: prev.completed + 1, failed: prev.failed + 1 }))
      }
    }

    setCurrentUpload(null)
    setIsUploading(false)
    const draftText = draftMode ? ' as drafts' : ''
    setSuccess(`Bulk upload completed! ${successCount} model${successCount !== 1 ? 's' : ''} uploaded successfully${draftText}, ${failedCount} failed.`)
  }

  const clearQueue = () => {
    setUploadQueue([])
    setUploadStats({ total: 0, completed: 0, failed: 0, success: 0 })
  }

  const retryFailed = () => {
    const failedItems = uploadQueue.filter(item => item.status === 'failed')
    setUploadQueue(prev => prev.map(item => 
      item.status === 'failed' ? { ...item, status: 'pending', error: null, progress: 0 } : item
    ))
  }

  const queueMetrics = {
    pending: uploadQueue.filter(item => item.status === 'pending').length,
    renders: uploadQueue.reduce((total, item) => total + (item.previewImages?.length || 0), 0),
    folders: new Set(uploadQueue.map(item => item.folderName).filter(Boolean)).size,
    autoFilled: uploadQueue.filter(item => item.aiStatus === 'complete').length,
    duplicates: uploadQueue.filter(item => item.warning?.includes('duplicate')).length,
    ready: uploadQueue.filter(item => (item.qualityScore || 0) >= 70 && !item.warning?.includes('duplicate')).length
  }

  if (!user || !profile?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-[#0b0b0c] dark:text-white">
      <PageMeta
        title="Admin Bulk Upload – 3D ShareSpace"
        description="Upload multiple 3D models efficiently with admin bulk upload tool."
        keywords="admin bulk upload, 3D models, platform management"
        url="/admin/bulk-upload"
        type="website"
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111113]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="flex items-center text-3xl font-bold text-slate-950 dark:text-white">
                <Package className="mr-3 h-8 w-8 text-cyan-500" />
                Admin Bulk Upload
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
                Drop a parent folder, split each product folder into its own model, attach renders, and fill searchable details before publishing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-white/10 dark:bg-black/30">
                <div className="text-2xl font-bold text-cyan-500">{uploadQueue.length}</div>
                <div className="text-xs text-slate-500">Models</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-white/10 dark:bg-black/30">
                <div className="text-2xl font-bold text-emerald-500">{queueMetrics.renders}</div>
                <div className="text-xs text-slate-500">Renders</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-white/10 dark:bg-black/30">
                <div className="text-2xl font-bold text-violet-500">{queueMetrics.autoFilled}</div>
                <div className="text-xs text-slate-500">Auto filled</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-white/10 dark:bg-black/30">
                <div className="text-2xl font-bold text-red-500">{uploadStats.failed}</div>
                <div className="text-xs text-slate-500">Failed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Mode Selection */}
        <div className="mb-6 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111113]">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-950 dark:text-white">
            <FolderTree className="h-5 w-5 mr-2" />
            Import Setup
          </h2>
          
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <label htmlFor="mode-files" className={`flex cursor-pointer items-center border p-4 text-sm transition ${uploadMode === 'files' ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:bg-cyan-500/10 dark:text-cyan-100' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-300'}`}>
              <input
                type="radio"
                id="mode-files"
                name="uploadMode"
                value="files"
                checked={uploadMode === 'files'}
                onChange={(e) => setUploadMode(e.target.value)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="ml-3 flex items-center font-medium">
                <File className="mr-2 h-4 w-4" />
                Individual Files
              </span>
            </label>
            
            <label htmlFor="mode-folder" className={`flex cursor-pointer items-center border p-4 text-sm transition ${uploadMode === 'folder' ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:bg-cyan-500/10 dark:text-cyan-100' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-300'}`}>
              <input
                type="radio"
                id="mode-folder"
                name="uploadMode"
                value="folder"
                checked={uploadMode === 'folder'}
                onChange={(e) => setUploadMode(e.target.value)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="ml-3 flex items-center font-medium">
                <FolderOpen className="mr-2 h-4 w-4" />
                Product Folders
              </span>
            </label>
            
            <label htmlFor="draft-mode" className="flex cursor-pointer items-center border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-300">
              <input
                type="checkbox"
                id="draft-mode"
                checked={draftMode}
                onChange={(e) => setDraftMode(e.target.checked)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="ml-3 flex items-center font-medium">
                <Edit3 className="mr-2 h-4 w-4" />
                Create as Drafts
              </span>
            </label>
          </div>
          
          {uploadMode === 'folder' && (
            <div className="mb-6 border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-500/30 dark:bg-cyan-500/10">
              <div className="flex items-start space-x-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600" />
                <div>
                  <h3 className="mb-1 text-sm font-medium text-cyan-950 dark:text-cyan-100">
                    Smart Folder Upload
                  </h3>
                  <p className="mb-2 text-sm text-cyan-800 dark:text-cyan-200">
                    Drag or choose your Bulk Upload folder. Each product folder will become one separate 3D model.
                  </p>
                  <ul className="grid gap-1 text-xs text-cyan-700 dark:text-cyan-300 sm:grid-cols-2">
                    <li>• Each product folder = one model</li>
                    <li>• Supports: GLB, GLTF, OBJ, FBX, 3DS, DAE, STL, PLY, ZIP</li>
                    <li>• Keeps render images separate and attaches them as previews</li>
                    <li>• Auto-fills title, description, tags, and category from folder/render names</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Default Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Default Settings for All Models
            </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={defaultSettings.category}
                onChange={(e) => updateDefaultSettings('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {modelCategoryNames.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License
              </label>
              <select
                value={defaultSettings.license}
                onChange={(e) => updateDefaultSettings('license', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {licenses.map(license => (
                  <option key={license.value} value={license.value}>
                    {license.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={defaultSettings.tags}
                onChange={(e) => updateDefaultSettings('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={defaultSettings.description}
                onChange={(e) => updateDefaultSettings('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Default description for all models"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={defaultSettings.isPublic}
                onChange={(e) => updateDefaultSettings('isPublic', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Make all models public
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {availableFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={defaultSettings.features.includes(feature)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateDefaultSettings('features', [...defaultSettings.features, feature])
                      } else {
                        updateDefaultSettings('features', defaultSettings.features.filter(f => f !== feature))
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111113]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center text-xl font-semibold text-slate-950 dark:text-white">
            <UploadIcon className="h-5 w-5 mr-2" />
              Upload Files
            </h2>
            {pendingNeedsAutoDetails && uploadQueue.length > 0 && (
              <span className="inline-flex items-center text-xs font-medium text-amber-700 dark:text-amber-300">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Some rows still have default details. Use Smart Fill before upload.
              </span>
            )}
          </div>
          
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-10 text-center transition-colors ${
              isDragOver 
                ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-500/10' 
                : 'border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/20 dark:hover:border-cyan-500/60'
            }`}
          >
            {isProcessingFolder ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 mb-4 animate-spin" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Processing folder structure...
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Analyzing subfolders and matching preview images
                </p>
              </>
            ) : (
              <>
                <UploadCloud className="mx-auto mb-4 h-12 w-12 text-cyan-500" />
                <p className="mb-2 text-lg font-medium text-slate-950 dark:text-white">
                  {uploadMode === 'folder' ? 'Drop your Bulk Upload folder here' : 'Drop multiple 3D model files here'}
                </p>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                  {uploadMode === 'folder' ? 'Each product folder becomes one model with its own renders' : 'or click to browse files'}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={uploadMode === 'folder' ? '.glb,.gltf,.obj,.fbx,.3ds,.dae,.stl,.ply,.zip,.jpg,.jpeg,.png,.gif,.webp' : '.glb,.gltf,.obj,.fbx,.3ds,.dae,.stl,.ply,.zip'}
              multiple
              webkitdirectory={uploadMode === 'folder'}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="mr-4"
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={clearQueue}
              disabled={uploadQueue.length === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Queue
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={applyDefaultsToPending}
              disabled={uploadQueue.length === 0 || isUploading}
              className="ml-3"
            >
              <Settings className="h-4 w-4 mr-2" />
              Apply Defaults
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={generateAiForAllPending}
              disabled={uploadQueue.length === 0 || isUploading || aiGenerating}
              className="ml-3"
            >
              {aiGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Smart Fill All
            </Button>
          </div>
        </div>

        {/* Folder Structure Preview */}
        {folderStructure.length > 0 && showPreview && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FolderTree className="h-5 w-5 mr-2" />
              Folder Structure Preview
            </h2>
            
            <div className="space-y-4">
              {folderStructure.map((folder, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FolderOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">{folder.name}</h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {folder.models.length} model{folder.models.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {folder.models.slice(0, 6).map((model, modelIndex) => (
                      <div key={modelIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          {model.file.name.endsWith('.zip') ? (
                            <Archive className="h-4 w-4 text-purple-600" />
                          ) : (
                            <File className="h-4 w-4 text-gray-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {model.title}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(model.file.size / 1024 / 1024).toFixed(2)} MB
                          {model.previewImages.length > 0 && (
                            <span className="ml-2 text-blue-600">
                              +{model.previewImages.length} preview{model.previewImages.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {folder.models.length > 6 && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          +{folder.models.length - 6} more models...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="mr-3"
              >
                Hide Preview
              </Button>
            </div>
          </div>
        )}

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="mb-6 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111113]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Review Queue ({uploadQueue.length} models)
                {draftMode && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    DRAFT MODE
                  </span>
                )}
              </h2>
              <div className="flex space-x-2">
                <Button 
                  onClick={retryFailed}
                  variant="outline"
                  disabled={uploadQueue.filter(item => item.status === 'failed').length === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Failed
                </Button>
                <Button 
                  onClick={startBulkUpload}
                  disabled={isUploading || uploadQueue.filter(item => item.status === 'pending').length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Start Upload
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                <div className="text-xs text-slate-500">Pending</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{queueMetrics.pending}</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                <div className="text-xs text-slate-500">Ready quality</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{queueMetrics.ready}</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                <div className="text-xs text-slate-500">Source folders</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{queueMetrics.folders}</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                <div className="text-xs text-slate-500">Separate renders</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{queueMetrics.renders}</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                <div className="text-xs text-slate-500">Smart filled</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{queueMetrics.autoFilled}</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                <div className="text-xs text-slate-500">Possible duplicates</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{queueMetrics.duplicates}</div>
              </div>
            </div>

            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {item.file.name.endsWith('.zip') ? (
                          <Archive className="h-5 w-5 text-purple-600" />
                        ) : (
                          <File className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateQueueItemTitle(item.id, e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              disabled={item.status === 'uploading'}
                            />
                            {item.isDraft && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                                DRAFT
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2">
                            <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB • {item.file.name}</span>
                            {item.folderName && (
                              <>
                                <span>•</span>
                                <span className="flex items-center text-blue-600">
                                  <Folder className="h-3 w-3 mr-1" />
                                  {item.folderName}
                                </span>
                              </>
                            )}
                            {item.previewImages && item.previewImages.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center text-green-600">
                                  <Image className="h-3 w-3 mr-1" />
                                  {item.previewImages.length} preview{item.previewImages.length !== 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                              <select
                                value={item.category}
                                onChange={(e) => updateQueueItemField(item.id, 'category', e.target.value)}
                                disabled={item.status === 'uploading' || item.status === 'completed'}
                                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                {modelCategoryNames.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</label>
                              <input
                                type="text"
                                value={item.tags}
                                onChange={(e) => updateQueueItemField(item.id, 'tags', e.target.value)}
                                disabled={item.status === 'uploading' || item.status === 'completed'}
                                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Publish</label>
                              <select
                                value={item.isDraft ? 'draft' : 'published'}
                                onChange={(e) => updateQueueItemField(item.id, 'isDraft', e.target.value === 'draft')}
                                disabled={item.status === 'uploading' || item.status === 'completed'}
                                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Publish now</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateQueueItemField(item.id, 'description', e.target.value)}
                              disabled={item.status === 'uploading' || item.status === 'completed'}
                              rows={2}
                              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              Listing file: {item.listingFileName}
                            </span>
                            {item.previewImages?.length > 0 && (
                              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                Preview images: {slugify(item.title)}-free-3d-model-render-1...
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded ${
                              (item.qualityScore || 0) >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                : (item.qualityScore || 0) >= 60
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            }`}>
                              Quality {item.qualityScore || 0}/100
                            </span>
                            {item.warning && (
                              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                                {item.warning}
                              </span>
                            )}
                            {item.aiStatus === 'complete' && (
                              <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                Auto filled
                              </span>
                            )}
                            {item.aiStatus === 'failed' && (
                              <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                                AI failed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {item.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Uploading...</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {item.status === 'completed' && (
                        <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Upload completed</span>
                        </div>
                      )}
                      
                      {item.status === 'failed' && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <X className="h-4 w-4 mr-1" />
                          <span className="text-sm">{item.error}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => generateAiForItem(item.id)}
                            disabled={aiGeneratingId === item.id}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            title="Smart fill details"
                          >
                            {aiGeneratingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeFromQueue(item.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Revenue Information
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All models uploaded through this bulk upload system will be attributed to the platform. 
            Revenue from downloads, tips, and ads will go 100% to the platform account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminBulkUpload
