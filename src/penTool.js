import { $pen, addPath } from './stores'

export default function makePenTool (paper) {
  let penCursor = new paper.Path.Circle({
    center: [0, 0],
    radius: $pen.getState().size,
    fillColor: $pen.getState().color,
    strokeColor: 'black'
  })

  $pen.watch(state => {
    // Scaling the cursor didn't work for some reason, so we remove the cursor and create a new one.
    penCursor.remove()
    const oldPos = penCursor.position
    penCursor = new paper.Path.Circle({
      center: [0, 0],
      radius: state.size / 2 + 2,
      fillColor: state.color,
      strokeColor: 'black'
    })
    penCursor.position = oldPos
  })

  // Set up pen tool
  const penTool = new paper.Tool()
  let path

  // Define a mousedown and mousedrag handler
  penTool.onMouseDown = function (event) {
    path = new paper.Path({
      strokeWidth: $pen.getState().size,
      strokeColor: $pen.getState().color,
      strokeCap: 'round',
      strokeJoin: 'round'
    })
    path.add(event.point)
  }

  penTool.onMouseDrag = function (event) {
    penCursor.position = event.point
    path.add(event.point)
  }

  penTool.onMouseMove = function (event) {
    penCursor.position = event.point
  }

  penTool.onMouseUp = function (event) {
    penCursor.position = event.point
    // path.simplify()
    path.smooth()
    addPath(path)
  }

  return penTool
}
