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
  }

  get width () {
    return this.brush.width
  }

  set width (width) {
    this.brush.width = width
  }

  get color () {
    return this._baseColor
  }

  set color (color) {
    this._baseColor = color
    this.brush.color = color + ALPHA_HEX
  }

  onSelect () {
    this.canvas.isDrawingMode = true
    this.canvas.setCursor('crosshair')
    this.canvas.freeDrawingBrush = this.brush
    this.canvas.contextTop.globalAlpha = HIGHLIGHTER_ALPHA
  }

  onDeselect () {
    this.canvas.contextTop.globalAlpha = 1
  }
}
