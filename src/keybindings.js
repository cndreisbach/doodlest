import Mousetrap from 'mousetrap'
import { undoCanvasState, redoCanvasState, incPenSize, decPenSize, clearCanvas } from './stores'

export function setupKeyBindings ({ save }) {
  Mousetrap.bind(['command+z', 'control+z'], undoCanvasState)
  Mousetrap.bind(['command+shift+z', 'control+shift+z'], redoCanvasState)
  Mousetrap.bind('backspace', clearCanvas)
  Mousetrap.bind(['command+.', 'control+.'], incPenSize)
  Mousetrap.bind(['command+,', 'control+,'], decPenSize)
  Mousetrap.bind(['command+s', 'control+s'], save)
}
