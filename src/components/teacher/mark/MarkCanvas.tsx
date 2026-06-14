import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import type Konva from 'konva'
import type { MarkPage, Stroke, ToolMode } from '@/types/marking'
import { normalizePoint, normalizeWidth, denormalizeStroke } from '@/lib/strokeGeometry'

const MAX_DISPLAY = 1100

interface Props {
  page: MarkPage
  tool: { color: string; width: number; mode: ToolMode }
  onCommitStroke: (stroke: Stroke) => void
}

export default function MarkCanvas({ page, tool, onCommitStroke }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [live, setLive] = useState<number[] | null>(null)
  const drawing = useRef(false)
  const livePressureWidth = useRef(tool.width)

  const rotated = page.rotation === 90 || page.rotation === 270
  const naturalW = rotated ? page.height : page.width
  const naturalH = rotated ? page.width : page.height
  const scale = Math.min(1, MAX_DISPLAY / Math.max(naturalW, naturalH))
  const dispW = Math.round(naturalW * scale)
  const dispH = Math.round(naturalH * scale)

  useEffect(() => {
    const url = URL.createObjectURL(page.imageBlob)
    const image = new window.Image()
    image.onload = () => setImg(image)
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [page.imageBlob])

  const handleDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    drawing.current = true
    const pos = e.target.getStage()!.getPointerPosition()!
    const pressure = e.evt.pressure && e.evt.pressure > 0 ? e.evt.pressure : 0.5
    livePressureWidth.current = tool.width * (0.5 + pressure)
    setLive([pos.x, pos.y])
  }

  const handleMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!drawing.current) return
    const pos = e.target.getStage()!.getPointerPosition()!
    setLive((prev) => (prev ? [...prev, pos.x, pos.y] : [pos.x, pos.y]))
  }

  const handleUp = () => {
    if (!drawing.current || !live) { drawing.current = false; return }
    drawing.current = false
    const norm: number[] = []
    for (let i = 0; i < live.length; i += 2) {
      const [nx, ny] = normalizePoint(live[i], live[i + 1], dispW, dispH)
      norm.push(nx, ny)
    }
    onCommitStroke({
      points: norm,
      color: tool.color,
      width: normalizeWidth(livePressureWidth.current, dispW),
      mode: tool.mode,
    })
    setLive(null)
  }

  return (
    <div style={{ touchAction: 'none', width: dispW, height: dispH }} className="mx-auto border rounded-lg overflow-hidden bg-white">
      <Stage
        width={dispW}
        height={dispH}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        <Layer listening={false}>
          {img && (
            <KonvaImage
              image={img}
              width={page.width * scale}
              height={page.height * scale}
              rotation={page.rotation}
              x={page.rotation === 90 ? dispW : page.rotation === 180 ? dispW : 0}
              y={page.rotation === 270 ? dispH : page.rotation === 180 ? dispH : 0}
            />
          )}
        </Layer>
        <Layer>
          {page.strokes.map((s, i) => {
            const d = denormalizeStroke(s, dispW, dispH)
            return (
              <Line
                key={i}
                points={d.points}
                stroke={d.color}
                strokeWidth={d.width}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={s.mode === 'eraser' ? 'destination-out' : 'source-over'}
              />
            )
          })}
          {live && (
            <Line
              points={live}
              stroke={tool.color}
              strokeWidth={livePressureWidth.current}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={tool.mode === 'eraser' ? 'destination-out' : 'source-over'}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
