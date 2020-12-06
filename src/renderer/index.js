// The entry point for the JavaScript application that runs in the renderer.
// Sets up the DOM, creates the Fabric.js canvas, listens for incoming messages
// from the main thread, and adds the keybindings.

import { el, mount } from 'redom'
import { ipcRenderer } from 'electron'

import { selectPenColor, undoCanvasState, redoCanvasState, setTool } from './stores'
import { setupKeyBindings } from './keybindings'
import { createCanvas } from './canvas'

import './assets/css/main.css'
import './assets/icofont/icofont.css'

// Set the window title
document.title = 'Scribblest'

// Create a canvas and mount it
const canvasEl = el('canvas#doodler')
mount(document.body, canvasEl)
const canvas = createCanvas(canvasEl)
window.canvas = canvas

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

// Handle messages from the main thread for changing tools, and undo/redo
ipcRenderer.on('useTool', (event, tool) => {
  setTool(tool)
})
ipcRenderer.on('undo', undoCanvasState)
ipcRenderer.on('redo', redoCanvasState)
ipcRenderer.on('export-svg', () => {
  console.log('export-svg')
  ipcRenderer.send('export-svg', canvas.getFullSVG())
})
ipcRenderer.on('export-png', () => {
  console.log('export-png')
  ipcRenderer.send('export-png', canvas.getFullPNGDataUrl())
})

// Keyboard
setupKeyBindings()
