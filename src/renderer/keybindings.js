import Mousetrap from 'mousetrap'
import { clearCanvas, useDrag, useLines, incToolSize, decToolSize } from './stores'

export function setupKeyBindings () {
  Mousetrap.bind('backspace', clearCanvas)
  Mousetrap.bind('mod+.', incToolSize)
  Mousetrap.bind('mod+,', decToolSize)
  Mousetrap.bind('alt', () => useDrag(true), 'keydown')
  Mousetrap.bind('alt', () => useDrag(false), 'keyup')
  Mousetrap.bind('shift', () => useLines(true), 'keydown')
  Mousetrap.bind('shift', () => useLines(false), 'keyup')
}
