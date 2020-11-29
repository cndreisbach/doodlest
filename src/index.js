import { el, mount } from 'redom'
import { selectPenColor, addCanvasState, undoCanvasState, redoCanvasState, $undo, clearCanvas } from './stores'
import { setupKeyBindings } from './keybindings'
import './assets/css/main.css'
import { createFabricCanvas } from './canvas'

document.title = 'Doodlest'

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

const colorBoard = el('.color-board', colorChoices.map(c => el('.color-selector', { style: { 'background-color': c }, 'data-color': c })))
mount(document.body, colorBoard)

colorBoard.addEventListener('click', event => {
  const newColor = event.target.dataset.color
  selectPenColor(newColor)
})

// infinite scroll
// window.addEventListener('wheel', function (event) {
//   view.translate(new Point(0, -event.deltaY))
// })

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

$undo.watch(undoCanvasState, state => {
  pauseSave = true
  const canvasState = state.canvasStates[state.index]
  if (canvasState) {
    canvas.loadFromJSON(canvasState, canvas.renderAll.bind(canvas))
  }
  pauseSave = false
})

$undo.watch(redoCanvasState, state => {
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

// Saving the canvas as SVG

const electron = require('electron')

function saveAsSVG () {
  electron.ipcRenderer.send('save-file', canvas.toSVG())
}

// Keyboard

setupKeyBindings({ save: saveAsSVG })
