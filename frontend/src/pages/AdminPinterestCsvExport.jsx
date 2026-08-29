import React, { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, FileSpreadsheet, Loader2, Shield, RefreshCw } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import {
  buildPinterestCsvBatches,
  buildPinterestRejectedRows,
  buildPinterestRejectedRowsCsv,
  buildPinterestRssFeeds,
  buildPinterestRows,
  getPinterestSkippedUnsafeCount,
  PINTEREST_ALLOWED_BOARDS,
  PINTEREST_BOARD_MAPPINGS,
  PINTEREST_CSV_COLUMNS,
  PUBLIC_SITE_URL,
  validatePinterestBatches
} from '../lib/pinterestCsv'

const downloadedStorageKey = 'pinterestCsvDownloads:v1'
const DOWNLOAD_DELAY_MS = 500

const isAdminProfile = (profile = {}) => (
  profile?.isAdmin === true ||
  ['admin', 'super_admin', 'administrator'].includes(profile?.role)
)

const downloadCsv = (batch) => {
  const blob = new Blob([batch.csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = batch.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadRejectedRowsCsv = (csv) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rejected_rows.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const crcTable = (() => {
  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }

  return table
})()

const getCrc32 = (bytes) => {
  let crc = 0xffffffff
  for (let index = 0; index < bytes.length; index += 1) {
    crc = crcTable[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const createHeader = (size, writes) => {
  const bytes = new Uint8Array(size)
  const view = new DataView(bytes.buffer)
  writes(view)
  return bytes
}

const createZipBlob = (batches) => {
  const encoder = new TextEncoder()
  const fileParts = []
  const centralParts = []
  let offset = 0

  batches.forEach((batch) => {
    const nameBytes = encoder.encode(batch.filename)
    const dataBytes = encoder.encode(batch.csv)
    const crc = getCrc32(dataBytes)

    const localHeader = createHeader(30, (view) => {
      view.setUint32(0, 0x04034b50, true)
      view.setUint16(4, 20, true)
      view.setUint16(6, 0, true)
      view.setUint16(8, 0, true)
      view.setUint16(10, 0, true)
      view.setUint16(12, 0, true)
      view.setUint32(14, crc, true)
      view.setUint32(18, dataBytes.length, true)
      view.setUint32(22, dataBytes.length, true)
      view.setUint16(26, nameBytes.length, true)
      view.setUint16(28, 0, true)
    })

    fileParts.push(localHeader, nameBytes, dataBytes)

    const centralHeader = createHeader(46, (view) => {
      view.setUint32(0, 0x02014b50, true)
      view.setUint16(4, 20, true)
      view.setUint16(6, 20, true)
      view.setUint16(8, 0, true)
      view.setUint16(10, 0, true)
      view.setUint16(12, 0, true)
      view.setUint16(14, 0, true)
      view.setUint32(16, crc, true)
      view.setUint32(20, dataBytes.length, true)
      view.setUint32(24, dataBytes.length, true)
      view.setUint16(28, nameBytes.length, true)
      view.setUint16(30, 0, true)
      view.setUint16(32, 0, true)
      view.setUint16(34, 0, true)
      view.setUint16(36, 0, true)
      view.setUint32(38, 0, true)
      view.setUint32(42, offset, true)
    })

    centralParts.push(centralHeader, nameBytes)
    offset += localHeader.length + nameBytes.length + dataBytes.length
  })

  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const endRecord = createHeader(22, (view) => {
    view.setUint32(0, 0x06054b50, true)
    view.setUint16(4, 0, true)
    view.setUint16(6, 0, true)
    view.setUint16(8, batches.length, true)
    view.setUint16(10, batches.length, true)
    view.setUint32(12, centralDirectorySize, true)
    view.setUint32(16, offset, true)
    view.setUint16(20, 0, true)
  })

  return new Blob([...fileParts, ...centralParts, endRecord], { type: 'application/zip' })
}

const downloadAllCsvsAsZip = (batches) => {
  const blob = createZipBlob(batches)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pinterest_bulk_upload_csvs.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const readDownloadedMarks = () => {
  if (typeof window === 'undefined') return {}

  try {
    const parsed = JSON.parse(window.localStorage.getItem(downloadedStorageKey) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch (error) {
    return {}
  }
}

const formatDownloadedAt = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default function AdminPinterestCsvExport() {
  const { user, profile, loading: authLoading } = useAuth()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadedMarks, setDownloadedMarks] = useState(readDownloadedMarks)
  const [downloadingRemaining, setDownloadingRemaining] = useState(false)
  const [copiedFeed, setCopiedFeed] = useState('')

  const isAdmin = isAdminProfile(profile)

  const loadModels = async () => {
    if (!isAdmin) return

    setLoading(true)
    setError('')

    const result = await firebaseHelpers.getModels({})

    if (result.success) {
      setModels(result.models || [])
    } else {
      setError(result.error || 'Could not load model records')
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    loadModels()
  }, [authLoading, user?.uid, isAdmin])

  const origin = PUBLIC_SITE_URL
  const rows = useMemo(() => buildPinterestRows(models, origin), [models, origin])
  const batches = useMemo(() => buildPinterestCsvBatches(models, origin), [models, origin])
  const rejectedRows = useMemo(() => buildPinterestRejectedRows(models, origin), [models, origin])
  const rejectedRowsCsv = useMemo(() => buildPinterestRejectedRowsCsv(models, origin), [models, origin])
  const rssFeeds = useMemo(() => buildPinterestRssFeeds(models, origin), [models, origin])
  const validation = useMemo(() => validatePinterestBatches(batches), [batches])
  const skippedUnsafeCount = useMemo(() => getPinterestSkippedUnsafeCount(models), [models])
  const downloadedCount = batches.filter((batch) => downloadedMarks[batch.filename]).length
  const remainingCount = Math.max(0, batches.length - downloadedCount)

  const saveDownloadedMarks = (nextMarks) => {
    setDownloadedMarks(nextMarks)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(downloadedStorageKey, JSON.stringify(nextMarks))
    }
  }

  const markDownloaded = (filenames) => {
    const timestamp = new Date().toISOString()
    const nextMarks = { ...downloadedMarks }
    filenames.forEach((filename) => {
      nextMarks[filename] = timestamp
    })
    saveDownloadedMarks(nextMarks)
  }

  const handleDownloadCsv = (batch) => {
    downloadCsv(batch)
    markDownloaded([batch.filename])
  }

  const handleDownloadZip = () => {
    downloadAllCsvsAsZip(batches)
    markDownloaded(batches.map((batch) => batch.filename))
  }

  const clearDownloadedMarks = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(downloadedStorageKey)
    }
    setDownloadedMarks({})
  }

  const handleDownloadRemaining = async () => {
    const remainingBatches = batches.filter((batch) => !downloadedMarks[batch.filename])
    if (!remainingBatches.length || downloadingRemaining) return

    setDownloadingRemaining(true)
    let nextMarks = { ...downloadedMarks }

    for (const batch of remainingBatches) {
      downloadCsv(batch)
      nextMarks = {
        ...nextMarks,
        [batch.filename]: new Date().toISOString()
      }
      saveDownloadedMarks(nextMarks)
      await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_DELAY_MS))
    }

    setDownloadingRemaining(false)
  }

  const copyFeedUrl = async (feedUrl) => {
    await navigator.clipboard.writeText(feedUrl)
    setCopiedFeed(feedUrl)
    setTimeout(() => setCopiedFeed(''), 1600)
  }

  if (authLoading || loading) {
    return (
      <main className="studio-page">
        <div className="studio-container">
          <section className="studio-empty">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <h1>Preparing Pinterest export</h1>
            <p>Loading model image records from Firestore.</p>
          </section>
        </div>
      </main>
    )
  }

  if (!user || !isAdmin) {
    return (
      <main className="studio-page">
        <div className="studio-container">
          <section className="studio-empty">
            <Shield className="mx-auto h-8 w-8" />
            <h1>Admin access required</h1>
            <p>This Pinterest CSV export is only available to 3D ShareSpace admins.</p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="studio-page admin-pinterest-export">
      <PageMeta
        title="Pinterest CSV Export - Admin"
        description="Admin-only Pinterest bulk upload CSV export for 3D ShareSpace model renders."
        url="/admin/export-pinterest-csv"
      />

      <div className="studio-container">
        <section className="studio-page__header">
          <div>
            <p className="studio-kicker">Admin export</p>
            <h1>Pinterest bulk upload CSV</h1>
            <p>Generate Pinterest-ready CSV batches from public free model renders. Each file is capped at 200 media rows.</p>
          </div>
          <div className="studio-header-actions">
            <button
              type="button"
              className="studio-button studio-button--primary"
              onClick={handleDownloadZip}
              disabled={!batches.length}
            >
              <Download size={14} />
              Download all CSVs as ZIP
            </button>
            <button
              type="button"
              className="studio-button studio-button--secondary"
              onClick={handleDownloadRemaining}
              disabled={!remainingCount || downloadingRemaining}
            >
              {downloadingRemaining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={14} />}
              Download remaining CSVs
            </button>
            <button type="button" className="studio-button studio-button--secondary" onClick={loadModels}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <section className="studio-panel mt-6 border-red-900/60 bg-red-950/20 text-sm text-red-200">
            {error}
          </section>
        )}

        <section className="studio-panel mt-6">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['Model records', models.length],
              ['Pinterest rows', rows.length],
              ['CSV files', batches.length],
              ['Rejected CSV rows', rejectedRows.length],
              ['Unsafe skipped', skippedUnsafeCount],
              ['Rows per file', '200 max']
            ].map(([label, value]) => (
              <div key={label} className="border border-[#242424] bg-[#0a0a0a] p-4">
                <div className="text-2xl font-bold text-[#f5f5f5]">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#737373]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="studio-panel mt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f5]">Pinterest safety filter</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a3a3a3]">
                Unsafe records stay on 3D ShareSpace, but are excluded from Pinterest CSV and RSS exports.
              </p>
            </div>
            <div className="border border-[#242424] bg-[#050505] px-4 py-3 text-right">
              <div className="text-2xl font-bold text-[#f5f5f5]">{skippedUnsafeCount.toLocaleString()}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#737373]">Skipped records</div>
            </div>
          </div>
        </section>

        <section className="studio-panel mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f5]">Rejected rows report</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a3a3a3]">
                Rows are rejected before CSV export if required Pinterest fields are missing, URLs are invalid, or the board does not match the allowed board list.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PINTEREST_ALLOWED_BOARDS.map((board) => (
                  <span key={board} className="border border-[#242424] bg-[#050505] px-3 py-2 text-xs font-semibold text-[#d4d4d4]">
                    {board}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="studio-button studio-button--secondary"
              onClick={() => downloadRejectedRowsCsv(rejectedRowsCsv)}
            >
              <Download size={14} />
              Download rejected_rows.csv
            </button>
          </div>
          <div className="mt-4 border border-[#242424] bg-[#050505] p-4">
            <div className="text-2xl font-bold text-[#f5f5f5]">{rejectedRows.length.toLocaleString()}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#737373]">Rows rejected before export</div>
            {rejectedRows.length > 0 && (
              <div className="mt-4 space-y-2">
                {rejectedRows.slice(0, 5).map((row) => (
                  <div key={`${row['row number']}-${row.title}`} className="text-xs leading-5 text-[#a3a3a3]">
                    <span className="font-semibold text-[#f5f5f5]">Row {row['row number']}:</span> {row.title || 'Untitled'} - {row['reason skipped']}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="studio-panel mt-6">
          <h2 className="text-lg font-bold text-[#f5f5f5]">Pinterest board mapping summary</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PINTEREST_BOARD_MAPPINGS.map((mapping) => (
              <div key={mapping.board} className="border border-[#242424] bg-[#050505] p-4">
                <h3 className="text-sm font-bold text-[#f5f5f5]">{mapping.board}</h3>
                <p className="mt-2 text-xs leading-5 text-[#a3a3a3]">{mapping.matches}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="studio-panel mt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f5]">Pinterest RSS Auto-publish</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a3a3a3]">
                Add these RSS 2.0 feeds in Pinterest for automatic publishing. Each feed is capped at the latest 200 Pinterest-safe image renders.
              </p>
            </div>
            <div className="text-sm text-[#737373]">{rssFeeds.length} RSS feeds</div>
          </div>
          <div className="mt-4 grid gap-3">
            {rssFeeds.map((feed) => (
              <article key={feed.slug} className="border border-[#242424] bg-[#050505] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#f5f5f5]">{feed.url}</h3>
                    <p className="mt-1 text-xs text-[#737373]">
                      Board: {feed.board} · {feed.itemCount.toLocaleString()} latest item{feed.itemCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button type="button" className="studio-button studio-button--secondary" onClick={() => copyFeedUrl(feed.url)}>
                    {copiedFeed === feed.url ? <Check size={14} /> : <Copy size={14} />}
                    {copiedFeed === feed.url ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-panel mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f5]">
                Downloaded {downloadedCount.toLocaleString()} / {batches.length.toLocaleString()} CSV files
              </h2>
              <p className="mt-1 text-sm text-[#a3a3a3]">{remainingCount.toLocaleString()} remaining</p>
            </div>
            <button
              type="button"
              className="studio-button studio-button--secondary"
              onClick={clearDownloadedMarks}
              disabled={!downloadedCount}
            >
              Clear downloaded marks
            </button>
          </div>
        </section>

        <section className="studio-panel mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f5]">CSV schema</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a3a3a3]">
                Columns are exported in Pinterest bulk upload order. Media URL uses direct public image URLs, and Link points to the public model image page.
              </p>
            </div>
            <div className={validation.success ? 'text-sm text-emerald-300' : 'text-sm text-red-300'}>
              {validation.success ? 'Local validation passed' : `${validation.errors.length} validation issue(s)`}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {PINTEREST_CSV_COLUMNS.map((column) => (
              <span key={column} className="border border-[#242424] bg-[#050505] px-3 py-2 text-xs font-semibold text-[#d4d4d4]">
                {column}
              </span>
            ))}
          </div>
          {!validation.success && (
            <ul className="mt-4 space-y-1 text-sm text-red-200">
              {validation.errors.slice(0, 12).map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>

        <section className="mt-6 grid gap-3">
          {batches.length === 0 ? (
            <div className="studio-empty">
              <FileSpreadsheet className="mx-auto h-8 w-8" />
              <h2>No exportable image rows</h2>
              <p>Public free models with preview images will appear here.</p>
            </div>
          ) : batches.map((batch) => (
            <article key={batch.filename} className="studio-panel flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#f5f5f5]">{batch.filename}</h2>
                <p className="mt-1 text-sm text-[#737373]">
                  {batch.rowCount} Pinterest media row{batch.rowCount === 1 ? '' : 's'}
                </p>
                {downloadedMarks[batch.filename] && (
                  <p className="mt-2 text-sm font-semibold text-emerald-300">
                    Downloaded
                    <span className="ml-2 font-normal text-[#737373]">
                      Downloaded {formatDownloadedAt(downloadedMarks[batch.filename])}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                className="studio-button studio-button--primary min-w-[180px]"
                onClick={() => handleDownloadCsv(batch)}
              >
                <Download size={14} />
                {downloadedMarks[batch.filename] ? 'Download again' : 'Download CSV'}
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
