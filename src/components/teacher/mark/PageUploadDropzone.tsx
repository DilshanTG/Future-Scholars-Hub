import { useRef } from 'react'
import { Upload } from 'lucide-react'

export default function PageUploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onFiles(Array.from(e.dataTransfer.files))
      }}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-[#6C63FF] transition-colors"
    >
      <Upload className="h-6 w-6 text-gray-400" />
      <p className="text-sm text-gray-600">Drop images or PDFs here, or click to choose</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []))
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
    </div>
  )
}
