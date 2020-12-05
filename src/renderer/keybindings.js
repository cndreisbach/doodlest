import Mousetrap from 'mousetrap'
import { incPenSize, decPenSize, clearCanvas, useDrag, useLines } from './stores'

export function setupKeyBindings () {
  Mousetrap.bind('backspace', clearCanvas)
  Mousetrap.bind('mod+.', incPenSize)
  Mousetrap.bind('mod+,', decPenSize)
  Mousetrap.bind('alt', () => useDrag(true), 'keydown')
  Mousetrap.bind('alt', () => useDrag(false), 'keyup')
  Mousetrap.bind('shift', () => useLines(true), 'keydown')
  Mousetrap.bind('shift', () => useLines(false), 'keyup')
}
