import { EventHandler } from '@create-figma-plugin/utilities'

export interface ResizeHandler extends EventHandler {
  name: 'RESIZE'
  handler: (height:number) => void
}