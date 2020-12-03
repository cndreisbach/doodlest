function diamondAngle (x, y) {
  // Use taxicab geometry to calculate the angle of our triangle faster
  // than traditional geometry.
  // Cribbed from: https://stackoverflow.com/a/14675998/6262
  if (y >= 0) {
    return (x >= 0 ? y / (x + y) : 1 - x / (-x + y))
  } else {
    return (x < 0 ? 2 - y / (-x - y) : 3 + x / (x - y))
  }
}

export function snapCoords ({ x1, x2, y1, y2, tolerance }) {
  // When drawing a straight line, we want the coordinates to snap to right
  // angles to aid in quickly sketching out grids, arrows, and lines.
  // This function takes the angle and uses it to decide if we are close
  // enough to a right angle to snap.
  // Tolerance should be a small number between 0 (no snap) and 0.5 (only snap).
  if (tolerance === undefined) {
    tolerance = 0.1
  }
  const angle = diamondAngle(x2 - x1, y2 - y1)
  if (angle < tolerance || (4 - angle) < tolerance) {
    y2 = y1
  } else if (Math.abs(angle - 2) < tolerance) {
    y2 = y1
  } else if (Math.abs(angle - 1) < tolerance) {
    x2 = x1
  } else if (Math.abs(angle - 3) < tolerance) {
    x2 = x1
  }
  return { x1, y1, x2, y2 }
}
