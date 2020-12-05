import { fabric } from 'fabric'
import BaseTool from './baseTool'
import { snapCoords } from '../math'

export default class LineTool extends BaseTool {
  constructor (canvas) {
    super(canvas)
    this.width = 4
    this.color = '#000000'
  }

  onSelect () {
    this.canvas.isDrawingMode = false
    this.canvas.defaultCursor = 'crosshair'
    this.canvas.hoverCursor = 'crosshair'
    this.canvas.setCursor('crosshair')
  }

  onDown ({ e }) {
    // In order to make sure the line is drawn where our pointer is, we have to
    // transform the MouseEvent's x and y coordinates with our canvas's viewport
    // coordinates.
    const vpt = this.canvas.viewportTransform
    const x = e.clientX - vpt[4]
    const y = e.clientY - vpt[5]
    this.canvas.selection = false
    this.line = new fabric.Line([x, y, x, y], {
      strokeWidth: this.width,
      stroke: this.color,
      fill: this.color,
      originX: 'center',
      originY: 'center'
    })
    this.canvas.add(this.line)
  }

  onMove ({ e }) {
    if (this.line) {
      const vpt = this.canvas.viewportTransform
      const evtX = e.clientX - vpt[4]
      const evtY = e.clientY - vpt[5]
      const { x2, y2 } = snapCoords({
        x1: this.line.x1, y1: this.line.y1, x2: evtX, y2: evtY, tolerance: 0.1
      })
      this.line.set({ x2, y2 })
      this.canvas.renderAll()
    }
  }

  onUp () {
    this.canvas.select = true
    if (this.line) {
      this.line.setCoords()
    }
    this.line = null
  }
}
