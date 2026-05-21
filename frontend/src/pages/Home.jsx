import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import ModelCard from '../components/ModelCard'
import PageMeta from '../components/PageMeta'
import { modelCategoryNames } from '../data/modelCategories'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    const loadModels = async () => {
      try {
        const result = await firebaseHelpers.getModels({})
        if (!active) return
        setModels(result.success ? result.models || [] : [])
      } catch (error) {
        if (active) setModels([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadModels()
    return () => {
      active = false
    }
  }, [])

  const visibleModels = useMemo(() => (
    models
      .filter((model) => model.is_private !== true && model.isPublic !== false && model.status !== 'draft')
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
  ), [models])

  const featuredModels = visibleModels.filter((model) => model.isFeatured).slice(0, 8)
  const recentModels = visibleModels.slice(0, 10)
  const categoryStrip = modelCategoryNames.slice(0, 16)

  const submitSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore')
  }

  return (
    <div className="studio-page">
      <PageMeta
        title="Free 3D Models Download | 3D ShareSpace"
        description="Download free 3D models for Blender, Unity, Unreal Engine, games, architecture, 3D printing, product renders, and creative projects."
        keywords="free 3D models, 3D model download, free 3D assets, Blender models, FBX models, OBJ models, GLTF models, STL files, game assets, architecture 3D models"
        url="/"
        image="/favicon.svg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: '3D ShareSpace',
          alternateName: ['3DShareSpace', '3D Share Space', 'Free 3D Models Download'],
          url: typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}/explore?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }}
      />

      <div className="studio-container">
        <header className="grid gap-6 border-b border-[#242424] pb-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="studio-kicker">Asset library</p>
            <h1 className="studio-page-title">Free 3D models for real projects</h1>
            <p className="studio-page-subtitle">
              Free 3D models for renders, games, AR/VR, and product scenes. Browse assets, download files, or upload your own models.
            </p>
          </div>

          <form onSubmit={submitSearch} className="studio-panel">
            <label htmlFor="home-search" className="studio-label">Find assets</label>
            <div className="flex gap-2">
              <input
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="studio-input"
                placeholder="Chair, vehicle, character, archviz"
              />
              <button className="studio-primary-button" type="submit">Search</button>
            </div>
          </form>
        </header>

        <section>
          <div className="studio-section-title">
            <div>
              <h2>{featuredModels.length ? 'Featured models' : 'Recently added models'}</h2>
              <p>Compact previews for quick browsing.</p>
            </div>
            <Link to="/explore">Open library</Link>
          </div>

          {loading ? (
            <div className="asset-grid">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="studio-card h-64 animate-pulse bg-[#101010]" />
              ))}
            </div>
          ) : (featuredModels.length || recentModels.length) ? (
            <div className="asset-grid">
              {(featuredModels.length ? featuredModels : recentModels).map((model) => (
                <ModelCard key={model.id || model.uid} model={model} />
              ))}
            </div>
          ) : (
            <div className="studio-empty">
              <h3>No public models yet</h3>
              <p>When creators upload public assets, they will appear here.</p>
            </div>
          )}
        </section>

        <section>
          <div className="studio-section-title">
            <div>
              <h2>Categories</h2>
              <p>Browse by the kind of asset you need.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryStrip.map((category) => (
              <Link key={category} to={`/explore?category=${encodeURIComponent(category)}`} className="studio-chip">
                {category}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="studio-section-title">
            <div>
              <h2>Recently added</h2>
              <p>New uploads from artists, students, developers, and small studios.</p>
            </div>
            <Link to="/explore?sort=newest">View newest</Link>
          </div>
          {recentModels.length > 0 ? (
            <div className="asset-grid">
              {recentModels.slice(0, 5).map((model) => (
                <ModelCard key={model.id || model.uid} model={model} compact />
              ))}
            </div>
          ) : (
            <div className="studio-empty">
              <h3>No recent uploads</h3>
              <p>The latest public assets will appear here after upload.</p>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-4 border border-[#242424] bg-[#0a0a0a] p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="studio-kicker">Creator tools</p>
            <h2 className="mt-2 text-xl font-semibold text-[#f5f5f5]">Upload models with useful project details</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a3a3a3]">
              Add files, preview images, license information, tags, and technical notes so downloaders know what they are getting.
            </p>
          </div>
          <Link to={user ? '/upload' : '/login'} className="studio-primary-button">
            {user ? 'Upload model' : 'Log in to upload'}
          </Link>
        </section>
      </div>
    </div>
  )
}

export default Home
