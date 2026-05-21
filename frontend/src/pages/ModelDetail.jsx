import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers, db } from '../lib/firebase'
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import TipButton from '../components/ui/TipButton'
import { Button } from '../components/ui/Button'
import ReportButton from '../components/moderation/ReportButton'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import PageMeta from '../components/PageMeta'
import {
  getAbsoluteUrl,
  getModelAltText,
  getModelFileFormat,
  getModelImagePageUrl,
  getModelSeoDescription,
  getModelSeoSlug,
  getModelSeoTitle,
  getModelUrl,
  SITE_ORIGIN,
  toIsoDate
} from '../lib/modelLinks'
import { 
  Download, 
  Heart, 
  Eye, 
  Star, 
  Share2, 
  Calendar, 
  Tag, 
  User, 
  Globe, 
  File, 
  Image,
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowLeft,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Sparkles,
  Flame,
  Zap,
  Target,
  TrendingUp,
  Award,
  Crown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Copy,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  FolderPlus
} from 'lucide-react'

const ModelDetailPage = () => {
  // Component initialization - ModelDetail v4.0 Enhanced
  const { modelId, slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -50])
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1])
  
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [relatedModels, setRelatedModels] = useState([])
  const [activeTab, setActiveTab] = useState('details')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [creatorProfile, setCreatorProfile] = useState(null)
  const [creatorStats, setCreatorStats] = useState({
    models: 0,
    downloads: 0,
    followers: 0
  })
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [likeAnimation, setLikeAnimation] = useState(false)
  const [bookmarkAnimation, setBookmarkAnimation] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [socialShareCopied, setSocialShareCopied] = useState('')
  const [collectionSaving, setCollectionSaving] = useState(false)
  const [collectionSaved, setCollectionSaved] = useState(false)

  // Calculate isOwner early to avoid hoisting issues
  const isOwner = user && model?.userId && user.uid === model.userId
  const siteOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : SITE_ORIGIN
  const modelUrl = model ? getModelUrl(model) : ''
  const currentImagePageUrl = model ? getModelImagePageUrl(model, currentImageIndex) : ''
  const modelImageUrls = Array.from(new Set([
    ...(Array.isArray(model?.previewImages) ? model.previewImages.map((image) => image?.url || image?.downloadURL || image?.src).filter(Boolean) : []),
    model?.thumbnail,
    model?.thumbnail_path,
    model?.thumbnailUrl,
    model?.imageUrl
  ].filter((image) => typeof image === 'string')))
  const previewImage = modelImageUrls[0] || '/favicon.svg'
  const absolutePreviewImage = getAbsoluteUrl(previewImage, siteOrigin)
  const absoluteModelImages = modelImageUrls.length
    ? modelImageUrls.map((image) => getAbsoluteUrl(image, siteOrigin))
    : [absolutePreviewImage]
  const publishedTime = toIsoDate(model?.createdAt)
  const modifiedTime = toIsoDate(model?.updatedAt || model?.createdAt)
  const creatorName = creatorProfile?.displayName || creatorProfile?.username || model?.creatorName || '3D ShareSpace Creator'
  const modelTags = Array.isArray(model?.tags) ? model.tags : []
  const modelFormat = model ? getModelFileFormat(model) : ''
  const modelSeoDescription = model ? getModelSeoDescription(model) : ''
  const modelLicense = model?.license || 'Free download'
  const modelFileSizeMb = model?.fileSize ? `${(Number(model.fileSize) / 1024 / 1024).toFixed(2)} MB` : ''
  const modelPreviewCount = modelImageUrls.length
  const trustChecks = [
    modelFormat ? `${modelFormat} file verified` : 'Download file attached',
    modelPreviewCount ? `${modelPreviewCount} preview render${modelPreviewCount === 1 ? '' : 's'}` : 'Preview pending',
    modelLicense ? `${modelLicense} license` : 'License available',
    model?.description?.length > 120 ? 'Detailed creator description' : 'Creator details available'
  ]
  const downloadDetails = [
    { label: 'Format', value: modelFormat || '3D model file' },
    { label: 'File size', value: modelFileSizeMb || 'Listed by creator' },
    { label: 'License', value: modelLicense },
    { label: 'Preview renders', value: `${modelPreviewCount || 0}` },
    { label: 'Category', value: model?.category || '3D Models' },
    { label: 'Creator', value: creatorName }
  ]
  const relatedSearchLinks = [
    model?.category ? { label: `Free ${model.category} 3D models`, to: `/free-3d-models/${String(model.category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}` } : null,
    modelFormat ? { label: `Free ${modelFormat} 3D models`, to: `/explore?q=${encodeURIComponent(modelFormat)}` } : null,
    ...modelTags.slice(0, 5).map((tag) => ({ label: `${tag} 3D models`, to: `/explore?q=${encodeURIComponent(tag)}` }))
  ].filter(Boolean)

  useEffect(() => {
    if (!model || !modelId) return

    const expectedSlug = getModelSeoSlug(model)
    if (slug === expectedSlug) return

    navigate(getModelUrl(model), { replace: true })
  }, [model, modelId, navigate, slug])

  // Real-time model data listener
  useEffect(() => {
    if (!modelId) return

    const unsubscribeModel = onSnapshot(
      doc(db, 'models', modelId),
      async (docSnap) => {
        if (docSnap.exists()) {
          const modelData = { id: docSnap.id, ...docSnap.data() }
          console.log('🔄 Model data updated:', modelData)
          setModel(modelData)
          
          // Fetch creator profile if we have a userId
          if (modelData.userId) {
            console.log('👤 Fetching creator profile for userId:', modelData.userId)
            const profileResult = await firebaseHelpers.getUserProfile(modelData.userId)
            console.log('👤 Creator profile result:', profileResult)
            
            if (profileResult.success) {
              console.log('✅ Creator profile loaded:', profileResult.profile)
              setCreatorProfile(profileResult.profile)
              
              // Get creator stats
              const statsResult = await firebaseHelpers.getUserStats(modelData.userId)
              console.log('📊 Creator stats result:', statsResult)
              if (statsResult.success) {
                setCreatorStats(statsResult.stats)
              }
            } else {
              console.log('❌ Failed to load creator profile:', profileResult.error)
            }
          }
          
          setLoading(false)
        } else {
          setError('Model not found')
          setLoading(false)
        }
      },
      (error) => {
        console.error('Error listening to model:', error)
        setError('Failed to load model')
        setLoading(false)
      }
    )

    return () => unsubscribeModel()
  }, [modelId])

  // View tracking system - counts view after 5 seconds on page
  useEffect(() => {
    if (!modelId) return

    console.log('👁️ Starting view tracking for model:', modelId)
    
    // Set timer for 5 seconds - this will run on every page load/refresh
    const viewTimer = setTimeout(async () => {
      try {
        console.log('👁️ 5 seconds elapsed, counting view for model:', modelId)
        await firebaseHelpers.incrementViews(modelId)
        
        // Update local state to show the increment
        setModel(prevModel => prevModel ? {
          ...prevModel,
          views: (prevModel.views || 0) + 1
        } : null)
        
        console.log('✅ View count incremented successfully after 5 seconds')
      } catch (error) {
        console.error('❌ Error incrementing views:', error)
      }
    }, 5000) // 5 seconds

    // Cleanup timer on unmount or modelId change
    return () => {
      clearTimeout(viewTimer)
    }
  }, [modelId])

  // Real-time statistics updater
  useEffect(() => {
    if (!modelId) return

    // Function to update statistics
    const updateModelStatistics = async () => {
      try {
        // Get likes count
        const likesQuery = query(collection(db, 'likes'), where('modelId', '==', modelId))
        const likesSnapshot = await getDocs(likesQuery)
        const likesCount = likesSnapshot.size

        const downloadsCount = model?.downloads || model?.downloads_count || 0

        // Get comments count
        const commentsQuery = query(collection(db, 'comments'), where('modelId', '==', modelId))
        const commentsSnapshot = await getDocs(commentsQuery)
        const commentsCount = commentsSnapshot.size

        // Update model with real-time statistics
        setModel(prevModel => {
          if (prevModel) {
            const updatedModel = {
              ...prevModel,
              likes: likesCount,
              downloads: downloadsCount
            }
            console.log('📊 Statistics updated:', { likes: likesCount, downloads: downloadsCount, comments: commentsCount })
            return updatedModel
          }
          return prevModel
        })

        // Update comments count
        setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (error) {
        console.error('Error updating statistics:', error)
      }
    }

    // Update immediately
    updateModelStatistics()

    // Set up real-time listeners for each collection
    const unsubscribeLikes = onSnapshot(
      query(collection(db, 'likes'), where('modelId', '==', modelId)),
      () => updateModelStatistics()
    )

    const unsubscribeComments = onSnapshot(
      query(collection(db, 'comments'), where('modelId', '==', modelId)),
      () => updateModelStatistics(),
      (error) => console.error('Error listening to comments:', error)
    )

    return () => {
      unsubscribeLikes()
      unsubscribeComments()
    }
  }, [modelId, model?.downloads, model?.downloads_count])

  // Check user like/bookmark status
  useEffect(() => {
    if (!user || !modelId) return

    const checkUserStatus = async () => {
      try {
        const [likeResult, bookmarkResult] = await Promise.all([
          firebaseHelpers.hasUserLiked(modelId, user.uid),
          firebaseHelpers.hasUserBookmarked(modelId, user.uid)
        ])
        
        if (likeResult.success) setLiked(likeResult.liked)
        if (bookmarkResult.success) setBookmarked(bookmarkResult.bookmarked)
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    checkUserStatus()
  }, [user, modelId])

  // Fetch related models
  useEffect(() => {
    if (!model) return

    const fetchRelatedModels = async () => {
      try {
        const result = await firebaseHelpers.getRelatedModels(modelId, model.category, model.userId, 16, model)
        if (result.success && result.models?.length) {
          setRelatedModels(result.models)
          return
        }

        const fallbackResult = await firebaseHelpers.getModels(model.category ? { category: model.category } : {})
        if (fallbackResult.success) {
          const fallbackModels = fallbackResult.models
            .filter((item) => item.id !== modelId && item.is_private !== true && item.isPublic !== false && item.status !== 'draft')
            .slice(0, 16)

          setRelatedModels(fallbackModels)
        }
      } catch (error) {
        console.error('Error fetching related models:', error)
      }
    }

    fetchRelatedModels()
  }, [model, modelId])

  // Check follow status when creator profile loads
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (model?.userId && user && !isOwner) {
        try {
          const result = await firebaseHelpers.checkFollowStatus(model.userId)
          if (result.success) {
            setIsFollowing(result.isFollowing)
          }
        } catch (error) {
          console.error('Error checking follow status:', error)
        }
      }
    }

    checkFollowStatus()
  }, [model?.userId, user?.uid])

  // Enhanced handler functions with animations
  const handleDownload = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setDownloading(true)
      setError('')

      const fileUrl = model?.fileURL || model?.file_url || model?.downloadURL || model?.fileUrl || model?.url

      if (!fileUrl) {
        setError('Download file is not available')
        return
      }

      const link = document.createElement('a')
      link.href = fileUrl
      link.download = model?.fileName || model?.title || '3d-model'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      const result = await firebaseHelpers.trackDownload(modelId, user.uid)

      if (!result.success) {
        console.warn('Download started, but tracking failed:', result.error)
      }

      setModel(prevModel => ({
        ...prevModel,
        downloads: (prevModel.downloads || 0) + 1
      }))
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download model')
    } finally {
      setDownloading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // Trigger like animation
    setLikeAnimation(true)
    setTimeout(() => setLikeAnimation(false), 600)

    // Optimistic update for instant feedback
    const newLiked = !liked
    const newLikeCount = newLiked ? (model?.likes || 0) + 1 : Math.max(0, (model?.likes || 1) - 1)
    
    // Update UI immediately for instant feedback
    setLiked(newLiked)
    setModel(prevModel => ({
      ...prevModel,
      likes: newLikeCount
    }))

    try {
      const result = await firebaseHelpers.toggleLike(modelId, user.uid)
      
      if (!result.success) {
        // Revert optimistic update if failed
        setLiked(!newLiked)
        setModel(prevModel => ({
          ...prevModel,
          likes: newLiked ? Math.max(0, (prevModel?.likes || 1) - 1) : (prevModel?.likes || 0) + 1
        }))
      }
    } catch (err) {
      console.error('Like error:', err)
      // Revert optimistic update if error
      setLiked(!newLiked)
      setModel(prevModel => ({
        ...prevModel,
        likes: newLiked ? Math.max(0, (prevModel?.likes || 1) - 1) : (prevModel?.likes || 0) + 1
      }))
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // Trigger bookmark animation
    setBookmarkAnimation(true)
    setTimeout(() => setBookmarkAnimation(false), 600)

    try {
      const result = await firebaseHelpers.toggleBookmark(modelId, user.uid)
      if (result.success) {
        setBookmarked(!bookmarked)
      }
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  const handleSaveToCollection = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setCollectionSaving(true)
      const result = await firebaseHelpers.saveModelToDefaultCollection(modelId, user.uid, model)
      if (result.success) {
        setCollectionSaved(true)
      } else {
        setError(result.error || 'Could not save to collection')
      }
    } catch (err) {
      console.error('Collection save error:', err)
      setError('Could not save to collection')
    } finally {
      setCollectionSaving(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      setSubmittingComment(true)
      const result = await firebaseHelpers.addComment(
        modelId, 
        user.uid, 
        newComment.trim(),
        user.displayName || user.email?.split('@')[0]
      )
      
      if (result.success) {
        // Add comment to local state
        const newCommentObj = {
          id: result.commentId,
          modelId,
          userId: user.uid,
          userDisplayName: user.displayName || user.email?.split('@')[0],
          comment: newComment.trim(),
          createdAt: new Date().toISOString(),
          likes: 0
        }
        setComments(prevComments => [newCommentObj, ...prevComments])
        setNewComment('')
      }
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: model?.title || '3D Model',
        text: model?.description || 'Check out this amazing 3D model!',
        url: window.location.href
      })
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  const copyToClipboard = async (text, type = 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setSocialShareCopied(type)
      setTimeout(() => setSocialShareCopied(''), 2000)
      setShowShareMenu(false)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const nextImage = () => {
    if (model && model.previewImages && model.previewImages.length > 1) {
      setImageLoading(true)
      setCurrentImageIndex((prevIndex) => 
        prevIndex === model.previewImages.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const previousImage = () => {
    if (model && model.previewImages && model.previewImages.length > 1) {
      setImageLoading(true)
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? model.previewImages.length - 1 : prevIndex - 1
      )
    }
  }

  const goToImage = (index) => {
    setImageLoading(true)
    setCurrentImageIndex(index)
  }

  const handleFollow = async () => {
    if (!model?.userId || !user || isOwner) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        const result = await firebaseHelpers.unfollowUser(model.userId)
        if (result.success) {
          setIsFollowing(false)
          setCreatorStats(prev => ({
            ...prev,
            followers: Math.max(0, prev.followers - 1)
          }))
        }
      } else {
        const result = await firebaseHelpers.followUser(model.userId)
        if (result.success) {
          setIsFollowing(true)
          setCreatorStats(prev => ({
            ...prev,
            followers: prev.followers + 1
          }))
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleDeleteModel = async () => {
    if (!user || !model) return
    
    setDeleting(true)
    try {
      const result = await firebaseHelpers.deleteModel(modelId, user.uid)
      if (result.success) {
        navigate(`/profile/${user.uid}`)
      } else {
        alert(result.error || 'Failed to delete model')
      }
    } catch (error) {
      console.error('Error deleting model:', error)
      alert('Failed to delete model. Please try again.')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 dark:bg-blue-600/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -150, 0],
              y: [0, 100, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 dark:bg-purple-600/20 rounded-full blur-xl"
          />
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full mx-auto mb-4"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full mx-auto"
              />
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-blue-500" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
          >
            Loading Amazing Model
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Preparing the perfect view for you...
          </motion.p>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Model Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The model you\'re looking for doesn\'t exist.'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Explore Models
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-950 dark:bg-black dark:text-white">
      {model && (
        <PageMeta
          title={getModelSeoTitle(model)}
          description={modelSeoDescription}
          keywords={`3D model, download, free, ${model.category || ''}, ${modelFormat}, ${modelTags.join(', ')}`}
          url={modelUrl}
          image={previewImage}
          type="article"
          publishedTime={publishedTime || ''}
          modifiedTime={modifiedTime || ''}
          tags={modelTags}
          jsonLd={[
            {
              '@context': 'https://schema.org',
              '@type': 'CreativeWork',
              name: model.title || '3D Model',
              description: modelSeoDescription,
              url: getAbsoluteUrl(modelUrl, siteOrigin),
              image: absoluteModelImages,
              thumbnailUrl: absolutePreviewImage,
              creator: {
                '@type': 'Person',
                name: creatorName,
                identifier: model.userId || undefined
              },
              author: {
                '@type': 'Person',
                name: creatorName,
                identifier: model.userId || undefined
              },
              datePublished: publishedTime,
              dateModified: modifiedTime,
              keywords: modelTags.length ? modelTags.join(', ') : undefined,
              genre: model.category || undefined,
              encodingFormat: modelFormat || undefined,
              license: modelLicense,
              isAccessibleForFree: true,
              interactionStatistic: [
                {
                  '@type': 'InteractionCounter',
                  interactionType: 'https://schema.org/ViewAction',
                  userInteractionCount: model.views || model.views_count || 0
                },
                {
                  '@type': 'InteractionCounter',
                  interactionType: 'https://schema.org/DownloadAction',
                  userInteractionCount: model.downloads || model.downloads_count || 0
                }
              ]
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: model.title || '3D Model',
              description: modelSeoDescription,
              image: absoluteModelImages,
              sku: model.id,
              category: model.category || undefined,
              brand: {
                '@type': 'Brand',
                name: '3D ShareSpace'
              },
              offers: {
                '@type': 'Offer',
                url: getAbsoluteUrl(modelUrl, siteOrigin),
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock'
              },
              aggregateRating: model.rating && model.totalRatings ? {
                '@type': 'AggregateRating',
                ratingValue: model.rating,
                reviewCount: model.totalRatings
              } : undefined
            },
            ...absoluteModelImages.map((image, index) => ({
              '@context': 'https://schema.org',
              '@type': 'ImageObject',
              contentUrl: image,
              url: image,
              thumbnailUrl: image,
              name: `${model.title || '3D Model'} render ${index + 1}`,
              caption: getModelAltText(model, `render image ${index + 1}`),
              representativeOfPage: index === 0,
              acquireLicensePage: getAbsoluteUrl(modelUrl, siteOrigin),
              creditText: '3D ShareSpace'
            })),
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: siteOrigin
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Explore',
                  item: `${siteOrigin}/explore`
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: model.title || '3D Model',
                  item: getAbsoluteUrl(modelUrl, siteOrigin)
                }
              ]
            }
          ]}
        />
      )}
      
      {/* Minimal Header */}
      <motion.div 
        style={{ y: headerY }}
        className="relative z-10 border-b border-gray-200 bg-white dark:border-gray-900 dark:bg-black"
      >
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              Home
            </Link>
            <span>/</span>
            <Link to="/explore" className="hover:text-gray-700 dark:hover:text-gray-300">
              Explore
            </Link>
            <span>/</span>
            <Link to={`/explore?category=${model.category || 'all'}`} className="hover:text-gray-700 dark:hover:text-gray-300">
              {model.category || 'All Models'}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{model.title || 'Untitled Model'}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {model.title || 'Untitled Model'}
                </motion.h1>
                <p className="text-gray-600 dark:text-gray-400">
                  by{' '}
                  {model?.isPlatformModel ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                      3D ShareSpace
                      <Crown className="h-3 w-3 ml-1" />
                    </span>
                  ) : (
                    <Link
                      to={`/profile/${creatorProfile?.username || model?.userId}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {creatorProfile?.username || creatorProfile?.displayName || 'Unknown'}
                    </Link>
                  )}
                </p>
              </div>
            </div>

            {/* Report Button */}
            {!isOwner && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const targetId = model?.id || modelId
                  window.location.href = `/report?modelId=${encodeURIComponent(targetId)}`
                }}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
                title="Report this model"
              >
                <AlertCircle className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Column */}
          <div className="space-y-5">
            {/* Model Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black"
            >
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center text-xl font-bold text-gray-900 dark:text-white"
                  >
                    <Image className="mr-3 h-5 w-5 text-gray-500" />
                    Preview
                  </motion.h2>
                  
                  {/* View controls */}
                  <div className="flex items-center space-x-2">
                    {currentImagePageUrl && (
                      <Link
                        to={currentImagePageUrl}
                        className="hidden items-center gap-2 border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-gray-300 dark:hover:border-white sm:flex"
                      >
                        <Image className="h-4 w-4" />
                        Image page
                      </Link>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`border p-2 transition-all ${autoRotate ? 'border-white bg-white text-black' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-gray-400 dark:hover:border-white'}`}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFullscreen(true)}
                      className="border border-gray-300 bg-white p-2 text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-gray-400 dark:hover:border-white"
                    >
                      <Maximize className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                
                {model.previewImages && model.previewImages.length > 0 ? (
                  <div className="space-y-6">
                    {/* Main Image Display */}
                    <motion.div 
                      style={{ scale: heroScale }}
                      className="relative aspect-w-16 aspect-h-9 overflow-hidden border border-gray-200 bg-gray-100 dark:border-gray-900 dark:bg-black"
                    >
                      <AnimatePresence mode="wait">
                        {imageLoading && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black"
                          >
                            <motion.div
                              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Loader2 className="h-12 w-12 text-white" />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        src={model.previewImages[currentImageIndex]?.url}
                        alt={getModelAltText(model, `preview ${currentImageIndex + 1}`)}
                        className="h-[300px] w-full bg-black object-contain sm:h-[360px]"
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                      
                      {/* Enhanced Navigation */}
                      {model.previewImages.length > 1 && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={previousImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/30 bg-black/40 p-3 text-white transition-all hover:bg-white hover:text-black"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, x: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/30 bg-black/40 p-3 text-white transition-all hover:bg-white hover:text-black"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </motion.button>
                          
                          {/* Enhanced Image Counter */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-3 right-3 border border-white/20 bg-black/70 px-3 py-2 text-sm font-medium text-white"
                          >
                            <span className="text-blue-300">{currentImageIndex + 1}</span>
                            <span className="mx-1 text-gray-300">/</span>
                            <span>{model.previewImages.length}</span>
                          </motion.div>
                          
                          {/* Progress bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <motion.div
                              className="h-full bg-white"
                              initial={{ width: 0 }}
                              animate={{ width: `${((currentImageIndex + 1) / model.previewImages.length) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </>
                      )}
                      
                    </motion.div>
                  
                    {/* Thumbnail Navigation */}
                    {model.previewImages.length > 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex space-x-2 overflow-x-auto pb-2"
                      >
                        {model.previewImages.map((image, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToImage(index)}
                            className={`h-16 w-16 flex-shrink-0 overflow-hidden border transition-all ${
                              index === currentImageIndex
                                ? 'border-white ring-1 ring-white'
                                : 'border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={getModelAltText(model, `thumbnail ${index + 1}`)}
                              className="w-full h-full object-cover"
                            />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  
                    {/* Enhanced Action Buttons */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleLike}
                          className={`relative overflow-hidden border p-3 transition-all duration-300 ${
                            liked 
                              ? 'border-white bg-white text-black' 
                              : 'border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:border-white'
                          }`}
                        >
                          <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''} transition-all duration-300 ${likeAnimation ? 'animate-bounce' : ''}`} />
                          {likeAnimation && (
                            <motion.div
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 0.6 }}
                              className="absolute inset-0 bg-red-500 rounded-full"
                            />
                          )}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleBookmark}
                          className={`relative overflow-hidden border p-3 transition-all duration-300 ${
                            bookmarked 
                              ? 'border-white bg-white text-black' 
                              : 'border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:border-white'
                          }`}
                        >
                          <Bookmark className={`h-6 w-6 ${bookmarked ? 'fill-current' : ''} transition-all duration-300 ${bookmarkAnimation ? 'animate-bounce' : ''}`} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleSaveToCollection}
                          disabled={collectionSaving}
                          className={`border p-3 transition-all duration-300 ${
                            collectionSaved
                              ? 'border-white bg-white text-black'
                              : 'border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:border-white'
                          }`}
                          title="Save to collection"
                        >
                          {collectionSaving ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : collectionSaved ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <FolderPlus className="h-6 w-6" />
                          )}
                        </motion.button>
                        
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleShare}
                            className="border border-gray-300 p-3 text-gray-500 transition-all duration-300 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:border-white"
                          >
                            <Share2 className="h-6 w-6" />
                          </motion.button>
                          
                          {/* Enhanced Share Menu */}
                          <AnimatePresence>
                            {showShareMenu && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute left-0 mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl py-3 z-20 border border-white/50 dark:border-gray-700/50"
                              >
                                <motion.button
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  onClick={() => copyToClipboard(window.location.href, 'link')}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                  <Copy className="h-4 w-4 mr-3 text-blue-500" />
                                  Copy Link
                                  {socialShareCopied === 'link' && (
                                    <motion.span
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="ml-auto text-green-500 text-xs"
                                    >
                                      Copied!
                                    </motion.span>
                                  )}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  onClick={() => copyToClipboard(`Check out this amazing 3D model: ${model.title} - ${window.location.href}`, 'text')}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                  <Send className="h-4 w-4 mr-3 text-green-500" />
                                  Share Text
                                  {socialShareCopied === 'text' && (
                                    <motion.span
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="ml-auto text-green-500 text-xs"
                                    >
                                      Copied!
                                    </motion.span>
                                  )}
                                </motion.button>
                                
                                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                                
                                <motion.button
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this amazing 3D model: ${model.title}&url=${window.location.href}`, '_blank')}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                  <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                                  Share on Twitter
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                  <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                                  Share on Facebook
                                </motion.button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      
                      {/* Report Button (for non-owners) */}
                      {!isOwner && (
                        <ReportButton
                          contentType="model"
                          contentId={model.id}
                          contentTitle={model.title || 'Untitled Model'}
                          contentAuthor={creatorProfile?.username || creatorProfile?.displayName || 'Unknown'}
                        />
                      )}
                      
                      {/* Edit Model Button for Owner */}
                      {isOwner && (
                        <Link to={`/model/${modelId}/edit`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center border border-white bg-white px-5 py-3 text-sm font-medium text-black transition-all hover:bg-gray-200"
                          >
                            Edit Model
                          </motion.button>
                        </Link>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center h-96">
                    <div className="text-center">
                      <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {relatedModels.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Related models</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Matched by model name, tags, and category.
                    </p>
                  </div>
                  <Link
                    to={`/explore?category=${encodeURIComponent(model.category || 'all')}`}
                    className="shrink-0 border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:border-white"
                  >
                    View more
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedModels.slice(0, 8).map((relatedModel) => (
                    <Link
                      key={relatedModel.id}
                      to={getModelUrl(relatedModel)}
                      className="group overflow-hidden border border-gray-200 bg-white transition-colors hover:border-gray-500 dark:border-gray-800 dark:bg-black dark:hover:border-white"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-950">
                        {relatedModel.previewImages?.length > 0 ? (
                          <img
                            src={relatedModel.previewImages[0].url}
                            alt={getModelAltText(relatedModel, 'related model preview')}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <File className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-1 text-sm font-bold text-gray-950 dark:text-white">
                          {relatedModel.title || 'Untitled model'}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                          {relatedModel.category || '3D Model'} {relatedModel.format ? `- ${relatedModel.format}` : ''}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {relatedModel.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3.5 w-3.5" />
                            {relatedModel.downloads || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {relatedModel.likes || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Enhanced Tabs Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
            >
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('comments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                      activeTab === 'comments'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="flex items-center">
                      Comments ({comments.length})
                      {comments.length > 0 && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="ml-2 w-2 h-2 bg-blue-500 rounded-full"
                        />
                      )}
                    </span>
                  </motion.button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Model Details</h3>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {downloadDetails.map((detail) => (
                          <div
                            key={detail.label}
                            className="border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black/40"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                              {detail.label}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-gray-950 dark:text-white">
                              {detail.value}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                      
                      {model.description && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {model.description}
                          </p>
                        </motion.div>
                      )}
                      
                      {model.tags && model.tags.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {model.tags.map((tag, index) => (
                              <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-full border border-blue-200 dark:border-blue-700 cursor-pointer transition-all"
                              >
                                #{tag}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {relatedSearchLinks.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.28 }}
                          className="border-t border-gray-200 pt-5 dark:border-gray-700"
                        >
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Related search pages</h4>
                          <div className="flex flex-wrap gap-2">
                            {relatedSearchLinks.map((link) => (
                              <Link
                                key={`${link.to}-${link.label}`}
                                to={link.to}
                                className="border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-gray-300 dark:hover:border-white"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'comments' && (
                    <motion.div
                      key="comments"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Enhanced Add Comment Form */}
                      {user && (
                        <motion.form 
                          onSubmit={handleComment} 
                          className="space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-800"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.displayName || user.email?.split('@')[0]}
                            </span>
                          </div>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this model..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                            rows="3"
                            required
                          />
                          <motion.button
                            type="submit"
                            disabled={submittingComment || !newComment.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                          >
                            {submittingComment ? (
                              <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Posting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Post Comment
                              </>
                            )}
                          </motion.button>
                        </motion.form>
                      )}

                      {/* Enhanced Comments List */}
                      <div className="space-y-4">
                        {comments.length > 0 ? (
                          <AnimatePresence>
                            {comments.map((comment, index) => (
                              <motion.div 
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:shadow-lg transition-all"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {comment.userDisplayName}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comment.comment}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No comments yet. Be the first to comment!</p>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Tip Creator After Comments */}
                      {!isOwner && user && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              Enjoyed this model? Show your appreciation!
                            </p>
                            <TipButton
                              creatorId={model.userId}
                              creatorName={model?.isPlatformModel ? 'Platform' : (creatorProfile?.username || creatorProfile?.displayName || 'Unknown')}
                              modelId={model.id}
                              modelTitle={model.title}
                              variant="default"
                              className="w-full"
                            />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Minimal Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 xl:sticky xl:top-24 xl:self-start"
          >
            <div className="border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black">
              <button
                onClick={handleDownload}
                disabled={downloading || !user}
                className="mb-4 flex w-full items-center justify-center gap-2 border border-white bg-white px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Downloading
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download model
                  </>
                )}
              </button>

              {!user && (
                <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  <Link to="/login" className="font-semibold text-gray-900 underline dark:text-white">
                    Sign in
                  </Link>{' '}
                  to download.
                </p>
              )}

              {relatedSearchLinks.length > 0 && (
                <div className="mb-4 border border-gray-200 p-3 dark:border-gray-800">
                  <p className="mb-3 text-sm font-bold text-gray-950 dark:text-white">Related searches</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedSearchLinks.slice(0, 8).map((link) => (
                      <Link
                        key={`sidebar-${link.to}-${link.label}`}
                        to={link.to}
                        className="border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:border-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-px overflow-hidden border border-gray-200 bg-gray-200 text-sm dark:border-gray-800 dark:bg-gray-800">
                {[
                  ['Format', modelFormat || 'Unknown'],
                  ['License', modelLicense],
                  ['Images', modelPreviewCount || 0],
                  ['Size', modelFileSizeMb || 'Listed by creator'],
                  ['Views', model.views || 0],
                  ['Downloads', model.downloads || 0]
                ].map(([label, value]) => (
                  <div key={label} className="bg-white p-3 dark:bg-black">
                    <p className="text-[11px] font-semibold uppercase text-gray-500">{label}</p>
                    <p className="mt-1 font-semibold text-gray-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <p className="text-[11px] font-semibold uppercase text-gray-500">Creator</p>
                {model?.isPlatformModel ? (
                  <p className="mt-1 font-semibold text-gray-950 dark:text-white">3D ShareSpace</p>
                ) : (
                  <Link
                    to={`/profile/${creatorProfile?.username || model?.userId}`}
                    className="mt-1 inline-block font-semibold text-gray-950 underline dark:text-white"
                  >
                    {creatorProfile?.username || creatorProfile?.displayName || 'Unknown'}
                  </Link>
                )}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <p className="mb-2 text-[11px] font-semibold uppercase text-gray-500">Trust details</p>
                <div className="space-y-2">
                  {trustChecks.slice(0, 4).map((check) => (
                    <div key={check} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="mr-2 h-4 w-4 text-gray-400" />
                      {check}
                    </div>
                  ))}
                </div>
              </div>

              {!isOwner && user && !model?.isPlatformModel && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="flex w-full items-center justify-center gap-2 border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-white"
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <UserMinus className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {followLoading ? 'Loading' : isFollowing ? 'Following' : 'Follow creator'}
                  </button>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Legacy sidebar kept out of view while the minimal layout is active */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden"
          >
            {/* Enhanced Creator Info */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                  Creator
                </h2>
                
                {/* Conditional rendering based on platform model */}
                {model?.isPlatformModel ? (
                  <div className="block bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="h-16 w-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Sparkles className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                          3D ShareSpace
                          <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Official Platform Collection
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/profile/${creatorProfile?.username || model?.userId}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl p-4 transition-all"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                      >
                        {creatorProfile?.avatar ? (
                          <img
                            src={creatorProfile.avatar}
                            alt={creatorProfile.username || creatorProfile.displayName}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {creatorProfile?.username || creatorProfile?.displayName || 'Unknown'}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {model?.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
                  
                  {/* Enhanced Creator Stats - Only show for user models */}
                  {!model?.isPlatformModel && (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3"
                      >
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {creatorStats.models}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Models</div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3"
                      >
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {creatorStats.downloads}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Downloads</div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3"
                      >
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {creatorStats.followers}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Followers</div>
                      </motion.div>
                    </div>
                  )}
                
                {/* Enhanced Follow Button - Only show for user models */}
                {!isOwner && user && !model?.isPlatformModel && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <motion.button
                      onClick={handleFollow}
                      disabled={followLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all shadow-lg ${
                        isFollowing
                          ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Enhanced Download Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Download className="h-5 w-5 text-green-500 mr-2" />
                  Download Model
                </h2>
                
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <div className="mb-3 flex items-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Safe download details
                    </div>
                    <div className="grid gap-2 text-xs text-gray-700 dark:text-gray-300">
                      {trustChecks.map((check) => (
                        <div key={check} className="flex items-center">
                          <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={handleDownload}
                    disabled={downloading || !user}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full inline-flex items-center justify-center px-4 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Download Model
                      </>
                    )}
                  </motion.button>
                  
                  {/* Tip Button */}
                  {!isOwner && user && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <TipButton
                        creatorId={model.userId}
                        creatorName={model?.isPlatformModel ? 'Platform' : (creatorProfile?.username || creatorProfile?.displayName || 'Unknown')}
                        modelId={model.id}
                        modelTitle={model.title}
                        variant="default"
                        className="w-full"
                      />
                    </motion.div>
                  )}
                  
                  {!user && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-gray-600 dark:text-gray-400 text-center"
                    >
                      <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Sign in
                      </Link>{' '}
                      to download models
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Stats Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-red-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                  Statistics
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800"
                  >
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center">
                      <Heart className="h-5 w-5 mr-1" />
                      {model.likes || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                  >
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Eye className="h-5 w-5 mr-1" />
                      {model.views || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                      <Download className="h-5 w-5 mr-1" />
                      {model.downloads || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                  >
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 mr-1" />
                      {comments.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Model Information */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Info className="h-5 w-5 text-indigo-500 mr-2" />
                  Model Information
                </h2>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Category</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.category || 'Uncategorized'}
                      </p>
                    </motion.div>

                    {modelFormat && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                      >
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Format</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {modelFormat}
                        </p>
                      </motion.div>
                    )}

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">License</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {modelLicense}
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Created</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </motion.div>

                    {model.polygonCount && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                      >
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Polygon Count</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {model.polygonCount.toLocaleString()}
                        </p>
                      </motion.div>
                    )}

                    {modelFileSizeMb && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                      >
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">File Size</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {modelFileSizeMb}
                        </p>
                      </motion.div>
                    )}

                    {(model.renderEngine || model.softwareUsed || model.version) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.34 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                      >
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Created With</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {[model.softwareUsed, model.renderEngine, model.version].filter(Boolean).join(' · ')}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.36 }}
                      className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    >
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 block mb-2 font-semibold">Trust Checklist</span>
                      <div className="space-y-2">
                        {trustChecks.map((check) => (
                          <div key={check} className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            {check}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                    
                  {/* Model Features */}
                  {model.features && model.features.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-3">Features</span>
                      <div className="flex flex-wrap gap-2">
                        {model.features.map((feature, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 dark:from-indigo-900/20 dark:to-blue-900/20 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {feature}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Related models now appear directly below the preview for faster browsing. */}
      {false && relatedModels.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
        >
          <motion.div 
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5 rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="mr-4"
                  >
                    <Target className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                  Discover More Amazing Models
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>Trending in {model.category}</span>
                </motion.div>
              </div>
              
              {/* Horizontal Scrollable Grid */}
              <div className="relative">
                <div className="flex space-x-6 overflow-x-auto pb-4">
                  {relatedModels.map((relatedModel, index) => (
                    <motion.div
                      key={relatedModel.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -10,
                        transition: { duration: 0.2 }
                      }}
                      className="flex-none w-72 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      <Link to={getModelUrl(relatedModel)} className="block">
                        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 overflow-hidden">
                          {relatedModel.previewImages && relatedModel.previewImages.length > 0 ? (
                            <motion.img
                              src={relatedModel.previewImages[0].url}
                              alt={getModelAltText(relatedModel, 'related model preview')}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                              <div className="flex items-center justify-between text-white text-sm">
                                <div className="flex items-center space-x-3">
                                  <span className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {relatedModel.views || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {relatedModel.likes || 0}
                                  </span>
                                </div>
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                                >
                                  View →
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {relatedModel.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {relatedModel.description || relatedModel.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                {relatedModel.downloads || 0}
                              </span>
                              <span>•</span>
                              <span>{relatedModel.category}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ModelDetailPage
