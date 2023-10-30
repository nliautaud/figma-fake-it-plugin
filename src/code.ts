
import { Method, Fake } from './fake'
import { Storage } from './storage'
import { Nodes } from './nodes'
import { Suggest, SuggestionOption } from './suggest'
import UI from './ui/main'

export async function run() {
  figma.parameters.on('input', async ({ key, query, parameters, result }: ParameterInputEvent) => {

    await storeHistory(parameters)

    // console.log('history.lang', await Storage.get<string>('history.lang'))
    // console.log('history.cat', await Storage.get('history.cat'))
    // console.log('history.method', await Storage.get('history.method'))

    switch (key) {
      case 'lang':
        if (query) result.setSuggestions(Suggest.search(query, Fake.searchableLangs))
        else
        result.setSuggestions(await Suggest.languages())
        break
      case 'category':
        if (query) result.setSuggestions(Suggest.search(query, Fake.searchableCategories))
        else
        result.setSuggestions(await Suggest.categories())
        break
      case 'type':
        let suggestions: SuggestionOption[]
        if (query) {
          if (!parameters.category) {
            suggestions = Fake.searchableMethods.search({ fullLabel: query }).map(result => ({
              name: result.item.fullLabel,
              data: result.item
            }))
          } else {
            suggestions = Fake.searchableMethods.search({
              $and: [
                { category: `!${parameters.category.name}` },
                { label: query }
              ]
            }).map(result => ({
              name: result.item.label,
              data: result.item
            }))
          }
          result.setSuggestions(suggestions)
          break
        }
        suggestions = await Suggest.methods(parameters.category)
        result.setSuggestions(suggestions)
        break
      case 'tag':
        result.setSuggestions([{ name: "Yes", data: true }])
        break
      default:
        return
    }
  })


  figma.on('run', async ({ parameters }: RunEvent) => {

    if (figma.command == 'clearHistory') {
      clearHistory()
      figma.closePlugin()
      return
    }
    if (figma.command == 'openUI') {
      UI()
      return
    }

    if (!parameters) return
    const { lang, category, type: method, tag } = parameters

    await Nodes.handleTestFrame()
    await storeHistory(parameters)

    let processed = 0, errors = 0
    const txtNodes = Nodes.getSelected()

    if (figma.command == 'update') {
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
    }
    else {
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
    }
    if (errors) {
      figma.notify(`${processed} ${processed == 1 ? 'item' : 'items'} faked (${errors} skipped)`, { timeout: 3000 })
    } else {
      figma.notify(`${processed} ${processed == 1 ? 'item' : 'items'} faked`, { timeout: 1000 })
    }
    figma.closePlugin()
  })
}

async function storeHistory(parameters: ParameterValues) {
  if (!parameters) return
  if (parameters.lang) {
    await Storage.push<string>('history.lang', parameters.lang.code)
  }
  if (parameters.category) {
    await Storage.push<string>('history.cat', parameters.category.name)
  }
  if (parameters.type) {
    await Storage.push<Method>('history.method', parameters.type, (stored) => Fake.equals(parameters.type, stored))
  }
}

export async function clearHistory() {
  console.log('clear history')
  await Storage.clear('history.lang')
  await Storage.clear('history.cat')
  await Storage.clear('history.method')
}
