import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { firebaseHelpers } from '../lib/firebase'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Download,
  Eye,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import ModelCard from '../components/ModelCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import SearchBar from '../components/ui/SearchBar'

const Explore = () => {
  const [models, setModels] = useState([])
  const [filteredModels, setFilteredModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories', icon: Grid3X3 },
    { id: 'architecture', name: 'Architecture', icon: TrendingUp },
    { id: 'characters', name: 'Characters', icon: Star },
    { id: 'vehicles', name: 'Vehicles', icon: Zap },
    { id: 'props', name: 'Props', icon: Grid3X3 },
    { id: 'landscapes', name: 'Landscapes', icon: TrendingUp },
    { id: 'furniture', name: 'Furniture', icon: Grid3X3 },
    { id: 'weapons', name: 'Weapons', icon: Zap }
  ]

  const sortOptions = [
    { id: 'newest', name: 'Newest First', icon: Clock },
    { id: 'popular', name: 'Most Popular', icon: TrendingUp },
    { id: 'downloads', name: 'Most Downloaded', icon: Download },
    { id: 'views', name: 'Most Viewed', icon: Eye }
  ]

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        const { models: allModels, error } = await firebaseHelpers.getModels(50)
        if (error) {
          setError(error)
        } else {
          setModels(allModels)
          setFilteredModels(allModels)
        }
      } catch (err) {
        setError('Failed to load models')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  useEffect(() => {
    let filtered = [...models]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(model => 
        model.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => model.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'popular':
          return (b.downloads_count || 0) - (a.downloads_count || 0)
        case 'downloads':
          return (b.downloads_count || 0) - (a.downloads_count || 0)
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0)
        default:
          return 0
      }
    })

    setFilteredModels(filtered)
  }, [models, searchQuery, selectedCategory, sortBy])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Discovering amazing 3D models..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={Search}
          title="Error Loading Models"
          description={error}
          actionText="Try Again"
          actionOnClick={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Explore 3D Models
      </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover thousands of amazing 3D models from talented creators around the world
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search for 3D models, creators, or tags..."
              showFilters={false}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {models.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {models.reduce((sum, model) => sum + (model.downloads_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {models.reduce((sum, model) => sum + (model.view_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {new Set(models.map(m => m.creator?.username).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Creators</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-4 py-2 pr-8 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredModels.length} of {models.length} models
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Search results for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Models Grid */}
        {filteredModels.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No models found"
            description={
              searchQuery 
                ? `No models match your search for "${searchQuery}". Try different keywords or browse all categories.`
                : "No models available in this category. Check back later or try a different category."
            }
            actionText="Browse All Models"
            actionOnClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          />
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredModels.length > 0 && filteredModels.length < models.length && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
              Load More Models
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore
