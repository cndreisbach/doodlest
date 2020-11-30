import Mousetrap from 'mousetrap'
import { undoCanvasState, redoCanvasState, incPenSize, decPenSize, clearCanvas, useDrag } from './stores'

export function setupKeyBindings ({ save }) {
  Mousetrap.bind('mod+z', undoCanvasState)
  Mousetrap.bind('mod+shift+z', redoCanvasState)
  Mousetrap.bind('backspace', clearCanvas)
  Mousetrap.bind('mod+.', incPenSize)
  Mousetrap.bind('mod+,', decPenSize)
  Mousetrap.bind('mod+s', save)
  Mousetrap.bind('alt', () => useDrag(true), 'keydown')
  Mousetrap.bind('alt', () => useDrag(false), 'keyup')
}
