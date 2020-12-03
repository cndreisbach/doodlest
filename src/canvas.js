import { fabric } from 'fabric'
import { penStore, toolStore, useDrag, toggleDrawingMode } from './stores'
import { EraserBrush } from './eraser'
import { snapCoords } from './math'

export function createCanvas (canvasEl) {
  const canvas = new fabric.Canvas(canvasEl)

  // Whenever the window size changes, resize the canvas to fill the window
  function resizeCanvas () {
    const htmlEl = document.querySelector('html')
    canvas.setWidth(htmlEl.clientWidth)
    canvas.setHeight(htmlEl.clientHeight)
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
  // See addDragAndLineBehavior below for how this works.
  useDrag.watch(dragOn => {
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
  toggleDrawingMode.watch(mode => {
    canvas.isDrawingMode = mode
  })

  addDragAndLineBehavior(canvas, brushes)

  return canvas
}

function addDragAndLineBehavior (canvas, brushes) {
  canvas.on('mouse:down', function (opt) {
    const evt = opt.e
    if (evt.altKey === true) {
      this.isDragging = true
      this.selection = false
      this.lastPosX = evt.clientX
      this.lastPosY = evt.clientY
    } else if (evt.shiftKey === true) {
      this.isLines = true
      this.selection = false
      this.line = new fabric.Line([evt.clientX, evt.clientY, evt.clientX, evt.clientY], {
        strokeWidth: brushes.pen.width,
        stroke: brushes.pen.color,
        fill: brushes.pen.color,
        originX: 'center',
        originY: 'center'
      })
      canvas.add(this.line)
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
    } else if (this.isLines && this.line) {
      const evt = opt.e
      const { x2, y2 } = snapCoords({
        x1: this.line.x1, y1: this.line.y1, x2: evt.clientX, y2: evt.clientY, tolerance: 0.1
      })
      this.line.set({ x2, y2 })
      canvas.renderAll()
    }
  })
  canvas.on('mouse:up', function (opt) {
  // on mouse up we want to recalculate new interaction
  // for all objects, so we call setViewportTransform
    this.setViewportTransform(this.viewportTransform)
    this.isDragging = false
    this.selection = true
    this.isLines = false
    if (this.line) {
      this.line.setCoords()
    }
    this.line = null
  })
}
