import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Paperclip, X, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { Student } from '@/types'

export default function NoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', link: '', details: '' })
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [removeFile, setRemoveFile] = useState(false)

  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [gradeFilter, setGradeFilter] = useState('all')
  const [search, setSearch] = useState('')

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    async function load() {
      const [{ data: note }, { data: sts }, { data: existing }] = await Promise.all([
        supabase.from('notes').select('*').eq('id', id!).single(),
        supabase.from('students').select('*').eq('archived', false).order('name'),
        supabase.from('note_assignments').select('student_id').eq('note_id', id!),
      ])
      if (note) {
        setForm({ title: note.title ?? '', link: note.link ?? '', details: note.details ?? '' })
        setExistingFileUrl(note.file_url ?? null)
      }
      setStudents(sts ?? [])
      setAvailableGrades([...new Set((sts ?? []).map((s) => s.grade))].sort())
      setSelected(new Set((existing ?? []).map((e: { student_id: string }) => e.student_id)))
      setLoading(false)
    }
    load()
  }, [id])

  const filtered = students.filter((s) => {
    const matchGrade = gradeFilter === 'all' || s.grade === gradeFilter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
    return matchGrade && matchSearch
  })

  const toggle = (sid: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(sid) ? next.delete(sid) : next.add(sid); return next })

  const selectAll = () => {
    const ids = filtered.map((s) => s.id)
    const allSel = ids.every((sid) => selected.has(sid))
    setSelected((prev) => { const next = new Set(prev); ids.forEach((sid) => allSel ? next.delete(sid) : next.add(sid)); return next })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let file_url: string | null = existingFileUrl
    if (removeFile) file_url = null

    // Upload new file if selected
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('note-files').upload(path, file)
      if (uploadError) { toast.error('File upload failed: ' + uploadError.message); setSaving(false); return }
      const { data: { publicUrl } } = supabase.storage.from('note-files').getPublicUrl(path)
      file_url = publicUrl
    }

    const { error } = await supabase.from('notes').update({
      title: form.title, link: form.link || null, details: form.details || null, file_url,
    }).eq('id', id!)

    if (error) { toast.error(error.message); setSaving(false); return }

    // Sync assignments
    await supabase.from('note_assignments').delete().eq('note_id', id!)
    if (selected.size > 0) {
      await supabase.from('note_assignments').insert(
        Array.from(selected).map((student_id) => ({ note_id: id!, student_id }))
      )
    }

    toast.success('Note updated')
    navigate('/teacher/notes')
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id))

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" /><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Note" backTo="/teacher/notes" />
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Note Details</h3>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>External Link</Label>
            <Input type="url" value={form.link} onChange={(e) => set('link', e.target.value)} className="rounded-xl" placeholder="https://..." />
          </div>

          {/* File section */}
          <div className="space-y-2">
            <Label>Attached File</Label>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif" className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRemoveFile(false) }} />

            {/* Existing file */}
            {existingFileUrl && !removeFile && !file && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <FileText className="h-5 w-5 text-green-600 shrink-0" />
                <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 flex-1 truncate hover:underline flex items-center gap-1">
                  View current file <ExternalLink className="h-3 w-3" />
                </a>
                <button type="button" onClick={() => setRemoveFile(true)} className="text-gray-400 hover:text-red-500 shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* New file selected */}
            {file && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-[#6C63FF]/20">
                <FileText className="h-5 w-5 text-[#6C63FF] shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Upload button */}
            {(!existingFileUrl || removeFile) && !file && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl text-sm text-muted-foreground hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors flex items-center justify-center gap-2">
                <Paperclip className="h-4 w-4" />Click to attach a file (PDF, Word, PPT, image — max 20MB)
              </button>
            )}
            {(existingFileUrl || file) && !removeFile && (
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-[#6C63FF] hover:underline">
                Replace with different file
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Details / Description</Label>
            <Textarea value={form.details} onChange={(e) => set('details', e.target.value)} className="rounded-xl" rows={3} />
          </div>
        </div>

        {/* Student assignment */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-700">Assigned Students</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.size} student{selected.size !== 1 ? 's' : ''} assigned</p>
            </div>
            {filtered.length > 0 && (
              <button type="button" onClick={selectAll} className="text-xs text-[#6C63FF] hover:underline font-medium">
                {allFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30" />
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-32 rounded-xl h-9 text-sm"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {availableGrades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {filtered.map((s) => (
              <label key={s.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${selected.has(s.id) ? 'bg-purple-50 border border-[#6C63FF]/20' : 'hover:bg-gray-50'}`}>
                <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                <AvatarCircle emoji={s.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.mobile}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{s.grade}</Badge>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Saving...' : `Save Changes · ${selected.size} student${selected.size !== 1 ? 's' : ''}`}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/notes')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
