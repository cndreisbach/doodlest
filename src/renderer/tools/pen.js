import { fabric } from 'fabric'
import BaseTool from './baseTool'

export default class Pen extends BaseTool {
  constructor (canvas) {
    super()
    this.canvas = canvas
    this.brush = new fabric.PencilBrush(canvas)
    this.brush.decimate = 2
    this.cursor = new fabric.Circle({
      left: 0,
      top: 0,
      radius: (this.brush.width / 2) + 2,
      fill: this.brush.color,
      originX: 'center',
      originY: 'center',
      excludeFromExport: true
    })
    this.cursor.ui = true
  }

  get width () {
    return this.brush.width
  }

  set width (width) {
    this.brush.width = width
    this.cursor.set('radius', (width / 2) + 2)
    this.canvas.renderAll()
  }

  get color () {
    return this.brush.color
  }

  set color (color) {
    this.brush.color = color

    this.cursor.set('fill', color)
    this.canvas.renderAll()
  }

  onSelect () {
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush = this.brush
    this.canvas.freeDrawingCursor = 'crosshair'
    this.canvas.add(this.cursor)
    this.canvas.renderAll()
  }

  onDeselect () {
    this.canvas.remove(this.cursor)
    this.canvas.renderAll()
  }

  onMove ({ e }) {
    this.cursor.top = e.layerY
    this.cursor.left = e.layerX
    this.cursor.bringToFront()
    this.cursor.setCoords()
    this.canvas.renderAll()
  }
}
