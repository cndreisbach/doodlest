import path from 'path'
import fs from 'fs'
import { dialog } from 'electron'
import { homedir } from 'os'

// Use the last directory saved to when saving a new file
let lastDir = homedir()

function createExportFn (ext, transformerFn = (contents) => contents) {
  return function (event, contents) {
    dialog.showSaveDialog({
      title: 'Select the file path to save',
      defaultPath: path.join(lastDir, `scribblest.${ext}`),
      buttonLabel: 'Save',
      filters: [
        {
          name: `${ext.toUpperCase()} files`,
          extensions: [ext]
        }],
      properties: []
    }).then(file => {
      if (!file.canceled) {
        lastDir = path.dirname(file.filePath.toString())
        fs.writeFile(file.filePath.toString(),
          transformerFn(contents), function (err) {
            if (err) throw err
            console.log('Saved!')
          })
      }
    }).catch(err => {
      console.log(err)
    })
  }
}

export const exportSVG = createExportFn('svg')
export const exportPNG = createExportFn('png', dataUrl => Buffer.from(dataUrl.split(',')[1], 'base64'))
