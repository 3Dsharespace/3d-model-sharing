import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')

const payload = JSON.parse(await readFile(join(distDir, 'indexnow-payload.json'), 'utf8'))

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  body: JSON.stringify(payload)
})

const body = await response.text()

if (!response.ok) {
  throw new Error(`IndexNow submission failed with ${response.status}: ${body}`)
}

console.log(`Submitted ${payload.urlList.length} URLs to IndexNow.`)
