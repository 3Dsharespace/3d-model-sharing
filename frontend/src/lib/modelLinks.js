export const SITE_ORIGIN = 'https://3dsharespace.com'

export const slugify = (value = '') => {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return slug || '3d-model'
}

export const getModelSeoSlug = (model = {}) => (
  slugify(model.title || model.name || model.id || '3d-model')
)

export const getModelFileFormat = (model = {}) => {
  const directFormat = model.fileFormat || model.format || model.fileExtension
  if (directFormat) return String(directFormat).replace(/^\./, '').toUpperCase()

  const fileName = model.fileName || model.name || model.fileURL || model.fileUrl || ''
  const extension = String(fileName).split('?')[0].split('.').pop()

  if (!extension || extension === fileName) return ''
  return extension.toUpperCase()
}

export const getModelSeoTitle = (model = {}) => {
  const title = model.title || model.name || '3D Model'
  const format = getModelFileFormat(model)
  const category = model.category ? `${model.category} ` : ''
  const formatText = format ? ` ${format}` : ''

  return `Free ${category}3D Model${formatText}: ${title} | 3D ShareSpace`
}

export const truncateText = (value = '', maxLength = 155) => {
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text

  return `${text.slice(0, maxLength - 1).trim()}...`
}

export const getModelSeoDescription = (model = {}) => {
  if (model.description && String(model.description).trim().length > 60) {
    return truncateText(model.description)
  }

  const title = model.title || model.name || 'this 3D model'
  const category = model.category ? `${model.category.toLowerCase()} ` : ''
  const format = getModelFileFormat(model)
  const formatText = format ? ` in ${format} format` : ''
  const license = model.license ? ` License: ${model.license}.` : ''

  return truncateText(`Download free ${category}3D model ${title}${formatText}. Preview images, creator details, tags, and related free 3D assets on 3D ShareSpace.${license}`)
}

export const getModelAltText = (model = {}, imageLabel = 'preview') => {
  const title = model.title || model.name || '3D model'
  const category = model.category ? `${model.category} ` : ''
  const format = getModelFileFormat(model)
  const formatText = format ? ` ${format}` : ''

  return `${title} ${category}3D model${formatText} ${imageLabel}`.replace(/\s+/g, ' ').trim()
}

export const getModelUrl = (modelOrId, title = '') => {
  const model = typeof modelOrId === 'object' && modelOrId !== null ? modelOrId : null
  const id = model ? model.id : modelOrId

  if (!id) return '/explore'

  const slug = model ? getModelSeoSlug(model) : slugify(title)
  return `/model/${slug}/${encodeURIComponent(id)}`
}

export const getModelImageSeoSlug = (model = {}, imageIndex = 0) => {
  const title = model.title || model.name || '3d-model'
  const category = model.category ? `${model.category} ` : ''
  return slugify(`${title} ${category}free 3d model render ${Number(imageIndex) + 1}`)
}

export const getModelImagePageUrl = (model = {}, imageIndex = 0) => (
  `${getModelUrl(model)}/images/${getModelImageSeoSlug(model, imageIndex)}`
)

export const getAbsoluteUrl = (path = '/', origin = SITE_ORIGIN) => {
  if (path.startsWith('http')) return path
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export const toIsoDate = (value) => {
  if (!value) return undefined

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  if (typeof value === 'object' && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toISOString()
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
