import { dialog } from 'electron'
import fs from 'fs'
import { homedir } from 'os'
import path from 'path'

// Use the last directory saved to when saving a new file
let lastDir = homedir()

// Both export functions share a lot of code, so I moved that code into
// a helper function that returns a function for the specific export you
// want.
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
export const exportPNG = createExportFn('png', dataUrl => Buffer.from(
  dataUrl.split(',')[1], 'base64')
)
