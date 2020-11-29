import { createStore, createEvent } from 'effector'

export const selectPenColor = createEvent()
export const incPenSize = createEvent()
export const decPenSize = createEvent()
export const addCanvasState = createEvent()
export const undoCanvasState = createEvent()
export const redoCanvasState = createEvent()
export const clearCanvas = createEvent()

const MAX_UNDO = 10

export const $pen = createStore({
  color: '#222200',
  size: 4
})
  .on(selectPenColor, (state, payload) => ({ ...state, color: payload }))
  .on(incPenSize, (state, payload) => ({ ...state, size: Math.min(64, state.size * 2) }))
  .on(decPenSize, (state, payload) => ({ ...state, size: Math.max(1, state.size / 2) }))

export const $undo = createStore({
  index: 0,
  canvasStates: []
})
  .on(addCanvasState, (oldState, newCanvasState) => {
    const newCanvasStates = oldState.canvasStates.slice(oldState.index)
    newCanvasStates.unshift(newCanvasState)
    return { index: 0, canvasStates: newCanvasStates.slice(0, MAX_UNDO) }
  })
  .on(undoCanvasState, (oldState) => (
    { ...oldState, index: Math.min(oldState.index + 1, oldState.canvasStates.length) }
  ))
  .on(redoCanvasState, (oldState) => {
    if (oldState.index > 0) {
      return { ...oldState, index: oldState.index - 1 }
    } else {
      return oldState
    }
  })
  // .reset(clearCanvas)
