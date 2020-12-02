import { fabric } from 'fabric'
import { penStore, toolStore, useDrag, toggleDrawingMode } from './stores'
import { EraserBrush } from './eraser'

export function createCanvas (canvasEl) {
  const canvas = new fabric.Canvas(canvasEl)

  // Whenever the window size changes, resize the canvas to fill the window
  function resizeCanvas () {
    const htmlEl = document.querySelector('html')
    canvas.setWidth(htmlEl.clientWidth)
    const controlsEl = document.querySelector('.controls')
    canvas.setHeight(htmlEl.clientHeight - controlsEl.clientHeight)
    canvas.calcOffset()
  }

  window.addEventListener('resize', resizeCanvas)
  // Do an initial resize in order to make sure we start with a full-window
  // canvas.
  resizeCanvas()

  // Set canvas background to white.
  canvas.setBackgroundColor('#FFFFFF')

  // Set up free drawing
  canvas.isDrawingMode = true
  const brushes = {
    pen: new fabric.PencilBrush(canvas),
    eraser: new EraserBrush(canvas)
  }
  brushes.pen.decimate = 2
  brushes.eraser.width = 10
  brushes.eraser.color = '#FFFFFF'

  // The initial drawing brush should be the pen.
  canvas.freeDrawingBrush = brushes.pen

  // TODO
  // Set size for eraser and pen differently (or make same)
  // Allow for other tools
  penStore.watch(state => {
    brushes.pen.width = state.size
    brushes.pen.color = state.color
  })
  toolStore.watch(tool => {
    canvas.freeDrawingBrush = brushes[tool]
  })

  // Handle drag events for infinite canvas.
  // See addDragBehavior below for how this works.
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

  toggleDrawingMode.watch(mode => {
    console.log({ drawingMode: mode })
    canvas.isDrawingMode = mode
  })

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
