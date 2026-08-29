import {
  buildPinterestCsvBatches,
  buildPinterestRejectedRows,
  buildPinterestRejectedRowsCsv,
  getPinterestSkippedUnsafeCount,
  PINTEREST_ALLOWED_BOARDS,
  PINTEREST_CSV_COLUMNS,
  PINTEREST_BATCH_SIZE,
  validatePinterestBatches
} from '../src/lib/pinterestCsv.js'

const sampleModels = [
  {
    id: 'shoe-model',
    title: 'Black Loafers',
    category: 'Shoes',
    fileFormat: 'ZIP',
    license: 'CC-BY-4.0',
    tags: ['black', 'loafers', 'footwear'],
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/example/o/black-loafers-render-1.jpg?alt=media',
    previewImages: [
      { url: 'https://firebasestorage.googleapis.com/v0/b/example/o/black-loafers-render-2.jpg?alt=media' }
    ],
    isPublic: true
  },
  {
    id: 'furniture-model',
    title: 'Modern Studio Chair',
    category: 'Furniture',
    format: 'FBX',
    licenseType: 'Free',
    tags: ['chair', 'interior', 'archviz'],
    previewImages: Array.from({ length: 402 }, (_, index) => ({
      url: `https://firebasestorage.googleapis.com/v0/b/example/o/chair-render-${index + 1}.jpg?alt=media`
    })),
    isPublic: true
  },
  {
    id: 'unsafe-model',
    title: 'Sci Fi Weapon Crate',
    category: 'Props',
    fileFormat: 'FBX',
    tags: ['weapon', 'crate'],
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/example/o/unsafe-render-1.jpg?alt=media',
    isPublic: true
  },
  {
    id: 'bad-media-model',
    title: 'Bad Media Model',
    category: 'Furniture',
    previewImages: [
      { url: 'http://not a valid media url' }
    ],
    isPublic: true
  }
]

const batches = buildPinterestCsvBatches(sampleModels, 'https://3dsharespace.com')
const localhostBatches = buildPinterestCsvBatches(sampleModels, 'http://localhost:3000')
const rejectedRows = buildPinterestRejectedRows(sampleModels, 'https://3dsharespace.com')
const rejectedRowsCsv = buildPinterestRejectedRowsCsv(sampleModels, 'https://3dsharespace.com')
const validation = validatePinterestBatches(batches)
const localhostValidation = validatePinterestBatches(localhostBatches)
const skippedUnsafeCount = getPinterestSkippedUnsafeCount(sampleModels)
const expectedHeader = PINTEREST_CSV_COLUMNS.join(',')
const forbiddenLinkFragments = ['localhost', '127.0.0.1', 'http://localhost', 'http://127.0.0.1']

const headerErrors = batches
  .filter((batch) => batch.csv.split(/\r?\n/)[0] !== expectedHeader)
  .map((batch) => `${batch.filename} does not start with the exact Pinterest header`)

const rowCountErrors = batches
  .filter((batch) => batch.rows.length > PINTEREST_BATCH_SIZE)
  .map((batch) => `${batch.filename} has ${batch.rows.length} rows`)

const emptyFieldErrors = batches.flatMap((batch) => (
  batch.rows.flatMap((row, rowIndex) => {
    const errors = []
    const rowColumns = Object.keys(row)
    const hasExactColumns = rowColumns.length === PINTEREST_CSV_COLUMNS.length &&
      rowColumns.every((column, columnIndex) => column === PINTEREST_CSV_COLUMNS[columnIndex])

    if (!hasExactColumns) errors.push(`${batch.filename} row ${rowIndex + 1} does not have exact Pinterest columns`)
    if (!String(row.Title || '').trim()) errors.push(`${batch.filename} row ${rowIndex + 1} has empty Title`)
    if (!row['Media URL']) errors.push(`${batch.filename} row ${rowIndex + 1} has empty Media URL`)
    if (!String(row['Pinterest board'] || '').trim()) errors.push(`${batch.filename} row ${rowIndex + 1} has empty Pinterest board`)
    if (!PINTEREST_ALLOWED_BOARDS.includes(String(row['Pinterest board'] || '').trim())) {
      errors.push(`${batch.filename} row ${rowIndex + 1} has unsupported Pinterest board`)
    }
    if (!String(row.Description || '').trim()) errors.push(`${batch.filename} row ${rowIndex + 1} has empty Description`)
    if (!row.Link) errors.push(`${batch.filename} row ${rowIndex + 1} has empty Link`)
    if (forbiddenLinkFragments.some((fragment) => String(row.Link || '').toLowerCase().includes(fragment))) {
      errors.push(`${batch.filename} row ${rowIndex + 1} contains a local Link`)
    }
    if (row.Link && !String(row.Link).startsWith('https://3dsharespace.com')) {
      errors.push(`${batch.filename} row ${rowIndex + 1} Link does not start with https://3dsharespace.com`)
    }
    if (String(row.Title || '').length > 100) errors.push(`${batch.filename} row ${rowIndex + 1} title exceeds 100 characters`)
    if (String(row.Description || '').length > 450) errors.push(`${batch.filename} row ${rowIndex + 1} description exceeds 450 characters`)
    return errors
  })
))

const rejectedReportErrors = []
if (!rejectedRowsCsv.startsWith('row number,title,reason skipped')) {
  rejectedReportErrors.push('rejected_rows.csv does not start with the expected header')
}
if (!Array.isArray(rejectedRows)) {
  rejectedReportErrors.push('Rejected rows report was not generated')
}

const localhostFallbackErrors = localhostBatches.flatMap((batch) => (
  batch.rows.flatMap((row, rowIndex) => {
    const errors = []
    if (forbiddenLinkFragments.some((fragment) => String(row.Link || '').toLowerCase().includes(fragment))) {
      errors.push(`${batch.filename} row ${rowIndex + 1} localhost fallback failed`)
    }
    if (!String(row.Link || '').startsWith('https://3dsharespace.com')) {
      errors.push(`${batch.filename} row ${rowIndex + 1} localhost fallback did not use https://3dsharespace.com`)
    }
    return errors
  })
))

const errors = [
  ...validation.errors,
  ...localhostValidation.errors,
  ...headerErrors,
  ...rowCountErrors,
  ...emptyFieldErrors,
  ...rejectedReportErrors,
  ...localhostFallbackErrors
]

if (errors.length) {
  console.error('Pinterest CSV verification failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`Pinterest CSV verification passed: ${batches.length} files, ${batches.reduce((sum, batch) => sum + batch.rows.length, 0)} rows. Rejected rows: ${rejectedRows.length}. Skipped unsafe records: ${skippedUnsafeCount}.`)
