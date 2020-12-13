import { el } from 'redom'
import { toolStore, selectPenColor, setTool, penStore, incPenSize, decPenSize } from '../stores'

// Create color palette
const colorChoices = [
  '#222200',
  '#FB5012',
  '#7A306C',
  '#53917E',
  '#E9DF00',
  '#2081C3'
]

// Toolbar
const toolButtons = new Map([
  ['pen', el('button.btn.btn-default', [
    el('i.icofont-pencil-alt-2.icofont-2x')
  ])],
  ['lineTool', el('button.btn.btn-default', [
    el('i.icofont-ruler-pencil-alt-1.icofont-2x')
  ])],
  ['eraser', el('button.btn.btn-default', [
    el('i.icofont-eraser.icofont-2x')
  ])],
  ['highlighter', el('button.btn.btn-default', [
    el('i.icofont-ui-flash-light.icofont-2x')
  ])],
  ['dragTool', el('button.btn.btn-default', [
    el('i.icofont-drag.icofont-2x')
  ])]
])

const colorButtons = new Map()
colorChoices.forEach(color => {
  colorButtons.set(color, (
    el('button.btn.btn-default', [
      el('div.color', {
        style: {
          'background-color': color
        }
      })
    ])
  ))
})

const colorButtonGroup = el('.btn-group', [...colorButtons.values()])

const increaseSizeBtn = el('button.btn.btn-default', [
  el('i.icofont-plus.icofont-2x')
])

const decreaseSizeBtn = el('button.btn.btn-default', [
  el('i.icofont-minus.icofont-2x')
])

increaseSizeBtn.addEventListener('click', incPenSize)
decreaseSizeBtn.addEventListener('click', decPenSize)

export const toolbar = el('header.toolbar.toolbar-header', [
  el('.toolbar-actions', [
    el('.btn-group', [
      toolButtons.get('pen'),
      toolButtons.get('lineTool'),
      toolButtons.get('eraser'),
      toolButtons.get('highlighter'),
      toolButtons.get('dragTool')
    ]),
    colorButtonGroup,
    el('.btn-group', [
      decreaseSizeBtn, increaseSizeBtn
    ])
  ])
])

toolButtons.forEach((button, tool) => {
  button.addEventListener('click', () => setTool(tool))
})

colorButtons.forEach((button, color) => {
  button.addEventListener('click', (e) => {
    selectPenColor(color)
  })
})

toolStore.watch(state => {
  toolButtons.forEach(button => {
    button.classList.remove('active')
  })
  toolButtons.get(state.current).classList.add('active')
})

penStore.watch(state => {
  colorButtons.forEach(button => {
    button.classList.remove('active')
  })
  colorButtons.get(state.color).classList.add('active')
})
