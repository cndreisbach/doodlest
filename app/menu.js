const { app, Menu } = require('electron')
const { isMac } = require('./utils')

function setupMenu (contents) {
  const menuTemplate = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: function (menuItem, focusedWin) {
            contents.send('undo')
          }
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: function (menuItem, focusedWin) {
            contents.send('redo')
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Pen',
          type: 'radio',
          checked: true,
          accelerator: 'P',
          click: function (menuItem, focusedWin) {
            contents.send('useTool', 'pen')
          }
        },
        {
          label: 'Eraser',
          type: 'radio',
          accelerator: 'E',
          click: function (menuItem, focusedWin) {
            contents.send('useTool', 'eraser')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}
exports.setupMenu = setupMenu
