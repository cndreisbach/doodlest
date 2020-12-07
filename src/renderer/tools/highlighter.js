import { fabric } from 'fabric'
import BaseTool from './baseTool'

const HIGHLIGHTER_ALPHA = 0.6
const ALPHA_HEX = Math.floor(255 * HIGHLIGHTER_ALPHA).toString(16)

const HighlighterBrush = fabric.util.createClass(fabric.PencilBrush, {
  createPath: function (pathData) {
    const path = new fabric.Path(pathData, {
      fill: null,
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: this.strokeLineCap,
      strokeMiterLimit: this.strokeMiterLimit,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray,
      opacity: HIGHLIGHTER_ALPHA
    })

    if (this.shadow) {
      this.shadow.affectStroke = true
      path.shadow = new fabric.Shadow(this.shadow)
    }

    return path
  }
})

export default class Highlighter extends BaseTool {
  constructor (canvas) {
    super()
    this.canvas = canvas
    this.brush = new HighlighterBrush(canvas)
    this.brush.decimate = 2
    this.brush.width = 10
    this.brush.color = '#E9DF00' + ALPHA_HEX
    this._baseColor = '#E9DF00'

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
    return this._baseColor
  }

  set color (color) {
    this._baseColor = color
    this.brush.color = color + ALPHA_HEX
    this.cursor.set('fill', color + ALPHA_HEX)
    this.canvas.renderAll()
  }

  onSelect () {
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush = this.brush
    this.canvas.freeDrawingCursor = 'crosshair'
    this.canvas.add(this.cursor)
    this.canvas.renderAll()
    this.canvas.contextTop.globalAlpha = HIGHLIGHTER_ALPHA
  }

  onDeselect () {
    this.canvas.contextTop.globalAlpha = 1
    this.canvas.remove(this.cursor)
    this.canvas.renderAll()
  }

  onDown () {
    this.cursor.set('visible', false)
    this.canvas.renderAll()
  }

  onUp () {
    this.cursor.set('visible', true)
    this.canvas.renderAll()
  }

  onMove ({ absolutePointer }) {
    if (this.cursor.visible) {
      this.cursor.top = absolutePointer.y
      this.cursor.left = absolutePointer.x
      this.cursor.bringToFront()
      this.cursor.setCoords()
      this.canvas.renderAll()
    }
  }
}
