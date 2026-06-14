import type { MarkPage } from '@/types/marking'
import { pdfjsLib } from '@/lib/pdfjs'

/** Max display dimension for thumbnails. */
const THUMB_MAX = 240

async function bitmapDims(blob: Blob): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(blob)
  const dims = { width: bmp.width, height: bmp.height }
  bmp.close()
  return dims
}

/** Build a small object-URL thumbnail for a page image. Caller must revoke it. */
export async function makeThumb(blob: Blob): Promise<string> {
  const bmp = await createImageBitmap(blob)
  const scale = Math.min(1, THUMB_MAX / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  const thumb = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.7))
  return URL.createObjectURL(thumb)
}

function newPage(blob: Blob, source: MarkPage['source'], width: number, height: number, thumbUrl: string): MarkPage {
  return { id: crypto.randomUUID(), source, imageBlob: blob, thumbUrl, width, height, rotation: 0, strokes: [], undone: [] }
}

async function imageToPage(file: File): Promise<MarkPage> {
  const { width, height } = await bitmapDims(file)
  const thumbUrl = await makeThumb(file)
  return newPage(file, 'image', width, height, thumbUrl)
}

async function pdfToPages(file: File): Promise<MarkPage[]> {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const pages: MarkPage[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const pageObj = await pdf.getPage(i)
    const viewport = pageObj.getViewport({ scale: 2 }) // 2x for crisp marking
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await pageObj.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9))
    const thumbUrl = await makeThumb(blob)
    pages.push(newPage(blob, 'pdf', canvas.width, canvas.height, thumbUrl))
  }
  return pages
}

/** Convert dropped files into MarkPages. Unsupported files are skipped. */
export async function ingestFiles(files: File[]): Promise<MarkPage[]> {
  const out: MarkPage[] = []
  for (const file of files) {
    if (file.type === 'application/pdf') {
      out.push(...(await pdfToPages(file)))
    } else if (file.type.startsWith('image/')) {
      out.push(await imageToPage(file))
    }
  }
  return out
}
