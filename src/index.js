/* globals Path, Tool, Point, view */

// Import dependencies
import paper, { project } from 'paper'
import { el, mount } from 'redom'
import Mousetrap from 'mousetrap'
import { selectPenColor, selectPenSize, penState } from './stores'

// Import CSS stylesheet
import './assets/css/main.css'

document.title = 'Doodler'

// State

const colorChoices = [
  '#222200',
  '#FB5012',
  '#7A306C',
  '#53917E',
  '#E9DF00',
  '#2081C3'
]

let lastPaths = []
let undoIndex = 0

selectPenColor.watch(color => {
  penCursor.fillColor = color
})

selectPenSize.watch(size => {
  penCursor.radius = size
})

// Create a canvas and mount it
const canvas = el('canvas#doodler', { resize: true })
mount(document.body, canvas)

// Set up paper
paper.setup(canvas)
paper.install(window)

// Create color palette
const colorBoard = el('.color-board', colorChoices.map(c => el('.color-selector', { style: { 'background-color': c }, 'data-color': c })))
mount(document.body, colorBoard)

colorBoard.addEventListener('click', event => {
  const newColor = event.target.dataset.color
  selectPenColor(newColor)
})

// Create a cursor for the pen
const penCursor = new Path.Circle({
  center: [0, 0],
  radius: penState.getState().size,
  fillColor: penState.getState().color,
  strokeColor: 'black'
})

// Set up pen tool
const penTool = new Tool()
let path

// Define a mousedown and mousedrag handler
penTool.onMouseDown = function (event) {
  if (undoIndex > 0) {
    lastPaths = lastPaths.slice(undoIndex)
    undoIndex = 0
  }
  path = new Path({ strokeWidth: penState.getState().size, strokeColor: penState.getState().color })
  path.add(event.point)
}

penTool.onMouseDrag = function (event) {
  path.add(event.point)
}

penTool.onMouseMove = function (event) {
  penCursor.position = event.point
}

penTool.onMouseUp = function (event) {
  path.simplify()
  path.smooth()
  lastPaths.unshift(path)
  lastPaths = lastPaths.slice(0, 10)
}

// infinite scroll
window.addEventListener('wheel', function (event) {
  view.translate(new Point(0, -event.deltaY))
})

// Undo/redo + keyboard

function undo () {
  const path = lastPaths[undoIndex]
  path.remove()
  if (undoIndex < (lastPaths.length - 1)) {
    undoIndex++
  }
}

function redo () {
  if (undoIndex > 0) {
    undoIndex--
    const path = lastPaths[undoIndex]
    path.addTo(project)
  }
}

function clearCanvas () {
  project.activeLayer.removeChildren()
  lastPaths = []
  undoIndex = 0
}

selectPenColor('#220000')
selectPenSize(3)

Mousetrap.bind(['command+z', 'control+z'], undo)
Mousetrap.bind(['command+shift+z', 'control+shift+z'], redo)
Mousetrap.bind('backspace', clearCanvas)
