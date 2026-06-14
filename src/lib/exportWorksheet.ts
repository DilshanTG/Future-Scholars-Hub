import { supabase } from '@/lib/supabase'
import { buildPdf } from '@/lib/buildPdf'
import type { MarkPage } from '@/types/marking'

function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.slice()], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  // Defer revoke so Firefox/Safari don't cancel the in-flight download.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

interface ExportResult { uploaded: boolean; skipped: string[] }

/**
 * Build the PDF, upload to Supabase, record the row, and download locally.
 * Throws on upload/db failure so the caller can keep the local session for retry.
 */
export async function exportWorksheet(
  studentId: string,
  pages: MarkPage[],
  title: string,
  onProgress?: (done: number, total: number) => void,
): Promise<ExportResult> {
  const skipped: string[] = []
  const bytes = await buildPdf(pages, onProgress, (id) => skipped.push(id))

  const path = `${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('marked-worksheets')
    .upload(path, new Blob([bytes.slice()], { type: 'application/pdf' }))
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('marked-worksheets').getPublicUrl(path)

  const { error: dbError } = await supabase.from('marked_worksheets').insert({
    student_id: studentId,
    title,
    file_url: publicUrl,
    page_count: pages.length,
  })
  if (dbError) throw dbError

  triggerDownload(bytes, `${title || 'worksheet'}.pdf`)
  return { uploaded: true, skipped }
}
