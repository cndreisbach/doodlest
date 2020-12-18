import { createStore, createEvent } from 'effector'

// == Application events
// I am using an event-based system to handle application interactions. Any
// action taken through the menus, keyboard, or toolbar clicks triggers an
// event. This event can update _stores_. Both events and stores can be
// subscribed to, and other objects can react to those events.

// An example:
// When you hold down "Alt" in the app, you switch to drag mode, where you
// can drag the canvas around to get to a new part. Pressing Shift triggers
// a `useDrag` event, which then triggers a `setTool` event with the argument
// "dragTool". The tool store updates based on that event, setting the current
// tool to dragTool and setting the last-used tool to whatever we were using
// before we hit shift.
//
// Our canvas watches for changes in the tool store. When it sees a change,
// it calles .onDeselect() for the current tool object, and calls .onSelect()
// on the new tool object -- in this case, the drag tool.
//
// The toolbar also watches for changes in the tool store. When the current
// tool changes, it updates the CSS classes so that the previous tool does not
// look selected and the new tool does look selected.
//
// When Shift is released, the same set of actions occur, but this time
// triggered by a `useDrag` event with the argument `false`.
//
// The same `setTool` event mentioned above is triggered by clicking a tool
// in the toolbar. This is the beauty of the event system -- multiple parts
// of the user interface can trigger the same event and they all update
// correctly.

export const setTool = createEvent()
export const lastTool = createEvent()
export const setToolColor = createEvent()
export const incToolSize = createEvent()
export const decToolSize = createEvent()
export const addCanvasState = createEvent()
export const undoCanvasState = createEvent()
export const redoCanvasState = createEvent()
export const clearCanvas = createEvent()
export const useDrag = createEvent()
export const useLines = createEvent()

const MAX_UNDO = 50

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
