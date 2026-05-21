import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { AlertCircle, CheckCircle, Download, Heart, Loader2, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, firebaseHelpers } from '../lib/firebase'
import ModelCard from '../components/ModelCard'
import PageMeta from '../components/PageMeta'
import ReportButton from '../components/moderation/ReportButton'
import TipButton from '../components/ui/TipButton'
import {
  getAbsoluteUrl,
  getModelAltText,
  getModelFileFormat,
  getModelSeoDescription,
  getModelSeoSlug,
  getModelSeoTitle,
  getModelUrl,
  SITE_ORIGIN,
  toIsoDate
} from '../lib/modelLinks'

const formatDate = (value) => {
  if (!value) return 'Not listed'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not listed'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCount = (value = 0) => Number(value || 0).toLocaleString()

const getImageUrl = (image) => image?.url || image?.downloadURL || image?.src || image

const ModelDetailPage = () => {
  const { modelId, slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [relatedModels, setRelatedModels] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [creatorProfile, setCreatorProfile] = useState(null)

  const isOwner = Boolean(user && model?.userId && user.uid === model.userId)
  const creatorName = creatorProfile?.displayName || creatorProfile?.username || model?.creatorName || model?.author?.username || 'Independent creator'
  const modelFormat = model ? getModelFileFormat(model) : ''
  const modelTags = Array.isArray(model?.tags) ? model.tags : []
  const modelImages = useMemo(() => {
    const urls = [
      ...(Array.isArray(model?.previewImages) ? model.previewImages.map(getImageUrl) : []),
      model?.thumbnail,
      model?.thumbnail_path,
      model?.thumbnailUrl,
      model?.imageUrl
    ].filter(Boolean)
    return Array.from(new Set(urls))
  }, [model])
  const activeImage = modelImages[currentImageIndex] || '/favicon.svg'
  const siteOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : SITE_ORIGIN
  const absolutePreviewImage = getAbsoluteUrl(activeImage, siteOrigin)
  const modelSeoTitle = model ? getModelSeoTitle(model) : '3D Model | 3D ShareSpace'
  const modelSeoDescription = model ? getModelSeoDescription(model) : 'Free 3D model on 3D ShareSpace.'

  useEffect(() => {
    if (!model || !modelId) return
    const expectedSlug = getModelSeoSlug(model)
    if (slug && slug !== expectedSlug) navigate(getModelUrl(model), { replace: true })
  }, [model, modelId, navigate, slug])

  useEffect(() => {
    if (!modelId) return undefined

    const unsubscribe = onSnapshot(
      doc(db, 'models', modelId),
      async (snapshot) => {
        if (!snapshot.exists()) {
          setError('Model not found')
          setLoading(false)
          return
        }

        const modelData = { id: snapshot.id, ...snapshot.data() }
        setModel(modelData)

        if (modelData.userId) {
          const profileResult = await firebaseHelpers.getUserProfile(modelData.userId)
          setCreatorProfile(profileResult.success ? profileResult.profile : null)
        }

        setLoading(false)
      },
      () => {
        setError('Failed to load model')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [modelId])

  useEffect(() => {
    if (!modelId) return undefined

    const timer = setTimeout(async () => {
      try {
        await firebaseHelpers.incrementViews(modelId)
      } catch (err) {
        console.warn('View tracking failed:', err)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [modelId])

  useEffect(() => {
    if (!modelId) return undefined

    const unsubscribeLikes = onSnapshot(
      query(collection(db, 'likes'), where('modelId', '==', modelId)),
      (snapshot) => {
        setModel((previous) => previous ? { ...previous, likes: snapshot.size } : previous)
      }
    )

    const unsubscribeComments = onSnapshot(
      query(collection(db, 'comments'), where('modelId', '==', modelId)),
      (snapshot) => {
        const items = snapshot.docs
          .map((commentDoc) => ({ id: commentDoc.id, ...commentDoc.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setComments(items)
      }
    )

    return () => {
      unsubscribeLikes()
      unsubscribeComments()
    }
  }, [modelId])

  useEffect(() => {
    if (!user || !modelId) return

    const checkLiked = async () => {
      const result = await firebaseHelpers.hasUserLiked(modelId, user.uid)
      if (result.success) setLiked(result.liked)
    }

    checkLiked()
  }, [user, modelId])

  useEffect(() => {
    if (!model) return

    const fetchRelatedModels = async () => {
      try {
        const result = await firebaseHelpers.getRelatedModels(modelId, model.category, model.userId, 10, model)
        if (result.success && result.models?.length) {
          setRelatedModels(result.models)
          return
        }

        const fallback = await firebaseHelpers.getModels(model.category ? { category: model.category } : {})
        if (fallback.success) {
          setRelatedModels(
            fallback.models
              .filter((item) => item.id !== modelId && item.is_private !== true && item.isPublic !== false && item.status !== 'draft')
              .slice(0, 10)
          )
        }
      } catch (err) {
        setRelatedModels([])
      }
    }

    fetchRelatedModels()
  }, [model, modelId])

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
      if (!result.success) console.warn('Download tracking failed:', result.error)

      setModel((previous) => previous ? { ...previous, downloads: (previous.downloads || 0) + 1 } : previous)
    } catch (err) {
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

    const nextLiked = !liked
    setLiked(nextLiked)
    setModel((previous) => previous ? {
      ...previous,
      likes: Math.max(0, (previous.likes || 0) + (nextLiked ? 1 : -1))
    } : previous)

    try {
      const result = await firebaseHelpers.toggleLike(modelId, user.uid)
      if (!result.success) setLiked(!nextLiked)
    } catch (err) {
      setLiked(!nextLiked)
    }
  }

  const handleComment = async (event) => {
    event.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (!newComment.trim()) return

    try {
      setSubmittingComment(true)
      const result = await firebaseHelpers.addComment(
        modelId,
        user.uid,
        newComment.trim(),
        user.displayName || user.email?.split('@')[0]
      )

      if (result.success) setNewComment('')
    } catch (err) {
      setError('Could not add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="studio-page flex items-center justify-center">
        <div className="studio-panel text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#a3a3a3]" />
          <p className="mt-3 text-sm text-[#737373]">Loading model</p>
        </div>
      </div>
    )
  }

  if (error && !model) {
    return (
      <div className="studio-page flex items-center justify-center">
        <div className="studio-empty max-w-lg">
          <h3>{error}</h3>
          <p>This asset may have been removed or made private.</p>
          <Link to="/explore" className="studio-primary-button mt-5">Back to library</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-page">
      <PageMeta
        title={modelSeoTitle}
        description={modelSeoDescription}
        keywords={[model?.title, model?.category, modelFormat, ...modelTags].filter(Boolean).join(', ')}
        url={model ? getModelUrl(model) : `/model/${modelId}`}
        image={absolutePreviewImage}
        type="article"
        publishedTime={toIsoDate(model?.createdAt)}
        modifiedTime={toIsoDate(model?.updatedAt || model?.createdAt)}
      />

      <div className="studio-container">
        <div className="mb-5 flex items-center justify-between border-b border-[#242424] pb-5">
          <Link to="/explore" className="text-sm font-semibold text-[#a3a3a3] hover:text-[#f5f5f5]">Back to library</Link>
          <div className="flex items-center gap-2">
            {isOwner && <Link to={`/model/${modelId}/edit`} className="studio-secondary-button">Edit model</Link>}
            <ReportButton modelId={modelId} modelTitle={model?.title} />
          </div>
        </div>

        {error && (
          <div className="mb-5 flex gap-3 border border-red-950 bg-red-950/20 p-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="border border-[#242424] bg-[#080808]">
              <div className="flex aspect-[16/10] items-center justify-center bg-[#050505]">
                <img
                  src={activeImage}
                  alt={getModelAltText(model, '3D model preview')}
                  className="max-h-full w-full object-contain"
                />
              </div>
              {modelImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-[#242424] p-3">
                  {modelImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-16 w-24 shrink-0 border bg-[#0a0a0a] ${index === currentImageIndex ? 'border-[#737373]' : 'border-[#242424]'}`}
                    >
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 border border-[#242424] bg-[#101010] p-5">
              <p className="studio-kicker">{model?.category || '3D model'}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#f5f5f5]">{model?.title || 'Untitled model'}</h1>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#a3a3a3]">
                {model?.description || 'No description provided.'}
              </p>

              {modelTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {modelTags.map((tag) => (
                    <Link key={tag} to={`/explore?q=${encodeURIComponent(tag)}`} className="studio-chip">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 border border-[#242424] bg-[#101010] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#f5f5f5]">Comments</h2>
                <span className="text-sm text-[#737373]">{comments.length}</span>
              </div>

              <form onSubmit={handleComment} className="mb-5">
                <textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  className="studio-textarea"
                  placeholder={user ? 'Add a useful note or question' : 'Log in to comment'}
                  disabled={!user || submittingComment}
                />
                <div className="mt-2 flex justify-end">
                  <button type="submit" disabled={!user || submittingComment || !newComment.trim()} className="studio-secondary-button disabled:opacity-40">
                    {submittingComment ? 'Posting' : 'Post comment'}
                  </button>
                </div>
              </form>

              {comments.length ? (
                <div className="space-y-3">
                  {comments.slice(0, 12).map((comment) => (
                    <div key={comment.id} className="border border-[#1f1f1f] bg-[#0b0b0b] p-3">
                      <div className="flex justify-between gap-4">
                        <p className="text-sm font-semibold text-[#f5f5f5]">{comment.userDisplayName || comment.username || 'User'}</p>
                        <p className="text-xs text-[#737373]">{formatDate(comment.createdAt)}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#737373]">No comments yet.</p>
              )}
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="border border-[#242424] bg-[#101010] p-5">
              <button onClick={handleDownload} disabled={downloading} className="studio-primary-button w-full">
                {downloading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading</> : <><Download className="mr-2 h-4 w-4" /> Download</>}
              </button>
              {!user && <p className="mt-3 text-center text-xs text-[#737373]">Log in to download this file.</p>}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button type="button" onClick={handleLike} className={`studio-secondary-button px-2 ${liked ? 'border-[#525252] text-[#f5f5f5]' : ''}`}>
                  <Heart className="mr-1 h-4 w-4" />
                  {formatCount(model?.likes)}
                </button>
                <div className="studio-secondary-button px-2">
                  <Download className="mr-1 h-4 w-4" />
                  {formatCount(model?.downloads || model?.downloads_count)}
                </div>
                <div className="studio-secondary-button px-2">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {comments.length}
                </div>
              </div>
            </div>

            <div className="border border-[#242424] bg-[#101010] p-5">
              <h2 className="text-lg font-semibold text-[#f5f5f5]">Asset details</h2>
              <div className="mt-4 divide-y divide-[#1f1f1f] text-sm">
                {[
                  ['Format', modelFormat || 'File attached'],
                  ['Category', model?.category || 'Uncategorized'],
                  ['License', model?.license || 'Free download'],
                  ['File size', model?.fileSize ? `${(Number(model.fileSize) / 1024 / 1024).toFixed(2)} MB` : 'Not listed'],
                  ['Published', formatDate(model?.createdAt || model?.created_at)],
                  ['Software', [model?.softwareUsed, model?.renderEngine, model?.version].filter(Boolean).join(' / ') || 'Not listed']
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-5 py-3">
                    <span className="text-[#737373]">{label}</span>
                    <span className="text-right text-[#d4d4d4]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#242424] bg-[#101010] p-5">
              <h2 className="text-lg font-semibold text-[#f5f5f5]">Creator</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden border border-[#303030] bg-[#151515] text-sm font-semibold text-[#f5f5f5]">
                  {creatorProfile?.avatar ? <img src={creatorProfile.avatar} alt="" className="h-full w-full object-cover" /> : creatorName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f5f5f5]">{creatorName}</p>
                  {model?.userId && <Link to={`/profile/${model.userId}`} className="text-xs text-[#737373] hover:text-[#f5f5f5]">View profile</Link>}
                </div>
              </div>
              {model?.userId && (
                <div className="mt-4">
                  <TipButton creatorId={model.userId} creatorName={creatorName} variant="small" className="w-full" />
                </div>
              )}
            </div>

            <div className="border border-emerald-950/60 bg-emerald-950/10 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                <CheckCircle className="h-4 w-4" />
                Download notes
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/80">
                <li>Check license terms before commercial use.</li>
                <li>Preview images may not show every included file.</li>
                <li>Contact the creator if project details are missing.</li>
              </ul>
            </div>
          </aside>
        </section>

        {relatedModels.length > 0 && (
          <section className="mt-8">
            <div className="studio-section-title">
              <div>
                <h2>Related models</h2>
                <p>Similar assets from the library.</p>
              </div>
              <Link to={model?.category ? `/explore?category=${encodeURIComponent(model.category)}` : '/explore'}>More in category</Link>
            </div>
            <div className="asset-grid">
              {relatedModels.map((relatedModel) => (
                <ModelCard key={relatedModel.id || relatedModel.uid} model={relatedModel} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ModelDetailPage
