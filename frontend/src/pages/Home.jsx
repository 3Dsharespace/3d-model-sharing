import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import PageMeta from '../components/PageMeta'
import { modelCategoryNames } from '../data/modelCategories'
import { getModelUrl } from '../lib/modelLinks'

const getThumbnail = (model) => (
  model?.thumbnail ||
  model?.thumbnail_path ||
  model?.thumbnailUrl ||
  model?.imageUrl ||
  model?.previewImage ||
  model?.previewImages?.[0]?.url ||
  model?.previewImages?.[0]?.downloadURL ||
  model?.previewImages?.[0]?.src ||
  ''

)

const isPublicModel = (model) => (
  model.is_private !== true &&
  model.isPublic !== false &&
  model.is_public !== false &&
  model.status !== 'draft' &&
  model.isDraft !== true
)

const shuffleModels = (items) => (
  [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item)
)

const formatCount = (value) => new Intl.NumberFormat('en-US').format(value)

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [randomSeed, setRandomSeed] = useState(0)
  const [activeCategory, setActiveCategory] = useState('All models')

  useEffect(() => {
    let active = true

    const loadModels = async () => {
      try {
        const result = await firebaseHelpers.getModels({})
        if (!active) return
        setModels(result.success ? result.models || [] : [])
        setRandomSeed(Date.now())
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
      .filter(isPublicModel)
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
  ), [models])

  const randomModels = useMemo(() => shuffleModels(visibleModels), [visibleModels, randomSeed])
  const stageModels = randomModels.filter(getThumbnail).slice(0, 8)
  const previewModels = randomModels.slice(0, 8)
  const categoryFilters = ['All models', ...modelCategoryNames.slice(0, 5)]

  const filteredPreviewModels = useMemo(() => {
    if (activeCategory === 'All models') return previewModels
    return previewModels.filter((model) => model.category === activeCategory)
  }, [activeCategory, previewModels])

  const creatorCount = useMemo(() => {
    const creators = new Set(
      visibleModels
        .map((model) => model.author?.uid || model.userId || model.creatorId)
        .filter(Boolean)
    )
    return creators.size
  }, [visibleModels])

  const addedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    return visibleModels.filter((model) => {
      const created = new Date(model.createdAt || model.created_at || 0).getTime()
      return created >= weekAgo
    }).length
  }, [visibleModels])

  const submitSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore')
  }

  return (
    <div className="luxury-home">
      <PageMeta
        title="3D ShareSpace | Free 3D Models for Real Projects"
        description="Browse free 3D models for renders, games, AR/VR, and product scenes. Download assets or upload your own models."
        keywords="free 3D models, 3D asset library, game assets, Blender models, FBX models, OBJ models"
        url="/"
        image="/favicon.svg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: '3D ShareSpace',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}/explore?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }}
      />

      <section className="luxury-home__hero">
        <div className="luxury-home__copy">
          <p className="studio-kicker luxury-home-kicker-line">A working library for the spatial web</p>
          <h1>
            Find the right
            <span className="luxury-accent"> dimension.</span>
          </h1>
          <p>
            Production-ready 3D assets for the people building what comes next.
            Search less. Make more.
          </p>

          <form onSubmit={submitSearch} className="luxury-home-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chairs, shoes, vehicles, props"
            />
            <button type="submit">Search library</button>
          </form>

          <div className="luxury-home__actions">
            <Link to="/explore" className="studio-button studio-button--primary">
              Explore models <ArrowRight size={14} />
            </Link>
            <Link to={user ? '/upload' : '/login'} className="studio-button studio-button--secondary">
              {user ? 'Publish asset' : 'Log in to upload'}
            </Link>
          </div>
        </div>

        <div className="luxury-stage" aria-label="Featured 3D asset preview wall">
          <div className="luxury-stage__axis" />
          <div className="luxury-stage__ring luxury-stage__ring--one" />
          <div className="luxury-stage__ring luxury-stage__ring--two" />
          <div className="luxury-stage__stack">
            {(stageModels.length ? stageModels : previewModels).slice(0, 6).map((model, index) => (
              <Link
                key={model.id || model.uid || index}
                to={getModelUrl(model)}
                className={`luxury-stage-card luxury-stage-card--${index + 1}`}
              >
                {getThumbnail(model) ? (
                  <img src={getThumbnail(model)} alt={model.title || '3D model preview'} />
                ) : (
                  <span>Preview pending</span>
                )}
                <strong>{model.title || 'Untitled model'}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-home-strip" aria-label="Library statistics">
        <span>
          Models indexed
          <strong>{loading ? '...' : formatCount(visibleModels.length)}</strong>
        </span>
        <span>
          Formats supported
          <strong>12 <em>native</em></strong>
        </span>
        <span>
          Independent makers
          <strong>{loading ? '...' : formatCount(creatorCount)}</strong>
        </span>
        <span>
          Added this week
          <strong><em>+{loading ? '...' : formatCount(addedThisWeek)}</em></strong>
        </span>
      </section>

      <section className="luxury-home-section luxury-home-library">
        <div className="luxury-home-library__intro">
          <div>
            <p className="studio-kicker">The library</p>
            <h2>Useful by design.</h2>
          </div>
          <p>
            No filler packs. Every model is checked for clean topology, usable scale,
            and a file that opens when you need it.
          </p>
        </div>

        <div className="luxury-home-tabs" role="tablist" aria-label="Model categories">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              className={activeCategory === category ? 'is-active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="luxury-preview-row">
          {(filteredPreviewModels.length ? filteredPreviewModels : previewModels).slice(0, 4).map((model) => (
            <Link key={model.id || model.uid} to={getModelUrl(model)} className="luxury-preview-card">
              {getThumbnail(model) ? <img src={getThumbnail(model)} alt={model.title || '3D model'} /> : <span>Preview pending</span>}
              <div>
                <strong>{model.title || 'Untitled model'}</strong>
                <span>{model.category || '3D Model'} / {model.author?.username || 'Share Space'}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="luxury-home-library__footer">
          <button type="button" onClick={() => setRandomSeed(Date.now())}>Shuffle picks</button>
          <Link to="/explore">Load more models</Link>
        </div>
      </section>

      <section className="luxury-home-section luxury-home-steps">
        <div className="luxury-home-steps__intro">
          <p className="studio-kicker">How it works</p>
          <h2>A calmer way to build in 3D.</h2>
          <p>A small, intentional layer between your idea and the empty viewport.</p>
        </div>

        <div className="luxury-home-steps__grid">
          <article>
            <span>01</span>
            <h3>Search with context</h3>
            <p>Filter by what an object does, not just what it is. Get closer to the asset you need faster.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Inspect before you commit</h3>
            <p>Preview geometry, materials, formats, and scale in one quiet view. No mystery downloads.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Make it yours</h3>
            <p>Every asset is a starting point. Remixes are welcome, attribution is clear, and makers stay visible.</p>
          </article>
        </div>

        <div className="luxury-home-cta">
          <div>
            <h2>Your work belongs in the workspace.</h2>
            <p>Publish your first asset and keep your creator profile visible across the library.</p>
          </div>
          <Link to={user ? '/upload' : '/signup'} className="studio-button studio-button--primary">
            Publish your first asset
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
