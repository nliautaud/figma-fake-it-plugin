
import { Method, Fake } from './fake'

function getSelected() {
  return figma.currentPage.selection.flatMap(getChildTextNodes)
}

function getChildTextNodes(node: SceneNode): TextNode[] {
  const nodes = [] as TextNode[]
  const traverse = (n: SceneNode) => {
    if (n.type == 'TEXT') {
      nodes.push(n)
    }
    else if ("children" in n) {
      for (const child of n.children) {
        if (
          child.type === "GROUP" ||
          child.type === "FRAME" ||
          child.type === "INSTANCE" ||
          child.type === "COMPONENT" ||
          child.type === "TEXT"
        ) {
          traverse(child)
        }
      }
    }
  }
  traverse(node)
  return nodes
}

function create(position: Vector): TextNode {
  const newNode = figma.createText()
  newNode.x = position.x
  newNode.y = position.y
  return newNode
}

function tag(node: SceneNode, category?: string, method?: Method) {
  const tag = tagString(category, method)
  const match = node.name.match(/\*.+$/i)
  if (!match) {
    // append tag
    node.name += ` ${tag}`
    return
  }
  if (match[0] == tag) return // tag already exists
  // replace tag
  node.name = node.name.replace(/\*.+$/, tag)
}
function tagString(category?: string, method?: Method) {
  let tag = `*${method?.category || category || 'any'}.${method?.name || 'any'}`
  if (method?.key) tag += `.${method?.key}`
  return tag
}
function paramsFromName(node: SceneNode) {
  const match = node.name.match(/\*([^.]+)\.([^.]+)\.?([^.]+)?$/i)
  if (!match) return null
  return {
    category: match[1],
    type: match[2] != 'any' ? match[2] : false,
    key: match[3]
  }
}

async function edit(txtNode: TextNode, txt: string, font: FontName | null = null): Promise<boolean> {
  if (!txt) return false
  const fontName = font || txtNode.fontName as FontName
  await figma.loadFontAsync(fontName)
  if (font) txtNode.fontName = fontName
  txtNode.characters = `${txt}`
  return true
}

async function editRange(txtRange: {
  node: TextNode
  start: number
  end: number
}, txt: string) : Promise<void> {
  if (!txt) return
  await figma.loadFontAsync(txtRange.node.fontName as FontName)
  txtRange.node.deleteCharacters(txtRange.start, txtRange.end)
  txtRange.node.insertCharacters(txtRange.start, `${txt}`)
}


async function handleTestFrame() {
  for (const node of figma.currentPage.selection) {
    if (node.type != 'FRAME'
      || node.name != 'FAKEIT_TestFrame')
      continue
    await generateTestStructure(node)
  }
}
async function generateTestStructure(container: FrameNode | null = null) {
  if (container == null)
    container = figma.createFrame()
  else container.children.map(c => c.remove())

  container.layoutMode = 'VERTICAL'
  container.layoutSizingVertical = 'HUG'
  container.layoutSizingHorizontal = 'HUG'
  container.verticalPadding = 10
  container.horizontalPadding = 10
  container.itemSpacing = 10
  container.counterAxisSpacing = 10
  container.cornerRadius = 6
  container.fills = []
  // cats frames
  for (const category of Fake.categories()) {
    const catFrame = figma.createFrame()
    container.appendChild(catFrame)
    catFrame.name = category.name
    catFrame.strokes = [{
      type: 'SOLID',
      color: {
        r: 0,
        g: 0,
        b: 0
      }
    }]
    catFrame.resize(300, 1)
    catFrame.layoutMode = 'VERTICAL'
    catFrame.layoutSizingHorizontal = 'FIXED'
    catFrame.layoutSizingVertical = 'HUG'
    catFrame.verticalPadding = 10
    catFrame.horizontalPadding = 10
    catFrame.cornerRadius = 3
    // cat title
    const catTitleNode = figma.createText()
    catFrame.appendChild(catTitleNode)
    await edit(catTitleNode, category.name, { family: 'Inter', style: 'Bold' })
    catTitleNode.setRangeFontSize(0, category.name.length, 16)
    catTitleNode.resize(1, 1)
    catTitleNode.layoutSizingHorizontal = 'FILL'
    catTitleNode.layoutSizingVertical = 'HUG'

    const addMethodRow = (label: string, category: string, method?: Method) => {
      const methodFrame = figma.createFrame()
      const methodNameNode = figma.createText()
      const methodValueNode = figma.createText()
      catFrame.appendChild(methodFrame)
      methodFrame.appendChild(methodNameNode)
      methodFrame.appendChild(methodValueNode)
      methodFrame.layoutMode = 'HORIZONTAL'
      methodFrame.layoutSizingHorizontal = 'FILL'
      methodFrame.layoutSizingVertical = 'HUG'
      methodFrame.itemSpacing = 10
      methodFrame.name = "FAKEIT_MethodFrame"
      edit(methodNameNode, label, { family: 'Inter', style: 'Semi Bold' })
      tag(methodValueNode, category, method)
      methodValueNode.resize(1, 12)
      methodValueNode.layoutSizingHorizontal = 'FILL'
      methodValueNode.layoutSizingVertical = 'FIXED'
    }
    addMethodRow('All', category.name)
    const methods = Fake.allMethods.filter(m => m.category == category.name)
    for (const method of methods) {
      addMethodRow(method.label, category.name, method)
    }
  }
  return container
}

function center(node: SceneNode) {
  node.x = figma.viewport.center.x - node.width / 2
  node.y = figma.viewport.center.y - node.height / 2
}

export const Nodes = {
  create,
  getSelected,
  paramsFromName,
  tag,
  edit,
  editRange,
  handleTestFrame,
  center,
}