import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMarkStore } from '@/store/markStore'
import { saveSession } from '@/lib/markPersistence'
import { exportWorksheet } from '@/lib/exportWorksheet'
import PageUploadDropzone from '@/components/teacher/mark/PageUploadDropzone'
import PageReorderGrid from '@/components/teacher/mark/PageReorderGrid'
import MarkingBoard from '@/components/teacher/mark/MarkingBoard'

type Step = 'pages' | 'mark'

export default function MarkWorksheetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pages, addFiles, reorderPages, rotatePage, removePage, setActivePage, initSession, startFresh, studentId } = useMarkStore()
  const [step, setStep] = useState<Step>('pages')
  const [resumePrompt, setResumePrompt] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [markForm, setMarkForm] = useState({ title: '', score: '', total: '100' })
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

  // Rotating after marking would misalign existing strokes; block it with a hint.
  const handleRotate = (pid: string) => {
    const page = pages.find((p) => p.id === pid)
    if (page && page.strokes.length > 0) {
      toast.error('Clear this page’s marks before rotating it')
      return
    }
    rotatePage(pid)
  }

  const handleSubmit = async () => {
    if (!id || pages.length === 0) return
    const score = parseFloat(markForm.score)
    const total = parseFloat(markForm.total)
    if (!markForm.title.trim()) { toast.error('Enter a test / subject title'); return }
    if (isNaN(score) || isNaN(total) || total <= 0) { toast.error('Enter valid score and total'); return }
    if (score > total) { toast.error('Score cannot exceed total'); return }
    setGenerating(true)
    try {
      const { skipped } = await exportWorksheet(id, pages, { title: markForm.title.trim(), score, total })
      if (skipped.length) toast.warning(`${skipped.length} page(s) could not be rendered and were skipped`)
      await useMarkStore.getState().endSession()
      setSubmitOpen(false)
      toast.success('Mark added with marked PDF!')
      navigate(`/teacher/students/${id}/marks`)
    } catch (e) {
      toast.error('Upload failed — your work is saved, please retry: ' + (e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="rounded-pill">
          <Link to={`/teacher/students/${id}`}><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-lg font-semibold">Mark Worksheet</h1>
        <Button
          size="sm"
          className="ml-auto rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]"
          disabled={pages.length === 0 || generating}
          onClick={() => setSubmitOpen(true)}
        >
          Submit
        </Button>
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
            onRotate={handleRotate}
            onRemove={removePage}
            onMark={(pid) => { setActivePage(pid); setStep('mark') }}
          />
        </div>
      )}

      {step === 'mark' && <MarkingBoard />}

      <Dialog open={submitOpen} onOpenChange={(o) => { if (!generating) setSubmitOpen(o) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Mark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test / Subject Title *</Label>
              <Input
                value={markForm.title}
                onChange={(e) => setMarkForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
                placeholder="e.g. Mathematics — Chapter 5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Score *</Label>
                <Input
                  type="number" min="0" step="0.5"
                  value={markForm.score}
                  onChange={(e) => setMarkForm((f) => ({ ...f, score: e.target.value }))}
                  className="rounded-xl" placeholder="85"
                />
              </div>
              <div className="space-y-2">
                <Label>Out of *</Label>
                <Input
                  type="number" min="1" step="0.5"
                  value={markForm.total}
                  onChange={(e) => setMarkForm((f) => ({ ...f, total: e.target.value }))}
                  className="rounded-xl" placeholder="100"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1"
                disabled={generating}
                onClick={handleSubmit}
              >
                {generating ? 'Generating PDF…' : '+ Add Mark'}
              </Button>
              <Button variant="outline" className="rounded-pill" disabled={generating} onClick={() => setSubmitOpen(false)}>
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
