import { fabric } from 'fabric'
import { penStore, toolStore, setTool, addCanvasState, undoStore, undoCanvasState, redoCanvasState, clearCanvas } from './stores'
import Pen from './tools/pen'
import Eraser from './tools/eraser'
import DragTool from './tools/dragTool'
import LineTool from './tools/lineTool'

export function createCanvas (canvasEl) {
  const canvas = new fabric.Canvas(canvasEl)

  // prevent selection of canvas elements
  fabric.Object.prototype.selectable = false

  let currentTool

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

  const tools = {
    pen: new Pen(canvas),
    eraser: new Eraser(canvas),
    dragTool: new DragTool(canvas),
    lineTool: new LineTool(canvas)
  }

  // TODO
  // Set size for eraser and pen differently (or make same)
  // Allow for other tools
  penStore.watch(state => {
    tools.pen.width = state.size
    tools.pen.color = state.color
    tools.lineTool.width = state.size
    tools.lineTool.color = state.color
  })

  toolStore.watch(tool => {
    currentTool = tools[tool.current]
    currentTool.onSelect()
  })

  // Initial tool is the pen
  setTool('pen')

  let pauseSave = false

  canvas.on('object:added', () => {
    if (!pauseSave) {
      addCanvasState(canvas.toJSON())
    }
  })

  canvas.on('object:modified', () => {
    if (!pauseSave) {
      addCanvasState(canvas.toJSON())
    }
  })

  undoStore.watch(undoCanvasState, state => {
    pauseSave = true
    const canvasState = state.canvasStates[state.index]
    if (canvasState) {
      canvas.loadFromJSON(canvasState, canvas.renderAll.bind(canvas))
    }
    pauseSave = false
  })

  undoStore.watch(redoCanvasState, state => {
    pauseSave = true
    const canvasState = state.canvasStates[state.index]
    if (canvasState) {
      canvas.loadFromJSON(canvasState, canvas.renderAll.bind(canvas))
    }
    pauseSave = false
  })

  clearCanvas.watch(() => {
    canvas.clear()
    // We add the state post-clearing so that we can undo the clear.
    addCanvasState(canvas.toJSON())
  })

  // Add initial (blank) state
  addCanvasState(canvas.toJSON())

  canvas.on('mouse:down', function (opt) {
    currentTool.onDown(opt)
  })

  canvas.on('mouse:move', function (opt) {
    currentTool.onMove(opt)
  })

  canvas.on('mouse:up', function (opt) {
    currentTool.onUp(opt)
  })

  return canvas
}
