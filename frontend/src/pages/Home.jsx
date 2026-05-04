import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { firebaseHelpers } from '../lib/firebase'
import { Download, Calendar } from 'lucide-react'
import ModelCard from '../components/ModelCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const Home = () => {
  const [models, setModels] = useState([])
  const [stats, setStats] = useState({
    totalModels: 0,
    totalUsers: 0,
    totalDownloads: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch recent models
        const { models: recentModels, error: modelsError } = await firebaseHelpers.getModels(8)
        if (modelsError) {
          console.error('Error fetching models:', modelsError)
        } else {
          setModels(recentModels)
        }

        // For now, we'll set basic stats since Firebase doesn't have built-in count queries
        // In production, you might want to maintain a separate stats document
        setStats({
          totalModels: recentModels?.length || 0,
          totalUsers: 0, // Would need to be tracked separately
          totalDownloads: recentModels?.reduce((sum, model) => sum + (model.downloads_count || 0), 0) || 0
        })
        
      } catch (err) {
        setError('Failed to load data')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading amazing 3D models..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-white transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Simple hero */}
      <section className="py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Share and discover 3D models
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-400 max-w-2xl">
          A simple place to upload your work and explore models from the community.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/explore" className="btn btn-primary">
            Explore models
          </Link>
          <Link to="/upload" className="btn btn-outline">
            Upload a model
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-body flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Models</p>
              <p className="text-2xl font-semibold text-white">{stats.totalModels}</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Downloads</p>
              <p className="text-2xl font-semibold text-white">{stats.totalDownloads}</p>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Recent Models Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent models</h2>
            <p className="text-sm text-gray-400 mt-1">Latest uploads from the community.</p>
          </div>
          <Link to="/explore" className="text-sm font-medium text-gray-300 hover:text-white hover:underline">
            View all
          </Link>
        </div>

        {models.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No models yet"
            description="Be the first to upload a 3D model and inspire others!"
            actionText="Upload Your First Model"
            actionLink="/upload"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
