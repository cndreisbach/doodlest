// This class is an abstract class used to build all other tools
// in the application. It is not necessary, but I am using it for
// documentation as to what methods each tool should have.
// This is making me wonder if I should be using TypeScript.

export default class BaseTool {
  constructor (canvas) {
    this.canvas = canvas
  }

  onSelect () {
    // not implemented
  }

  onDeselect () {
    // not implemented
  }

  onDown (opt) {
    // not implemented
  }

  onMove (opt) {
    // not implemented
  }

  onUp (opt) {
    // not implemented
  }
}
