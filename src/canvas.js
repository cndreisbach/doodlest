import { fabric } from 'fabric'
import { $pen } from './stores'

export function createFabricCanvas (canvasEl) {
// Set up fabric
  const canvas = new fabric.Canvas(canvasEl)

  function resizeCanvas () {
    const htmlEl = document.querySelector('html')
    canvas.setWidth(htmlEl.clientWidth)
    canvas.setHeight(htmlEl.clientHeight)
    canvas.calcOffset()
  }

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  canvas.setBackgroundColor('#FFF')

  // Set up free drawing
  canvas.isDrawingMode = true
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  $pen.watch(state => {
    canvas.freeDrawingBrush.width = state.size
    canvas.freeDrawingBrush.color = state.color
  })

  return canvas
}
