import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { getModelAltText, getModelUrl } from '../lib/modelLinks'

import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  Heart, 
  Eye, 
  Star,
  TrendingUp,
  Clock,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileDown,
  Cpu,
  Crown,
  Play,
  Grid,
  Zap,
  CheckCircle,
  Tag,
  Users,
  Calendar,
  Award,
  Sparkles,
  Flame,
  Target,
  Globe,
  Home,
  Car,
  Gamepad2,
  Palette,
  Mountain,
  Wrench,
  Building,
  ArrowRight,
  ShoppingBag,
  Monitor,
  Music,
  Dumbbell,
  Utensils,
  Shirt,
  Stethoscope,
  Factory,
  Rocket
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import PageMeta from '../components/PageMeta'

const Explore = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -50])
  
  // State management
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('best-match')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [hoveredModel, setHoveredModel] = useState(null)
  const [discoveryStreak, setDiscoveryStreak] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenu, setOpenMenu] = useState(null)
  const [anchorRect, setAnchorRect] = useState(null)
  const filtersBarRef = useRef(null)
  
  // Advanced filter states
  const [fileFormats, setFileFormats] = useState([])
  const [polyCount, setPolyCount] = useState('')
  const [license, setLicense] = useState('')
  const [isAnimated, setIsAnimated] = useState(false)
  const [isRigged, setIsRigged] = useState(false)
  const [isExclusive, setIsExclusive] = useState(false)
  const [isBundle, setIsBundle] = useState(false)
  const [isRealTime, setIsRealTime] = useState(false)
  const [isStemCell, setIsStemCell] = useState(false)

  // Categories with icons for filtering
  const categories = [
    { name: 'All', icon: Globe, color: 'from-blue-500 to-purple-500' },
    { name: 'Architecture', icon: Building, color: 'from-gray-600 to-gray-800' },
    { name: 'Cityscape', icon: Building, color: 'from-slate-600 to-zinc-800' },
    { name: 'Landscapes', icon: Mountain, color: 'from-green-700 to-zinc-800' },
    { name: 'Characters', icon: Users, color: 'from-pink-500 to-rose-600' },
    { name: 'People', icon: Users, color: 'from-zinc-600 to-gray-800' },
    { name: 'Anatomy', icon: Stethoscope, color: 'from-gray-600 to-zinc-800' },
    { name: 'Fantasy', icon: Sparkles, color: 'from-indigo-600 to-zinc-800' },
    { name: 'Cartoons', icon: Sparkles, color: 'from-neutral-600 to-zinc-800' },
    { name: 'Creatures', icon: Users, color: 'from-stone-600 to-zinc-800' },
    { name: 'Vehicles', icon: Car, color: 'from-red-500 to-orange-600' },
    { name: 'Cars', icon: Car, color: 'from-red-600 to-zinc-800' },
    { name: 'Aircraft', icon: Rocket, color: 'from-sky-600 to-zinc-800' },
    { name: 'Watercraft', icon: Globe, color: 'from-cyan-700 to-zinc-800' },
    { name: 'Space', icon: Rocket, color: 'from-blue-700 to-zinc-950' },
    { name: 'Furniture', icon: Home, color: 'from-amber-600 to-yellow-600' },
    { name: 'Furnishings', icon: Home, color: 'from-stone-600 to-zinc-800' },
    { name: 'Office', icon: Building, color: 'from-gray-600 to-zinc-800' },
    { name: 'Household', icon: Home, color: 'from-neutral-600 to-zinc-800' },
    { name: 'Kitchenware', icon: Utensils, color: 'from-stone-600 to-zinc-800' },
    { name: 'Appliances', icon: Monitor, color: 'from-zinc-600 to-gray-800' },
    { name: 'Lighting', icon: Sparkles, color: 'from-gray-600 to-zinc-800' },
    { name: 'Tableware', icon: Utensils, color: 'from-neutral-600 to-zinc-800' },
    { name: 'Electronics', icon: Monitor, color: 'from-blue-600 to-indigo-600' },
    { name: 'Technology', icon: Cpu, color: 'from-cyan-500 to-blue-600' },
    { name: 'Robots', icon: Cpu, color: 'from-zinc-700 to-slate-900' },
    { name: 'Nature', icon: Mountain, color: 'from-green-500 to-emerald-600' },
    { name: 'Plants', icon: Mountain, color: 'from-green-600 to-lime-700' },
    { name: 'Trees', icon: Mountain, color: 'from-emerald-700 to-zinc-800' },
    { name: 'Animals', icon: Users, color: 'from-stone-600 to-zinc-700' },
    { name: 'Props', icon: ShoppingBag, color: 'from-purple-500 to-indigo-600' },
    { name: 'Tools', icon: Wrench, color: 'from-zinc-600 to-gray-800' },
    { name: 'Weapons', icon: Target, color: 'from-red-700 to-zinc-800' },
    { name: 'Military', icon: Target, color: 'from-zinc-700 to-gray-950' },
    { name: 'Buildings', icon: Factory, color: 'from-stone-600 to-gray-700' },
    { name: 'Interior Design', icon: Home, color: 'from-neutral-600 to-stone-800' },
    { name: 'Exterior', icon: Building, color: 'from-slate-600 to-gray-800' },
    { name: 'Machinery', icon: Wrench, color: 'from-orange-600 to-red-600' },
    { name: 'Construction', icon: Factory, color: 'from-zinc-600 to-gray-800' },
    { name: 'Materials', icon: Grid3X3, color: 'from-neutral-600 to-zinc-800' },
    { name: 'Product Design', icon: ShoppingBag, color: 'from-gray-600 to-neutral-800' },
    { name: 'Art', icon: Palette, color: 'from-pink-600 to-purple-600' },
    { name: 'Textures', icon: Grid3X3, color: 'from-zinc-600 to-gray-800' },
    { name: 'Medical', icon: Stethoscope, color: 'from-teal-500 to-cyan-600' },
    { name: 'Fashion', icon: Shirt, color: 'from-rose-500 to-pink-600' },
    { name: 'Jewelry', icon: Sparkles, color: 'from-zinc-600 to-slate-800' },
    { name: 'Shoes', icon: Shirt, color: 'from-stone-600 to-zinc-800' },
    { name: 'Food', icon: Utensils, color: 'from-orange-500 to-amber-600' },
    { name: 'Food & Drink', icon: Utensils, color: 'from-zinc-600 to-gray-800' },
    { name: 'Sports', icon: Dumbbell, color: 'from-emerald-600 to-green-700' },
    { name: 'Music', icon: Music, color: 'from-violet-500 to-purple-600' },
    { name: 'Gaming', icon: Gamepad2, color: 'from-indigo-500 to-blue-600' },
    { name: 'Game Ready', icon: Gamepad2, color: 'from-zinc-600 to-gray-900' },
    { name: 'Low Poly', icon: Grid3X3, color: 'from-neutral-600 to-zinc-800' },
    { name: 'AR/VR', icon: Eye, color: 'from-gray-600 to-zinc-800' },
    { name: '3D Printing', icon: FileDown, color: 'from-zinc-700 to-gray-950' },
    { name: 'Industrial', icon: Factory, color: 'from-gray-700 to-slate-800' },
    { name: 'Sci-Fi', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
    { name: 'Education', icon: Award, color: 'from-gray-600 to-slate-800' },
    { name: 'Historical', icon: Clock, color: 'from-stone-600 to-zinc-800' },
    { name: 'Toys', icon: Sparkles, color: 'from-neutral-600 to-gray-800' },
    { name: 'Other', icon: Grid3X3, color: 'from-gray-600 to-zinc-800' }
  ]

  // File formats
  const availableFormats = [
    'Blender',
    'Maya',
    '3ds Max',
    'Cinema 4D',
    'Houdini',
    'ZBrush',
    'OBJ',
    'FBX',
    'GLTF',
    'USDZ',
    'STL',
    'PLY'
  ]

  // License types
  const licenseTypes = [
    'CC-BY-4.0',
    'CC-BY-SA-4.0',
    'CC-BY-NC-4.0',
    'Commercial',
    'Royalty-Free',
    'Exclusive'
  ]

  // Poly count ranges
  const polyCountRanges = [
    'Low (< 1K)',
    'Medium (1K - 10K)',
    'High (10K - 100K)',
    'Very High (100K - 1M)',
    'Ultra (> 1M)'
  ]

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'best-match'
    
    setSearchQuery(query)
    setSelectedCategory(category)
    setSortBy(sort)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Fetch models from Firebase
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Build filters object
        const filters = {}
        if (selectedCategory && selectedCategory !== 'All') {
          filters.category = selectedCategory
        }
        
        // Get models from Firebase
        const result = await firebaseHelpers.getModels(filters)
        
        if (result.success) {
          // Process the models data
          const processedModels = result.models.map(model => ({
            ...model,
            downloads: model.downloads || 0,
            likes: model.likes || 0,
            views: model.views || 0,
            rating: model.rating || 4.0,
            tags: model.tags || [],
            createdAt: model.createdAt || new Date().toISOString(),
            author: {
              username: model.isPlatformModel ? '3D ShareSpace' : (model.author?.username || model.username || 'Unknown'),
              avatar: model.author?.avatar || null
            },
            license: model.license || 'CC-BY-4.0',
            isFeatured: model.isFeatured || false,
            price: model.price || 0,
            fileFormat: model.fileFormat || 'Unknown',
            polyCount: model.polyCount || 0,
            isAnimated: model.isAnimated || false,
            isRigged: model.isRigged || false,
            isExclusive: model.isExclusive || false,
            isBundle: model.isBundle || false,
            isRealTime: model.isRealTime || false,
            isStemCell: model.isStemCell || false
          }))
          
          setModels(processedModels)
        } else {
          setError(result.error || 'Failed to fetch models')
          setModels([])
        }
      } catch (err) {
        console.error('Error fetching models:', err)
        setError('Failed to load models. Please try again.')
        setModels([])
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [selectedCategory])

  // Real-time statistics updater for models
  useEffect(() => {
    if (!models.length) return;

    const updateModelStats = async () => {
      try {
        const updatedModels = await Promise.all(
          models.map(async (model) => {
            // Get real-time stats for each model
            const statsResult = await firebaseHelpers.getModelStats(model.id);
            if (statsResult.success) {
              return {
                ...model,
                likes: statsResult.stats.likes,
                downloads: statsResult.stats.downloads,
                views: model.views || 0 // Keep existing views if available
              };
            }
            return model;
          })
        );
        
        setModels(updatedModels);
      } catch (error) {
        console.error('Error updating model stats:', error);
      }
    };

    // Update stats immediately
    updateModelStats();

    // Set up interval to update stats every 30 seconds
    const interval = setInterval(updateModelStats, 30000);

    return () => clearInterval(interval);
  }, [models.length]);

  // Filter models based on all criteria
  const filteredModels = useMemo(() => {
    return models.filter(model => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = (
          model.title?.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query) ||
          (model.tags && model.tags.some(tag => tag.toLowerCase().includes(query))) ||
          model.author?.username?.toLowerCase().includes(query)
        )
        if (!matchesSearch) return false
      }

      // File format filter
      if (fileFormats.length > 0 && !fileFormats.includes(model.fileFormat)) return false

      // License filter
      if (license && model.license !== license) return false

      // Boolean filters
      if (isAnimated && !model.isAnimated) return false
      if (isRigged && !model.isRigged) return false
      if (isExclusive && !model.isExclusive) return false
      if (isBundle && !model.isBundle) return false
      if (isRealTime && !model.isRealTime) return false
      if (isStemCell && !model.isStemCell) return false

      return true
    })
  }, [models, searchQuery, fileFormats, license, isAnimated, isRigged, isExclusive, isBundle, isRealTime, isStemCell])

  // Sort models
  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'popular':
          return (b.downloads || 0) - (a.downloads || 0)
        case 'trending':
          return (b.views || 0) - (a.views || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'best-match':
        default:
          // Best match algorithm: combination of rating, popularity, and recency
          const aScore = (a.rating || 0) * 0.4 + (a.downloads || 0) * 0.3 + (a.views || 0) * 0.2 + (new Date(a.createdAt).getTime() / 100000000000) * 0.1
          const bScore = (b.rating || 0) * 0.4 + (b.downloads || 0) * 0.3 + (b.views || 0) * 0.2 + (new Date(b.createdAt).getTime() / 100000000000) * 0.1
          return bScore - aScore
      }
    })
  }, [filteredModels, sortBy])

  // Reset to first page when filters/sort change or pageSize changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, fileFormats, license, isAnimated, isRigged, isExclusive, isBundle, isRealTime, isStemCell, sortBy, pageSize])

  // Clamp current page if result set shrinks
  useEffect(() => {
    const total = Math.max(1, Math.ceil(sortedModels.length / pageSize))
    if (currentPage > total) setCurrentPage(total)
  }, [sortedModels.length, pageSize, currentPage])

  // Pagination slice
  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedModels.slice(start, end)
  }, [sortedModels, currentPage, pageSize])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedModels.length / pageSize)), [sortedModels.length, pageSize])
  const showingStart = sortedModels.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingEnd = Math.min(currentPage * pageSize, sortedModels.length)

  // Close dropdowns on escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Scroll to top/toolbar when page changes
  useEffect(() => {
    if (filtersBarRef.current && typeof filtersBarRef.current.scrollIntoView === 'function') {
      filtersBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    updateURL({ q: searchQuery })
  }

  // Handle category change
  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName)
    updateURL({ category: categoryName === 'All' ? '' : categoryName })
    
    // Increment discovery streak
    if (categoryName !== selectedCategory) {
      setDiscoveryStreak(prev => prev + 1)
    }
  }

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortBy(sort)
    updateURL({ sort })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setFileFormats([])
    setPolyCount('')
    setLicense('')
    setIsAnimated(false)
    setIsRigged(false)
    setIsExclusive(false)
    setIsBundle(false)
    setIsRealTime(false)
    setIsStemCell(false)
    updateURL({})
  }

  // Get active filter count
  const activeFilterCount = [
    searchQuery,
    selectedCategory !== 'All' ? selectedCategory : '',
    fileFormats.length,
    polyCount,
    license,
    isAnimated,
    isRigged,
    isExclusive,
    isBundle,
    isRealTime,
    isStemCell
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
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
            animate={{ scale: [1, 1.1, 1] }}
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
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
          >
            Discovering Amazing Models
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Curating the best 3D content just for you...
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="flex justify-center space-x-2 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <PageMeta
        title={`Explore 3D Models${selectedCategory ? ` – ${selectedCategory}` : ''}`}
        description={`Browse high-quality free 3D models${selectedCategory ? ` in ${selectedCategory}` : ''}. Filter by format, license, polycount, and more.`}
        keywords={`3D models, explore, free 3D assets${selectedCategory ? `, ${selectedCategory}` : ''}`}
        url="/explore"
        image="/favicon.svg"
      />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: headerY }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"
        />
      </div>

      {/* Enhanced Hero Header */}
      <motion.div 
        style={{ y: headerY }}
        className="explore-hero relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 sm:py-5 overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-pulse opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{opacity:0, y:30}}
              animate={{opacity:1, y:0}}
              transition={{duration:.8}}
              className="mb-2"
            >
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  Explore{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    Amazing
                  </span>{' '}
                  3D Models
                </h1>
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                </motion.div>
              </div>
              
              <motion.p
                initial={{opacity:0, y:20}}
                animate={{opacity:1, y:0}}
                transition={{duration:.8, delay:.2}}
                className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto"
              >
                Discover {models.length.toLocaleString()}+ high-quality 3D models created by talented artists worldwide
              </motion.p>
            </motion.div>
            
            {/* Discovery Streak */}
            {discoveryStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              >
                <Flame className="w-3 h-3 mr-1.5" />
                Discovery Streak: {discoveryStreak}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Category Navigation (solid, no glass/gradients) */}
      <div className="toolbar-surface relative bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-3 scrollbar-hide min-w-0">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              const isSelected = selectedCategory === category.name
              
              return (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`group relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isSelected
                      ? 'bg-zinc-900 text-white border border-zinc-700 shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-zinc-950 dark:text-gray-300 dark:border-zinc-800 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    isSelected 
                      ? 'bg-white/10' 
                      : 'bg-zinc-800'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      isSelected ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <span className="font-medium">{category.name}</span>
                  
                  {/* Animated selection indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="categorySelector"
                      className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6">
          {/* Unified Toolbar: filters + controls */}
          <div ref={filtersBarRef} className="toolbar-surface bg-luxury-bg-card dark:bg-gray-800 rounded-xl shadow-sm border border-luxury-border-light dark:border-gray-700 px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 w-64 bg-white dark:bg-gray-700 border border-luxury-border-light dark:border-gray-600 rounded-md text-sm text-luxury-text-primary dark:text-gray-300 placeholder-luxury-text-muted dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </form>

              {/* File Format menu */}
              <div className="flex-shrink-0">
                <button onClick={(e) => { setOpenMenu(openMenu === 'format' ? null : 'format'); setAnchorRect(e.currentTarget.getBoundingClientRect()) }} className="h-9 px-3 rounded-md border border-luxury-border-light dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-sm flex items-center gap-2 hover:bg-white dark:hover:bg-gray-700">
                  <FileDown className="w-4 h-4" />
                  Format{fileFormats.length ? ` (${fileFormats.length})` : ''}
                </button>
              </div>

              {/* License menu */}
              <div className="flex-shrink-0">
                <button onClick={(e) => { setOpenMenu(openMenu === 'license' ? null : 'license'); setAnchorRect(e.currentTarget.getBoundingClientRect()) }} className="h-9 px-3 rounded-md border border-luxury-border-light dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-sm flex items-center gap-2 hover:bg-white dark:hover:bg-gray-700">
                  <CheckCircle className="w-4 h-4" />
                  {license || 'Any License'}
                </button>
              </div>

              {/* Advanced menu */}
              <div className="flex-shrink-0">
                <button onClick={(e) => { setOpenMenu(openMenu === 'advanced' ? null : 'advanced'); setAnchorRect(e.currentTarget.getBoundingClientRect()) }} className="h-9 px-3 rounded-md border border-luxury-border-light dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-sm flex items-center gap-2 hover:bg-white dark:hover:bg-gray-700">
                  <Filter className="w-4 h-4" />
                  Advanced{[isAnimated, isRigged, isExclusive, isBundle].filter(Boolean).length ? ` (${[isAnimated, isRigged, isExclusive, isBundle].filter(Boolean).length})` : ''}
                </button>
              </div>

              {/* Active + Clear */}
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="h-9 px-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 text-sm flex-shrink-0">Clear</button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Showing count */}
              <span className="hidden md:block text-xs text-luxury-text-muted dark:text-gray-400 mr-2">{`Showing ${showingStart}-${showingEnd} of ${sortedModels.length} models`}</span>

              {/* Per page (removed; default 50 kept in state) */}

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm text-luxury-text-secondary dark:text-gray-300">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-2 py-2 bg-white dark:bg-gray-700 border border-luxury-border-light dark:border-gray-600 rounded-md text-sm text-luxury-text-primary dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="best-match">Best Match</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-luxury-border-light dark:border-gray-600 rounded-md overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-luxury-bg-secondary dark:bg-gray-700 text-luxury-text-muted dark:text-gray-400'}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-luxury-bg-secondary dark:bg-gray-700 text-luxury-text-muted dark:text-gray-400'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Fixed-position dropdowns */}
          {openMenu && anchorRect && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
              <div
                className="fixed z-50 bg-white dark:bg-gray-800 border border-luxury-border-light dark:border-gray-700 rounded-md shadow-xl p-3 max-h-72 overflow-y-auto"
                style={{ top: Math.min(window.innerHeight - 260, anchorRect.bottom + 8), left: Math.min(window.innerWidth - 240, anchorRect.left), width: 224 }}
              >
                {openMenu === 'format' && (
                  <div className="space-y-1">
                    {availableFormats.map(format => (
                      <label key={format} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          checked={fileFormats.includes(format)}
                          onChange={(e) => {
                            if (e.target.checked) setFileFormats(prev => [...prev, format])
                            else setFileFormats(prev => prev.filter(f => f !== format))
                          }}
                          className="rounded border-luxury-border-light dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-luxury-text-secondary dark:text-gray-300">{format}</span>
                      </label>
                    ))}
                  </div>
                )}
                {openMenu === 'license' && (
                  <div className="space-y-1">
                    <button onClick={() => setLicense('')} className={`w-full text-left px-2 py-1 rounded ${license === '' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>Any License</button>
                    {licenseTypes.map(lt => (
                      <button key={lt} onClick={() => setLicense(lt)} className={`w-full text-left px-2 py-1 rounded ${license === lt ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>{lt}</button>
                    ))}
                  </div>
                )}
                {openMenu === 'advanced' && (
                  <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" checked={isAnimated} onChange={(e) => setIsAnimated(e.target.checked)} className="rounded border-luxury-border-light dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700" /><span className="ml-2 text-sm text-luxury-text-secondary dark:text-gray-300 flex items-center"><Play className="h-4 w-4 mr-1" />Animated</span></label>
                    <label className="flex items-center"><input type="checkbox" checked={isRigged} onChange={(e) => setIsRigged(e.target.checked)} className="rounded border-luxury-border-light dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700" /><span className="ml-2 text-sm text-luxury-text-secondary dark:text-gray-300 flex items-center"><Grid className="h-4 w-4 mr-1" />Rigged</span></label>
                    <label className="flex items-center"><input type="checkbox" checked={isExclusive} onChange={(e) => setIsExclusive(e.target.checked)} className="rounded border-luxury-border-light dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700" /><span className="ml-2 text-sm text-luxury-text-secondary dark:text-gray-300 flex items-center"><Crown className="h-4 w-4 mr-1" />Exclusive</span></label>
                    <label className="flex items-center"><input type="checkbox" checked={isBundle} onChange={(e) => setIsBundle(e.target.checked)} className="rounded border-luxury-border-light dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700" /><span className="ml-2 text-sm text-luxury-text-secondary dark:text-gray-300 flex items-center"><Zap className="h-4 w-4 mr-1" />Bundle</span></label>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Models Grid/List */}
            {sortedModels.length === 0 ? (
              <div className="text-center py-16 bg-luxury-bg-card dark:bg-gray-800 rounded-xl shadow-sm border border-luxury-border-light dark:border-gray-700">
                <div className="text-luxury-text-muted dark:text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-luxury-text-primary dark:text-white mb-2">
                  {searchQuery ? 'No models found' : 'No models available'}
                </h3>
                <p className="text-luxury-text-secondary dark:text-gray-400 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to upload a 3D model!'
                  }
                </p>
                {!searchQuery && (
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Upload Your First Model
                  </Link>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-4'}>
                <AnimatePresence>
                  {paginatedModels.map((model, index) => (
                    <Link to={getModelUrl(model)} className="block" key={model.id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }}
                        onHoverStart={() => setHoveredModel(model.id)}
                        onHoverEnd={() => setHoveredModel(null)}
                        className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-white/50 dark:border-gray-700/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 cursor-pointer ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                      {/* Glowing border on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                      
                      {/* Thumbnail */}
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'flex-shrink-0 w-64' : ''}`}>
                        {(model.thumbnail || (model.previewImages && model.previewImages.length > 0)) ? (
                          <div className="relative">
                            <img
                              src={model.thumbnail || model.previewImages[0].url}
                              alt={getModelAltText(model, 'explore preview')}
                              className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${viewMode === 'list' ? 'h-32' : 'h-40'}`}
                            />
                            {/* Keep thumbnail fully visible on hover */}
                            <div className="absolute inset-0 bg-transparent" />
                          </div>
                        ) : (
                          <div className={`w-full bg-gradient-to-br from-gray-200 via-blue-100 to-purple-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 flex items-center justify-center ${viewMode === 'list' ? 'h-32' : 'h-40'} relative overflow-hidden`}>
                            <motion.div
                              animate={{ 
                                scale: hoveredModel === model.id ? [1, 1.2, 1] : 1,
                                rotate: hoveredModel === model.id ? [0, 10, 0] : 0
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-4xl"
                            >
                              🎲
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
                          </div>
                        )}
                        
                        {/* Enhanced Badges */}
                        <div className="absolute top-2 left-2 flex flex-col space-y-1">
                          {model.isFeatured && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg"
                            >
                              <Crown className="h-2.5 w-2.5 mr-1" />
                              Featured
                            </motion.div>
                          )}
                          
                          {/* Trending badge for high views */}
                          {model.views > 1000 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg"
                            >
                              <Flame className="h-2.5 w-2.5 mr-1" />
                              Hot
                            </motion.div>
                          )}
                          
                          {/* Hot badge for high downloads */}
                          {model.downloads > 500 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg"
                            >
                              <Zap className="h-2.5 w-2.5 mr-1" />
                              Popular
                            </motion.div>
                          )}
                        </div>

                        {/* Quick action overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredModel === model.id ? 1 : 0 }}
                          className="absolute inset-0 bg-transparent flex items-center justify-center"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 border border-white/20 bg-zinc-900/80 text-white"
                          >
                            <Eye className="w-3.5 h-3.5 opacity-80" />
                            <span>View</span>
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className={`p-2 ${viewMode === 'list' ? 'flex-1' : ''} relative bg-transparent`}>
                        {/* Header */}
                        <div className="mb-1">
                          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {model.title || 'Untitled Model'}
                          </h3>
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-1">
                              <Users className="h-1.5 w-1.5 text-white" />
                            </div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium truncate text-xs">
                              {model.author?.username || 'Unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Simple transparent stats */}
                        <div className="flex items-center gap-3 mb-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Download className="h-3 w-3 opacity-70" />
                            {model.downloads > 999 ? `${(model.downloads/1000).toFixed(0)}k` : (model.downloads || 0)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3 w-3 opacity-70" />
                            {model.likes > 999 ? `${(model.likes/1000).toFixed(0)}k` : (model.likes || 0)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3 opacity-70" />
                            {model.views > 999 ? `${(model.views/1000).toFixed(0)}k` : (model.views || 0)}
                          </span>
                        </div>

                      </div>
                      
                      {/* Particle effect on hover */}
                      {hoveredModel === model.id && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, x: "50%", y: "50%" }}
                              animate={{
                                scale: [0, 1, 0],
                                x: ["50%", `${Math.random() * 100}%`],
                                y: ["50%", `${Math.random() * 100}%`],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              className="absolute w-2 h-2 bg-blue-400 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                      </motion.div>
                    </Link>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {sortedModels.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-luxury-text-muted dark:text-gray-400">Page {currentPage} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md border border-luxury-border-light dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-white/40 dark:hover:bg-gray-700/40"
                  >
                    <span className="inline-flex items-center"><ChevronLeft className="w-4 h-4 mr-1" />Prev</span>
                  </button>
                  {(() => {
                    const pages = []
                    const start = Math.max(1, currentPage - 2)
                    const end = Math.min(totalPages, start + 4)
                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-1.5 rounded-md border text-sm ${i === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-luxury-border-light dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-700/40'}`}
                        >
                          {i}
                        </button>
                      )
                    }
                    return pages
                  })()}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md border border-luxury-border-light dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-white/40 dark:hover:bg-gray-700/40"
                  >
                    <span className="inline-flex items-center">Next<ChevronRight className="w-4 h-4 ml-1" /></span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Explore
