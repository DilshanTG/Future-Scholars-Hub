import Konva from 'konva'
import { PDFDocument } from 'pdf-lib'
import type { MarkPage } from '@/types/marking'
import { denormalizeStroke } from '@/lib/strokeGeometry'

/** Pages render into the PDF in exactly their current grid order. */
export function renderOrder(pages: MarkPage[]): MarkPage[] {
  return pages.slice()
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new window.Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    image.src = url
  })
}

/** Render one page (full-res image + strokes) to a JPEG blob via an offscreen Konva stage. */
async function renderPageJpeg(page: MarkPage): Promise<Blob> {
  const img = await loadImage(page.imageBlob)
  const rotated = page.rotation === 90 || page.rotation === 270
  const w = rotated ? page.height : page.width
  const h = rotated ? page.width : page.height

  const container = document.createElement('div')
  const stage = new Konva.Stage({ container, width: w, height: h })

  const imgLayer = new Konva.Layer({ listening: false })
  imgLayer.add(new Konva.Image({
    image: img,
    width: page.width,
    height: page.height,
    rotation: page.rotation,
    x: page.rotation === 90 ? w : page.rotation === 180 ? w : 0,
    y: page.rotation === 270 ? h : page.rotation === 180 ? h : 0,
  }))
  stage.add(imgLayer)

  const strokeLayer = new Konva.Layer()
  for (const s of page.strokes) {
    const d = denormalizeStroke(s, w, h)
    strokeLayer.add(new Konva.Line({
      points: d.points,
      stroke: d.color,
      strokeWidth: d.width,
      tension: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
      globalCompositeOperation: s.mode === 'eraser' ? 'destination-out' : 'source-over',
    }))
  }
  stage.add(strokeLayer)

  const blob = await stage.toBlob({ mimeType: 'image/jpeg', quality: 0.85 }) as Blob
  stage.destroy()
  return blob
}

/**
 * Build a single PDF from the ordered pages. Reports progress (0..1).
 * Bad pages are skipped (onSkip called) so one corrupt page can't abort the export.
 */
export async function buildPdf(
  pages: MarkPage[],
  onProgress?: (done: number, total: number) => void,
  onSkip?: (pageId: string) => void,
): Promise<Uint8Array> {
  const ordered = renderOrder(pages)
  const pdf = await PDFDocument.create()
  let done = 0
  for (const page of ordered) {
    try {
      const jpeg = await renderPageJpeg(page)
      const bytes = new Uint8Array(await jpeg.arrayBuffer())
      const embedded = await pdf.embedJpg(bytes)
      const pdfPage = pdf.addPage([embedded.width, embedded.height])
      pdfPage.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height })
    } catch {
      onSkip?.(page.id)
    }
    onProgress?.(++done, ordered.length)
  }
  return pdf.save()
}
