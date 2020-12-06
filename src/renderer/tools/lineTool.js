import { fabric } from 'fabric'
import BaseTool from './baseTool'

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
      this.canvas.requestRenderAll()
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

function diamondAngle (x, y) {
  // Use taxicab geometry to calculate the angle of our triangle faster
  // than traditional geometry.
  // Cribbed from: https://stackoverflow.com/a/14675998/6262
  if (y >= 0) {
    return (x >= 0 ? y / (x + y) : 1 - x / (-x + y))
  } else {
    return (x < 0 ? 2 - y / (-x - y) : 3 + x / (x - y))
  }
}

function snapCoords ({ x1, x2, y1, y2, tolerance }) {
  // When drawing a straight line, we want the coordinates to snap to right
  // angles to aid in quickly sketching out grids, arrows, and lines.
  // This function takes the angle and uses it to decide if we are close
  // enough to a right angle to snap.
  // Tolerance should be a small number between 0 (no snap) and 0.5 (only snap).
  if (tolerance === undefined) {
    tolerance = 0.1
  }
  const angle = diamondAngle(x2 - x1, y2 - y1)
  if (angle < tolerance || (4 - angle) < tolerance) {
    y2 = y1
  } else if (Math.abs(angle - 2) < tolerance) {
    y2 = y1
  } else if (Math.abs(angle - 1) < tolerance) {
    x2 = x1
  } else if (Math.abs(angle - 3) < tolerance) {
    x2 = x1
  }
  return { x1, y1, x2, y2 }
}
