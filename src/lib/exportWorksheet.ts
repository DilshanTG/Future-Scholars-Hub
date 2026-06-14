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

export interface MarkDetails {
  title: string
  score: number
  total: number
}

interface ExportResult { skipped: string[]; fileUrl: string }

/**
 * Build the marked PDF, upload it to Supabase, save it as a student mark
 * (title/score/total + file_url), and download a local copy.
 * Throws on upload/db failure so the caller can keep the local session for retry.
 */
export async function exportWorksheet(
  studentId: string,
  pages: MarkPage[],
  mark: MarkDetails,
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

  const { error: dbError } = await supabase.from('marks').insert({
    student_id: studentId,
    title: mark.title,
    score: mark.score,
    total: mark.total,
    file_url: publicUrl,
  })
  if (dbError) throw dbError

  triggerDownload(bytes, `${mark.title || 'worksheet'}.pdf`)
  return { skipped, fileUrl: publicUrl }
}
