import { EventHandler } from '@create-figma-plugin/utilities'
import { Method } from '../fake'
export interface ResizeHandler extends EventHandler {
  name: 'RESIZE'
  handler: (height:number) => void
}

export interface NodeInfo {
  id: string
  name: string
  type: string
  tag: {
    category: string
    type: string | boolean
    key: string
  } | null
}
export interface SelectionHandler extends EventHandler {
  name: 'selection'
  handler: (state:boolean, nodes:NodeInfo[]) => void
}
export interface LangHistory extends EventHandler {
  name: 'history.lang'
  handler: (history:string[]) => void
}
export interface CatHistory extends EventHandler {
  name: 'history.cat'
  handler: (history:string[]) => void
}
export interface MethodHistory extends EventHandler {
  name: 'history.method'
  handler: (history:Method[]) => void
}