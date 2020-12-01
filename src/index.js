import { el, mount } from 'redom'
import { selectPenColor, addCanvasState, undoCanvasState, redoCanvasState, undoStore, clearCanvas, setTool } from './stores'
import { setupKeyBindings } from './keybindings'
import './assets/css/main.css'
import './assets/icofont/icofont.css'
import { createFabricCanvas } from './canvas'
import electron from 'electron'

// Saving the canvas as SVG

document.title = 'Scribblest'

const controlsEl = el('.controls')
const dragButton = el('button#drag', el('i.icofont-drag.icofont-2x'))
controlsEl.appendChild(dragButton)
const pencilButton = el('button#pencil', el('i.icofont-pencil-alt-2.icofont-2x'))
pencilButton.addEventListener('click', () => setTool('pencil'))
controlsEl.appendChild(pencilButton)
const eraserButton = el('button#eraser', el('i.icofont-eraser.icofont-2x'))
eraserButton.addEventListener('click', () => setTool('eraser'))
controlsEl.appendChild(eraserButton)
mount(document.body, controlsEl)

// Create a canvas and mount it
const canvasEl = el('canvas#doodler')
mount(document.body, canvasEl)

const canvas = createFabricCanvas(canvasEl)

// Create color palette
const colorChoices = [
  '#222200',
  '#FB5012',
  '#7A306C',
  '#53917E',
  '#E9DF00',
  '#2081C3'
]

const colorBoard = el('.color-board', colorChoices.map(c => el('button.color-selector', { style: { display: 'block', 'background-color': c }, 'data-color': c })))
mount(document.body, colorBoard)

colorBoard.addEventListener('click', event => {
  const newColor = event.target.dataset.color
  selectPenColor(newColor)
})

// Undo / redo
// pauseSave is used b/c when we reload the canvas from JSON, a bunch of object:added events
// fire. We do not want to capture those events.
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

// Add initial (blank) state
addCanvasState(canvas.toJSON())

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

function saveAsSVG () {
  electron.ipcRenderer.send('save-file', canvas.toSVG())
}

// Keyboard

setupKeyBindings({ save: saveAsSVG })
