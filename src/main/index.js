'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { format as formatUrl } from 'url'

const path = require('path')
const fs = require('fs')
const { setupMenu } = require('./menu')
const { isMac, isDevelopment } = require('./utils')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Keep a reference for dev mode

function createMainWindow () {
  // Create the browser window.
  const window = mainWindow = new BrowserWindow({
    width: 1024, // width of the window
    height: 768, // height of the window
    show: true, // don't show until window is ready
    title: 'Scribblest',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  setupMenu(window.webContents)

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
