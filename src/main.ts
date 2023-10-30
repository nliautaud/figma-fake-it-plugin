
import { Method, Fake, NamedItem } from './fake'
import { Storage } from './storage'
import { Nodes } from './nodes'
import { Suggest } from './suggest'
import { FakerLanguage } from './data'

export async function quickRun() {
  figma.parameters.on('input', async ({ key, query, parameters, result }: ParameterInputEvent) => {

    if (!parameters) return
    const { lang, category, type: method, tag } = parameters

    await storeHistory(lang, category, method)

    switch (key) {
      case 'lang':
        result.setSuggestions(await Suggest.languages(query))
        break
      case 'category':
        result.setSuggestions(await Suggest.categories(query))
        break
      case 'type':
        result.setSuggestions(await Suggest.methods(query, category))
        break
      case 'tag':
        result.setSuggestions([{ name: "Yes", data: true }])
        break
      default:
        return
    }
  })

  figma.on('run', async ({ parameters }: RunEvent) => {
    if (!parameters) return
    const { lang, category, type: method, tag } = parameters

    await Nodes.handleTestFrame()

    await run(lang, category, method, tag)
    
    figma.closePlugin()
  })
}

export async function quickUpdate() {
  figma.parameters.on('input', async ({ key, query, parameters, result }: ParameterInputEvent) => {
    switch (key) {
      case 'lang':
        result.setSuggestions(await Suggest.languages(query))
        break
      default:
        await storeHistory(parameters.lang)
        return
    }
  })

  figma.on('run', async ({ parameters }: RunEvent) => {
    if (!parameters) return
    const { lang } = parameters

    await Nodes.handleTestFrame()

    await update(lang)
    
    figma.closePlugin()
  })
}

function resultNotification(processed: number, errors: number) {
  if (errors) {
    figma.notify(`${processed} ${processed == 1 ? 'item' : 'items'} faked (${errors} skipped)`, { timeout: 3000 })
  } else {
    figma.notify(`${processed} ${processed == 1 ? 'item' : 'items'} faked`, { timeout: 1000 })
  }
}

async function update(lang: FakerLanguage) {

  await storeHistory(lang)

  let processed = 0, errors = 0
  const txtNodes = Nodes.getSelected()

  for (const node of txtNodes) {
    const params = Nodes.paramsFromName(node)
    if (!params) continue
    const { category, type, key } = params
    if (!category || !Fake.categories().find(cat => cat.name == category))
      continue
    let method: Method | false = Fake.allMethods.find(item => item.category == category && item.name == type && item.key == key) || false
    let success = true
    try {
      const text = Fake.fake(lang, category, method)
      await Nodes.edit(node, text) && node.characters.length
    } catch (e) {
      console.error(e)
      errors += 1
      success = false
    }
    processed += 1

    if (node.parent?.name == 'FAKEIT_MethodFrame') {
      (node.parent.children[0] as TextNode).fills = [{ type: 'SOLID', color: { r: success ? 0 : 1, g: 0, b: 0 } }]
    }
  }
  resultNotification(processed, errors)
}

async function run(lang: FakerLanguage, category: NamedItem, method: Method, tag: boolean) {
  await storeHistory(lang, category, method)

  let processed = 0, errors = 0
  const txtNodes = Nodes.getSelected()
  const txtRange = figma.currentPage.selectedTextRange
  if (txtRange) {
    const text = Fake.fake(lang, category.name, method)
    await Nodes.editRange(txtRange, text)
    processed += 1
  } else {
    if (txtNodes.length == 0)
      txtNodes.push(Nodes.create(figma.viewport.center))
    for (const node of txtNodes) {
      try {
        const text = Fake.fake(lang, category.name, method)
        await Nodes.edit(node, text)
      } catch (e) {
        console.error(e)
        errors += 1
      }
      processed += 1
      if (tag) {
        Nodes.tag(node, category.name, method)
      }
    }
  }
  resultNotification(processed, errors)
}

async function storeHistory(lang?: FakerLanguage, category?: NamedItem, method?: Method) {
  console.log(await Storage.get('history.lang'))
  if (lang) {
    await Storage.push<string>('history.lang', lang.code)
  }
  if (category) {
    await Storage.push<string>('history.cat', category.name)
  }
  if (method) {
    await Storage.push<Method>('history.method', method, (stored) => Fake.equals(method, stored))
  }
}

export async function clearHistory() {
  await Storage.clear('history.lang')
  await Storage.clear('history.cat')
  await Storage.clear('history.method')
  figma.closePlugin()
  figma.notify(`Cleared history`, { timeout: 3000 })
}

export const Main = {
  run,
  update
}