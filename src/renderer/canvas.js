import { fabric } from 'fabric'
import localForage from 'localforage'

import { penStore, toolStore, setTool, addCanvasState, undoStore, undoCanvasState, redoCanvasState, clearCanvas } from './stores'
import Pen from './tools/pen'
import Eraser from './tools/eraser'
import DragTool from './tools/dragTool'
import LineTool from './tools/lineTool'
import Highlighter from './tools/highlighter'

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

  // Undo/redo
  // pauseSave is used b/c when we reload the canvas from JSON, a bunch of
  // object:added events fire. We do not want to capture those events.
  let pauseSave = false

  canvas.on('object:added', () => {
    if (!pauseSave) {
      addCanvasState(canvas.toJSON())
    }
    localForage.setItem('canvasState', canvas.toJSON())
  })

  canvas.on('object:modified', () => {
    if (!pauseSave) {
      addCanvasState(canvas.toJSON())
    }
    localForage.setItem('canvasState', canvas.toJSON())
  })

  clearCanvas.watch(() => {
    canvas.clear()
    // We add the state post-clearing so that we can undo the clear.
    addCanvasState(canvas.toJSON())
    localForage.setItem('canvasState', canvas.toJSON())
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

  localForage.getItem('canvasState').then(canvasJSON => {
    if (canvasJSON) {
      pauseSave = true
      canvas.loadFromJSON(canvasJSON, canvas.renderAll.bind(canvas))
      pauseSave = false
      // I have no insight on why, but if I do not call resizeCanvas here,
      // the saved canvas will not display until I draw on it.
      resizeCanvas()
    }

    // Add initial state
    addCanvasState(canvas.toJSON())
  })

  const tools = {
    pen: new Pen(canvas),
    eraser: new Eraser(canvas),
    dragTool: new DragTool(canvas),
    lineTool: new LineTool(canvas),
    highlighter: new Highlighter(canvas)
  }

  tools.highlighter.width = 32
  tools.eraser.width = 8

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

  canvas.on('mouse:down', function (opt) {
    currentTool.onDown(opt)
  })

  canvas.on('mouse:move', function (opt) {
    currentTool.onMove(opt)
  })

  canvas.on('mouse:up', function (opt) {
    currentTool.onUp(opt)
  })

  canvas.getFullSVG = function () {
    canvas.discardActiveObject()
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas: canvas,
      originX: 'left',
      originY: 'top'
    })
    canvas.setActiveObject(sel)
    const svg = canvas.toSVG({
      viewBox: {
        x: sel.left,
        y: sel.top,
        width: Math.ceil(sel.width),
        height: Math.ceil(sel.height)
      },
      width: Math.ceil(sel.width),
      height: Math.ceil(sel.height)
    })
    canvas.discardActiveObject()
    return svg
  }

  canvas.getFullPNGDataUrl = function () {
    canvas.discardActiveObject()
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas: canvas,
      originX: 'left',
      originY: 'top'
    })
    canvas.setActiveObject(sel)
    const png = canvas.toDataURL({
      format: 'png',
      left: sel.left,
      top: sel.top,
      width: Math.ceil(sel.width),
      height: Math.ceil(sel.height)
    })
    canvas.discardActiveObject()
    return png
  }

  return canvas
}
