import Mousetrap from 'mousetrap'
import { undoPath, redoPath, incPenSize, decPenSize, clearCanvas } from './stores'

export function setupKeyBindings ({ save }) {
  Mousetrap.bind(['command+z', 'control+z'], undoPath)
  Mousetrap.bind(['command+shift+z', 'control+shift+z'], redoPath)
  Mousetrap.bind('backspace', clearCanvas)
  Mousetrap.bind(['command+.', 'control+.'], incPenSize)
  Mousetrap.bind(['command+,', 'control+,'], decPenSize)
  Mousetrap.bind(['command+s', 'control+s'], save)
}
