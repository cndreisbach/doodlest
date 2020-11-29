import { fabric } from 'fabric'
import { el, mount } from 'redom'
import { selectPenColor, $pen, addCanvasState, undoCanvasState, redoCanvasState, $undo, clearCanvas } from './stores'
import { setupKeyBindings } from './keybindings'
import './assets/css/main.css'

document.title = 'Doodlest'

// Create a canvas and mount it
const canvasEl = el('canvas#doodler')
mount(document.body, canvasEl)

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

addCanvasState(canvas.toJSON())

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

// Undo/redo + keyboard

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
  addCanvasState(canvas.toJSON())
})

const electron = require('electron')

function save () {
  electron.ipcRenderer.send('save-file', canvas.toSVG())
}

window.save = save

// Keyboard

setupKeyBindings({ save })
