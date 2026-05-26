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

const ModelCard = ({ model, compact = false }) => {
  const thumbnail = getThumbnail(model)
  const format = getModelFileFormat(model) || model?.fileFormat || model?.format || ''
  const category = model?.category || '3D Model'
  const tags = Array.isArray(model?.tags) ? model.tags.slice(0, compact ? 1 : 2) : []

  return (
    <Link to={getModelUrl(model)} className="asset-card group">
      <div className={`asset-card__thumb ${compact ? 'aspect-[4/3]' : ''}`}>
        {thumbnail ? (
          <img src={thumbnail} alt={getModelAltText(model, '3D model preview')} loading="lazy" />
        ) : (
          <div className="asset-card__placeholder">Preview</div>
        )}
      </div>

      <div className="asset-card__body">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="studio-chip">{category}</span>
          {format && <span className="studio-chip">{format}</span>}
        </div>

        <h3 className="asset-card__title line-clamp-2">{model?.title || 'Untitled model'}</h3>
        <p className="asset-card__creator">by {getCreatorName(model)}</p>

        <div className="asset-card__meta">
          <span>{formatCount(model?.downloads || model?.downloads_count)} downloads</span>
          <span>{formatCount(model?.views || model?.view_count)} views</span>
          <span>{formatCount(model?.likes)} likes</span>
        </div>

        {tags.length > 0 && (
          <div className="asset-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="asset-card__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// ⚡ Bolt: Memoize the component to prevent unnecessary re-renders in list views
// Expected impact: Eliminates O(N) re-renders when parent page state updates (e.g. typing in a search box)
export default React.memo(ModelCard)
