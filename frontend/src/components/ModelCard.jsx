import React from 'react'
import { Link } from 'react-router-dom'
import { getModelAltText, getModelFileFormat, getModelUrl } from '../lib/modelLinks'

const formatCount = (value = 0) => {
  const number = Number(value) || 0
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`
  return String(number)
}

const getThumbnail = (model) => (
  model?.thumbnail ||
  model?.thumbnail_path ||
  model?.thumbnailUrl ||
  model?.imageUrl ||
  model?.previewImages?.[0]?.url ||
  model?.previewImages?.[0]?.downloadURL ||
  model?.previewImages?.[0]?.src ||
  ''
)

const getCreatorName = (model) => {
  if (model?.isPlatformModel) return '3D ShareSpace'
  return model?.creator?.username || model?.author?.username || model?.username || model?.creatorName || 'Independent creator'
}

const getVisibilityLabel = (model) => {
  if (model?.status === 'draft' || model?.isDraft === true) return 'Draft'
  if (model?.is_private === true || model?.isPublic === false || model?.is_public === false) return 'Private'
  return ''
}

const ModelCard = ({ model, compact = false }) => {
  const thumbnail = getThumbnail(model)
  const format = getModelFileFormat(model) || model?.fileFormat || model?.format || ''
  const category = model?.category || '3D Model'
  const visibilityLabel = getVisibilityLabel(model)

  return (
    <Link to={getModelUrl(model)} className="asset-card group">
      <div className={`asset-card__thumb ${compact ? 'aspect-[4/3]' : ''}`}>
        {thumbnail ? (
          <img src={thumbnail} alt={getModelAltText(model, '3D model preview')} loading="lazy" />
        ) : (
          <div className="asset-card__placeholder">
            <span>{format || category}</span>
            <span>Preview pending</span>
          </div>
        )}
        <div className="asset-card__badges">
          <span>{category}</span>
          {format && <span>{format}</span>}
          {visibilityLabel && <span>{visibilityLabel}</span>}
        </div>
      </div>

      <div className="asset-card__body">
        <h3 className="asset-card__title">{model?.title || 'Untitled model'}</h3>
        <div className="asset-card__creator">by {getCreatorName(model)}</div>

        <div className="asset-card__meta">
          <span>{formatCount(model?.downloads || model?.downloads_count)} downloads</span>
          <span>{formatCount(model?.views || model?.view_count)} views</span>
          <span>{formatCount(model?.likes)} likes</span>
        </div>
      </div>
    </Link>
  )
}

export default ModelCard
