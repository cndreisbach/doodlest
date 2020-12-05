import { fabric } from 'fabric'
import BaseTool from './baseTool'

export default class Pen extends BaseTool {
  constructor (canvas) {
    super()
    this.canvas = canvas
    this.brush = new fabric.PencilBrush(canvas)
    this.brush.decimate = 2
    this.canvas.width = 4
    this.canvas.color = '#000000'
  }

  get width () {
    return this.brush.width
  }

  set width (width) {
    this.brush.width = width
  }

  get color () {
    return this.brush.color
  }

  set color (color) {
    this.brush.color = color
  }

  onSelect () {
    this.canvas.isDrawingMode = true
    this.canvas.setCursor('crosshair')
    this.canvas.freeDrawingBrush = this.brush
  }
}
