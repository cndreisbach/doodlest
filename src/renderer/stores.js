import { createStore, createEvent } from 'effector'

export const setTool = createEvent()
export const lastTool = createEvent()
export const selectPenColor = createEvent()
export const incPenSize = createEvent()
export const decPenSize = createEvent()
export const setPenSize = createEvent()
export const addCanvasState = createEvent()
export const undoCanvasState = createEvent()
export const redoCanvasState = createEvent()
export const clearCanvas = createEvent()
export const useDrag = createEvent()
export const useLines = createEvent()

const MAX_UNDO = 20

export const toolStore = createStore({ last: null, current: 'pen' })
  .on(setTool, (state, payload) => ({ last: state.current, current: payload }))
  .on(lastTool, (state) => {
    const last = state.last || 'pen'
    return { last: state.current, current: last }
  })

useDrag.watch(payload => {
  if (payload) {
    setTool('dragTool')
  } else {
    lastTool()
  }
})

useLines.watch(payload => {
  if (payload) {
    setTool('lineTool')
  } else {
    lastTool()
  }
})

export const penStore = createStore({
  color: '#222200',
  size: 2
})
  .on(selectPenColor, (state, payload) => ({ ...state, color: payload }))
  .on(incPenSize, (state, payload) => ({ ...state, size: Math.min(64, state.size * 2) }))
  .on(decPenSize, (state, payload) => ({ ...state, size: Math.max(1, state.size / 2) }))

export const undoStore = createStore({
  index: 0,
  canvasStates: []
})
  .on(addCanvasState, (store, newCanvasState) => {
    const newCanvasStates = store.canvasStates.slice(store.index)
    newCanvasStates.unshift(newCanvasState)
    return { index: 0, canvasStates: newCanvasStates.slice(0, MAX_UNDO) }
  })
  .on(undoCanvasState, (store) => (
    { ...store, index: Math.min(store.index + 1, store.canvasStates.length) }
  ))
  .on(redoCanvasState, (store) => {
    if (store.index > 0) {
      return { ...store, index: store.index - 1 }
    } else {
      return store
    }
  })
