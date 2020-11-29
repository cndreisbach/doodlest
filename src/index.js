/* globals Point, view */

// Import dependencies
import paper, { project } from 'paper'
import { el, mount } from 'redom'
import { selectPenColor, undoPath, redoPath, $undo, clearCanvas } from './stores'
import makePenTool from './penTool'

// Import CSS stylesheet
import './assets/css/main.css'
import { setupKeyBindings } from './keybindings'

document.title = 'Doodlest'

// State

const colorChoices = [
  '#222200',
  '#FB5012',
  '#7A306C',
  '#53917E',
  '#E9DF00',
  '#2081C3'
]

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

// Create tools
makePenTool(paper)

// infinite scroll
window.addEventListener('wheel', function (event) {
  view.translate(new Point(0, -event.deltaY))
})

// Undo/redo + keyboard

$undo.watch(undoPath, state => {
  if (state.index > 0) {
    const path = state.paths[state.index - 1]
    path.remove()
  }
})

$undo.watch(redoPath, state => {
  const path = state.paths[state.index]
  if (path) {
    path.addTo(project)
  }
})

clearCanvas.watch(() => {
  project.activeLayer.removeChildren()
})

const electron = require('electron')

function save () {
  paper.view.draw()
  electron.ipcRenderer.send('save-file', paper.project.exportSVG({ asString: true, bounds: 'content' }))
}

window.save = save

// Keyboard

setupKeyBindings({ save })
