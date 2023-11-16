import { on, emit, showUI } from '@create-figma-plugin/utilities'

import { Storage } from '../storage'
import { ResizeHandler, NodeInfo } from './types'
import { Method } from '../fake'
import { Nodes } from '../nodes'



function sceneNodeToNodeInfo(node: SceneNode): NodeInfo {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    tag: Nodes.paramsFromName(node)
  }
}

export default async function () {
  on<ResizeHandler>('RESIZE',(height:number) => {
    figma.ui.resize(300, height)
  })
  showUI({
    height: 400,
    width: 300
  })

  const emitSelection = () => emit('selection',
    figma.currentPage.selection.length > 0,
    Nodes.textNodes(figma.currentPage.selection).map(sceneNodeToNodeInfo)
  )
  figma.on("selectionchange", emitSelection)
  emitSelection()

  emit('history.lang', await Storage.get<string>('history.lang'))
  emit('history.cat', await Storage.get<string>('history.cat'))
  emit('history.method', await Storage.get<Method>('history.method'))
}
