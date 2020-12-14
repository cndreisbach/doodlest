import { createStore, createEvent } from 'effector'
export const setTool = createEvent()
export const lastTool = createEvent()
export const setToolColor = createEvent()
export const incToolSize = createEvent()
export const decToolSize = createEvent()
export const selectPenColor = createEvent()
export const addCanvasState = createEvent()
export const undoCanvasState = createEvent()
export const redoCanvasState = createEvent()
export const clearCanvas = createEvent()
export const useDrag = createEvent()
export const useLines = createEvent()

const MAX_UNDO = 20

const syncPenAndLine = (state) => {
  if (state.current === 'pen') {
    return {
      ...state,
      lineTool: { ...state.pen }
    }
  } else if (state.current === 'lineTool') {
    return {
      ...state,
      pen: { ...state.lineTool }
    }
  }
  return state
}

export const toolStore = createStore({
  last: null,
  current: 'pen',
  pen: {
    color: '#222200',
    size: 2
  },
  lineTool: {
    color: '#222200',
    size: 2
  },
  eraser: {
    size: 16
  },
  highlighter: {
    color: '#E9DF00',
    size: 32
  },
  dragTool: {}
})
  .on(setTool, (state, payload) => ({ ...state, last: state.current, current: payload }))
  .on(lastTool, (state) => {
    const last = state.last || 'pen'
    return { ...state, last: state.current, current: last }
  })
  .on(setToolColor, (state, payload) => syncPenAndLine({
    ...state,
    [state.current]: {
      ...state[state.current],
      color: payload
    }
  }))
  .on(incToolSize, (state, payload) => syncPenAndLine({
    ...state,
    [state.current]: {
      ...state[state.current],
      size: Math.min(64, state[state.current].size * 2)
    }
  }))
  .on(decToolSize, (state, payload) => syncPenAndLine({
    ...state,
    [state.current]: {
      ...state[state.current],
      size: Math.max(1, state[state.current].size / 2)
    }
  }))

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
