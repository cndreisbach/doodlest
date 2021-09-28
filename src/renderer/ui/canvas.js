import {
  addCanvasState,
  clearCanvas,
  redoCanvasState,
  setTool,
  toolStore,
  undoCanvasState,
  undoStore,
} from "../stores"

import DragTool from "../tools/dragTool"
import Eraser from "../tools/eraser"
import Highlighter from "../tools/highlighter"
import LineTool from "../tools/lineTool"
import Pen from "../tools/pen"
import { fabric } from "fabric"
import localForage from "localforage"

export function createCanvas(canvasEl) {
  const canvas = new fabric.Canvas(canvasEl)

  // prevent selection of canvas elements
  fabric.Object.prototype.selectable = false

  let currentTool

  // Whenever the window size changes, resize the canvas to fill the window
  function resizeCanvas() {
    const htmlEl = document.querySelector("html")
    canvas.setWidth(htmlEl.clientWidth)
    canvas.setHeight(htmlEl.clientHeight)
    canvas.calcOffset()
  }

  function resetCurrentToolUI() {
    // Our custom cursors for tools are objects on the canvas. When the
    // canvas is reloaded because of undo/redo or initial loading, or
    // when the canvas is cleared, we need to deselect and reselect the
    // current tool to make sure the cursor is visible.
    if (currentTool) {
      currentTool.onDeselect()
      currentTool.onSelect()
    }
  }

  window.addEventListener("resize", resizeCanvas)

  // Do an initial resize in order to make sure we start with a full-window
  // canvas.
  resizeCanvas()

  // Set canvas background to white.
  canvas.setBackgroundColor("#FFFFFF")

  // ## Undo/redo
  // pauseSave is used b/c when we reload the canvas from JSON, a bunch of
  // object:added events fire. We do not want to capture those events.
  let pauseSave = false

  // Whenever an object is added to the canvas or modified, we want to put it
  // into our undo/redo chain, and store it as the last state in the browser
  // so we can restore it after the app restarts.
  canvas.on("object:added", ({ target }) => {
    if (target.ui) {
      return
    }
    if (!pauseSave) {
      addCanvasState(canvas.toJSON())
    }
    localForage.setItem("canvasState", canvas.toJSON())
  })

  canvas.on("object:modified", ({ target }) => {
    if (target.ui) {
      return
    }
    if (!pauseSave) {
      addCanvasState(canvas.toJSON())
    }
    localForage.setItem("canvasState", canvas.toJSON())
  })

  clearCanvas.watch(() => {
    canvas.clear()
    // We add the state post-clearing so that we can undo the clear.
    addCanvasState(canvas.toJSON())
    localForage.setItem("canvasState", canvas.toJSON())
    resetCurrentToolUI()
  })

  function loadFromUndoRedo(undoState) {
    pauseSave = true
    const canvasState = undoState.canvasStates[undoState.index]
    if (canvasState) {
      canvas.loadFromJSON(canvasState, () => canvas.renderAll())
    }
    pauseSave = false
    resetCurrentToolUI()
  }
  undoStore.watch(undoCanvasState, loadFromUndoRedo)
  undoStore.watch(redoCanvasState, loadFromUndoRedo)

  localForage.getItem("canvasState").then((canvasJSON) => {
    if (canvasJSON) {
      pauseSave = true
      canvas.loadFromJSON(canvasJSON, () => canvas.renderAll())
      pauseSave = false
      // I have no insight on why, but if I do not call resizeCanvas here,
      // the saved canvas will not display until I draw on it.
      resizeCanvas()
      resetCurrentToolUI()
    }

    // Add initial state
    addCanvasState(canvas.toJSON())
  })

  const tools = {
    pen: new Pen(canvas),
    eraser: new Eraser(canvas),
    dragTool: new DragTool(canvas),
    lineTool: new LineTool(canvas),
    highlighter: new Highlighter(canvas),
  }

  tools.highlighter.width = 32
  tools.eraser.width = 8

  toolStore.watch((state) => {
    if (currentTool) {
      currentTool.onDeselect()
    }
    currentTool = tools[state.current]
    currentTool.onSelect()
    if (state[state.current].color) {
      currentTool.color = state[state.current].color
    }
    if (state[state.current].size) {
      currentTool.width = state[state.current].size
    }
  })

  // Initial tool is the pen
  setTool("pen")

  canvas.on("mouse:down", function (opt) {
    currentTool.onDown(opt)
  })

  canvas.on("mouse:move", function (opt) {
    currentTool.onMove(opt)
  })

  canvas.on("mouse:up", function (opt) {
    currentTool.onUp(opt)
  })

  canvas.getFullSVG = function () {
    canvas.discardActiveObject()
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas: canvas,
      originX: "left",
      originY: "top",
    })
    canvas.setActiveObject(sel)
    const svg = canvas.toSVG({
      viewBox: {
        x: sel.left,
        y: sel.top,
        width: Math.ceil(sel.width),
        height: Math.ceil(sel.height),
      },
      width: Math.ceil(sel.width),
      height: Math.ceil(sel.height),
    })
    canvas.discardActiveObject()
    return svg
  }

  canvas.getFullPNGDataUrl = function () {
    canvas.discardActiveObject()
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas: canvas,
      originX: "left",
      originY: "top",
    })
    canvas.setActiveObject(sel)
    const png = canvas.toDataURL({
      format: "png",
      left: sel.left,
      top: sel.top,
      width: Math.ceil(sel.width),
      height: Math.ceil(sel.height),
    })
    canvas.discardActiveObject()
    return png
  }

  return canvas
}
