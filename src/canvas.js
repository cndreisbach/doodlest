import { fabric } from 'fabric'
import { $pen, $tool, useDrag } from './stores'
import { EraserBrush } from './eraser'
import eraserIcon from './assets/icons/eraser.png'

export function createFabricCanvas (canvasEl) {
  const canvas = new fabric.Canvas(canvasEl)

  function resizeCanvas () {
    const htmlEl = document.querySelector('html')
    canvas.setWidth(htmlEl.clientWidth)
    const controlsEl = document.querySelector('.controls')
    canvas.setHeight(htmlEl.clientHeight - controlsEl.clientHeight)
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
