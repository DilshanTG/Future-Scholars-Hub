import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarkStore } from '@/store/markStore'
import { saveSession } from '@/lib/markPersistence'
import PageUploadDropzone from '@/components/teacher/mark/PageUploadDropzone'
import PageReorderGrid from '@/components/teacher/mark/PageReorderGrid'

type Step = 'pages' | 'mark'

export default function MarkWorksheetPage() {
  const { id } = useParams<{ id: string }>()
  const { pages, addFiles, reorderPages, rotatePage, removePage, setActivePage, initSession, startFresh, studentId } = useMarkStore()
  const [step, setStep] = useState<Step>('pages')
  const [resumePrompt, setResumePrompt] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!id) return
    initSession(id).then((resumed) => setResumePrompt(resumed))
  }, [id, initSession])

  useEffect(() => {
    if (!studentId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { void saveSession(studentId, pages) }, 800)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [pages, studentId])

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return
    toast.promise(addFiles(files), { loading: 'Processing files…', success: 'Pages added', error: 'Some files could not be read' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="rounded-pill">
          <Link to={`/teacher/students/${id}`}><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-lg font-semibold">Mark Worksheet</h1>
      </div>

      {resumePrompt && (
        <div className="flex items-center justify-between rounded-lg border bg-amber-50 px-4 py-2 text-sm">
          <span>Resumed a saved session ({pages.length} pages).</span>
          <Button size="sm" variant="outline" className="rounded-pill" onClick={() => { void startFresh(id!); setResumePrompt(false) }}>
            Start fresh
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant={step === 'pages' ? 'default' : 'outline'} className="rounded-pill" onClick={() => setStep('pages')}>Pages</Button>
        <Button size="sm" variant={step === 'mark' ? 'default' : 'outline'} className="rounded-pill" disabled={pages.length === 0} onClick={() => setStep('mark')}>Mark</Button>
      </div>

      {step === 'pages' && (
        <div className="space-y-4">
          <PageUploadDropzone onFiles={handleFiles} />
          <PageReorderGrid
            pages={pages}
            onReorder={reorderPages}
            onRotate={rotatePage}
            onRemove={removePage}
            onMark={(pid) => { setActivePage(pid); setStep('mark') }}
          />
        </div>
      )}

      {step === 'mark' && <div className="text-sm text-gray-500">Marking board added in next task.</div>}
    </div>
  )
}
