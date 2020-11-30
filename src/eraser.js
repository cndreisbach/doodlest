import { fabric } from 'fabric'

export const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {

  /**
   * On mouseup after drawing the path on contextTop canvas
   * we use the points captured to create an new fabric path object
   * and add it to the fabric canvas.
   */
  _finalizeAndAddPath: function () {
    const ctx = this.canvas.contextTop
    ctx.closePath()
    if (this.decimate) {
      this._points = this.decimatePoints(this._points, this.decimate)
    }
    const pathData = this.convertPointsToSVGPath(this._points).join('')
    if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
      // do not create 0 width/height paths, as they are
      // rendered inconsistently across browsers
      // Firefox 4, for example, renders a dot,
      // whereas Chrome 10 renders nothing
      this.canvas.requestRenderAll()
      return
    }

    // use globalCompositeOperation to 'fake' eraser
    const path = this.createPath(pathData)
    path.globalCompositeOperation = 'destination-out'
    path.selectable = false
    path.evented = false
    path.absolutePositioned = true

    // grab all the objects that intersects with the path
    const objects = this.canvas.getObjects().filter((obj) => {
      if (!obj.intersectsWithObject(path)) return false
      return true
    })

    if (objects.length > 0) {
      this.canvas.add(path)
    }

    this.canvas.clearContext(this.canvas.contextTop)
    this.canvas.renderAll()
    this._resetShadow()
  }
})
