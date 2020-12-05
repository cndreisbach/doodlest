// The entry point for the JavaScript application that runs in the renderer.
// Sets up the DOM, creates the Fabric.js canvas, listens for incoming messages
// from the main thread, and adds the keybindings.

import { el, mount } from 'redom'
import { selectPenColor, undoCanvasState, redoCanvasState, setTool } from './stores'
import { setupKeyBindings } from './keybindings'
import './assets/css/main.css'
import './assets/icofont/icofont.css'
import { createCanvas } from './canvas'
import { ipcRenderer } from 'electron'

// Saving the canvas as SVG

document.title = 'Scribblest'

// Create a canvas and mount it
const canvasEl = el('canvas#doodler')
mount(document.body, canvasEl)
createCanvas(canvasEl)

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

// Tools
ipcRenderer.on('useTool', (event, tool) => {
  setTool(tool)
})

// Undo / redo
// pauseSave is used b/c when we reload the canvas from JSON, a bunch of object:added events
// fire. We do not want to capture those events.
ipcRenderer.on('undo', undoCanvasState)
ipcRenderer.on('redo', redoCanvasState)

// Keyboard
setupKeyBindings()
