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
  const brushes = {
    pencil: new fabric.PencilBrush(canvas),
    eraser: new EraserBrush(canvas)
  }
  brushes.pencil.decimate = 2
  brushes.eraser.width = 10
  brushes.eraser.color = '#FFFFFF'

  canvas.freeDrawingBrush = brushes.pencil

  const cursors = {}

  // TODO
  // Set size for eraser and pencil differently (or make same)
  // Allow for other tools
  $pen.watch(state => {
    brushes.pencil.width = state.size
    brushes.pencil.color = state.color
  })
  $tool.watch(tool => {
    canvas.freeDrawingBrush = brushes[tool]
    if (cursors[tool]) {
      console.log(cursors[tool])
      canvas.freeDrawingCursor = cursors[tool]
    } else {
      canvas.freeDrawingCursor = 'crosshair'
    }
  })

  // Handle drag canvas
  useDrag.watch(dragOn => {
    console.log({ dragOn })
    if (dragOn) {
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'move'
      canvas.setCursor('move')
    } else {
      canvas.isDrawingMode = true
      canvas.defaultCursor = 'default'
      canvas.setCursor('crosshair')
    }
  })
  addDragBehavior(canvas)

  return canvas
}

function addDragBehavior (canvas) {
  canvas.on('mouse:down', function (opt) {
    const evt = opt.e
    if (evt.altKey === true) {
      this.isDragging = true
      this.selection = false
      this.lastPosX = evt.clientX
      this.lastPosY = evt.clientY
    }
  })
  canvas.on('mouse:move', function (opt) {
    if (this.isDragging) {
      const e = opt.e
      const vpt = this.viewportTransform
      vpt[4] += e.clientX - this.lastPosX
      vpt[5] += e.clientY - this.lastPosY
      this.requestRenderAll()
      this.lastPosX = e.clientX
      this.lastPosY = e.clientY
    }
  })
  canvas.on('mouse:up', function (opt) {
  // on mouse up we want to recalculate new interaction
  // for all objects, so we call setViewportTransform
    this.setViewportTransform(this.viewportTransform)
    this.isDragging = false
    this.selection = true
  })
}
