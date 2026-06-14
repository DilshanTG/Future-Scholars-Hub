export type ToolMode = 'pen' | 'eraser'

export interface Stroke {
  /** Flat array of normalized points: [x0,y0,x1,y1,…], each in 0..1 */
  points: number[]
  color: string
  /** Stroke width normalized to page width (0..1) */
  width: number
  mode: ToolMode
}

export interface MarkPage {
  id: string
  source: 'image' | 'pdf'
  imageBlob: Blob
  thumbUrl: string
  /** natural pixel dimensions of the source image */
  width: number
  height: number
  rotation: 0 | 90 | 180 | 270
  strokes: Stroke[]
  undone: Stroke[]
}
