import { createStore, createEvent } from 'effector'

export const selectPenColor = createEvent()
export const selectPenSize = createEvent()

export const penState = createStore({
  color: '#222200',
  size: 3
})
  .on(selectPenColor, (state, payload) => ({ ...state, color: payload }))
  .on(selectPenSize, (state, payload) => ({ ...state, size: payload }))

export const addPath = createEvent()
export const undoPath = createEvent()

export const undoState = createStore({
  index: 0,
  paths: []
})
  .on(addPath, (oldState, newPath) => {
    const newState = { index: 0 }
    const newPaths = oldState.paths.slice(oldState.index)
    newPaths.unshift(newPath)
    newState.paths = newPaths.slice(0, 10)
    return newState
  })
  .on(undoPath, (oldState) => (
    { ...oldState, index: oldState.index + 1 }
  ))
