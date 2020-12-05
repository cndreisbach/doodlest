import BaseTool from './baseTool'

export default class DragTool extends BaseTool {
  onSelect () {
    this.canvas.isDrawingMode = false
    this.canvas.defaultCursor = 'move'
    this.canvas.hoverCursor = 'move'
    this.canvas.setCursor('move')
    this.isDown = false
  }

  onDown ({ e }) {
    const evt = e
    this.isDown = true
    this.canvas.selection = false
    this.canvas.lastPosX = evt.clientX
    this.canvas.lastPosY = evt.clientY
  }

  onMove ({ e }) {
    if (this.isDown) {
      const vpt = this.canvas.viewportTransform
      vpt[4] += e.clientX - this.canvas.lastPosX
      vpt[5] += e.clientY - this.canvas.lastPosY
      this.canvas.requestRenderAll()
      this.canvas.lastPosX = e.clientX
      this.canvas.lastPosY = e.clientY
    }
  }

  onUp () {
    this.canvas.setViewportTransform(this.canvas.viewportTransform)
    this.isDown = false
  }
}
