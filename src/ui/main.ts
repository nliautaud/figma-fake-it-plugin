import { on, once, showUI } from '@create-figma-plugin/utilities'

import { ResizeHandler } from './types'

export default function () {
  on<ResizeHandler>('RESIZE',(height:number) => {
    figma.ui.resize(300, height)
  })
  showUI({
    height: 400,
    width: 300
  })
}
