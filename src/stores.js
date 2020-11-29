import { createStore, createEvent } from 'effector'

export const selectPenColor = createEvent()
export const incPenSize = createEvent()
export const decPenSize = createEvent()
export const addPath = createEvent()
export const undoPath = createEvent()
export const redoPath = createEvent()
export const clearCanvas = createEvent()

export const $pen = createStore({
  color: '#222200',
  size: 4
})
  .on(selectPenColor, (state, payload) => ({ ...state, color: payload }))
  .on(incPenSize, (state, payload) => ({ ...state, size: Math.min(64, state.size * 2) }))
  .on(decPenSize, (state, payload) => ({ ...state, size: Math.max(1, state.size / 2) }))

export const $undo = createStore({
  index: 0,
  paths: []
})
  .on(addPath, (oldState, newPath) => {
    const newPaths = oldState.paths.slice(oldState.index)
    newPaths.unshift(newPath)
    return { index: 0, paths: newPaths.slice(0, 10) }
  })
  .on(undoPath, (oldState) => (
    { ...oldState, index: Math.min(oldState.index + 1, oldState.paths.length) }
  ))
  .on(redoPath, (oldState) => {
    if (oldState.index > 0) {
      return { ...oldState, index: oldState.index - 1 }
    } else {
      return oldState
    }
  })
  .reset(clearCanvas)
