// The entry point for the JavaScript application that runs in the renderer.
// Sets up the DOM, creates the Fabric.js canvas, listens for incoming messages
// from the main thread, and adds the keybindings.

import { el, mount } from 'redom'
import { ipcRenderer } from 'electron'

import { undoCanvasState, redoCanvasState, setTool } from './stores'
import { setupKeyBindings } from './keybindings'
import { createCanvas } from './canvas'
import { toolbar } from './ui/toolbar'

import './assets/css/main.css'
import './assets/icofont/icofont.css'
import './assets/photon/css/photon.min.css'

// Set the window title
document.title = 'Scribblest'

// Container needed for PhotonKit
const containerEl = el('.window')
mount(document.body, containerEl)

// Create a canvas and mount it
const canvasEl = el('canvas#doodler')
mount(containerEl, canvasEl)
const canvas = createCanvas(canvasEl)

// Debugging purposes - can access canvas from devtools.
window.canvas = canvas

mount(containerEl, toolbar)

// Handle messages from the main thread for changing tools, and undo/redo
ipcRenderer.on('useTool', (event, tool) => {
  setTool(tool)
})
ipcRenderer.on('undo', undoCanvasState)
ipcRenderer.on('redo', redoCanvasState)
ipcRenderer.on('export-svg', () => {
  ipcRenderer.send('export-svg', canvas.getFullSVG())
})
ipcRenderer.on('export-png', () => {
  ipcRenderer.send('export-png', canvas.getFullPNGDataUrl())
})

// Keyboard
setupKeyBindings()
