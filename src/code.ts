import { FakerLanguage } from './fakerData'
import { Method, Fake } from './fakerHandle'
import { Storage } from './storage'
import { rand } from './utils'

import Fuse from 'fuse.js'
export interface SuggestionOption {
  name: string
  data: any
  icon?: string
}
const formatSuggestion = (input: { name: string, icon?: string }) => ({
  name: input.name,
  data: input,
  icon: input.icon
} as SuggestionOption)


figma.parameters.on('input', async ({ key, query, parameters, result }: ParameterInputEvent) => {

  // store history
  if (parameters.lang && parameters.lang.name !== Fake.OPTIONS.anylang.name) {
    await Storage.push<string>('history.lang', parameters.lang.code)
  }
  if (parameters.category && parameters.category.name !== Fake.OPTIONS.anycat.name) {
    await Storage.push<string>('history.cat', parameters.category)
  }
  if (parameters.type && parameters.type.name !== Fake.OPTIONS.anytype.name) {
    await Storage.push<Method>('history.method', parameters.type, (stored) => stored.name == parameters.type.name)
  }

  // console.log(parameters)
  console.log(await Storage.get('history.lang'))
  console.log(await Storage.get('history.cat'))
  console.log(await Storage.get('history.method'))

  let suggestions: SuggestionOption[]
  switch (key) {
    case 'lang':
      if (query)
        suggestions = searchSuggestions(query, Fake.searchableLangs)
      else suggestions = (await langsSuggestions()).map(formatSuggestion)
      result.setSuggestions(suggestions)
      break
    case 'category':
      if (query)
        suggestions = searchSuggestions(query, Fake.searchableCategories)
      else suggestions = (await catsSuggestions()).map(formatSuggestion)
      result.setSuggestions(suggestions)
      break
    case 'type':
      const history = await Storage.get('history.type')
      if (query) {
        if (parameters.category.name == Fake.OPTIONS.anycat.name) {
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
      if (parameters.category.name == Fake.OPTIONS.anycat.name) {
        const history = await Storage.get('history.lang')
        suggestions = getSuggestions(
          history,
          () => Fake.allMethods,
          (item) => history.indexOf(item.name),
          Fake.OPTIONS.anytype
        ) as SuggestionOption[]
        // suggestions = [
        //   formatSuggestion(Fake.OPTIONS.anytype),
        //   ...allMethods.map(item => ({
        //     name: item.fullLabel,
        //     data: item
        //   }))
        // ]
        result.setSuggestions(suggestions.map(formatSuggestion))
      }
      else {
        suggestions = [
          formatSuggestion(Fake.OPTIONS.anytype),
          ...Fake.allMethods
            .filter(item => item.category == parameters.category.name)
            .map(item => ({
              name: item.label,
              data: item
            }))
        ]
        suggestions = suggestions.sort((a, b) => {
          const aid = history.indexOf(a.name)
          const bid = history.indexOf(b.name)
          return bid - aid || a.name.localeCompare(b.name)
        })
        result.setSuggestions(suggestions)
      }
      break
    default:
      return
  }
})
const searchSuggestions = (query: string, searchable: Fuse<any>): SuggestionOption[] => {
  return searchable
    .search(query)
    .map(result => formatSuggestion(result.item))
}
const langsSuggestions = async () => {
  const history = await Storage.get('history.lang')
  return getSuggestions(
    history,
    Fake.languages,
    (lang) => history.indexOf(lang.code),
    Fake.OPTIONS.anylang
  )
}
const catsSuggestions = async () => {
  const history = await Storage.get('history.cat')
  return getSuggestions(
    history,
    Fake.categories,
    (lang) => history.indexOf(lang.name),
    Fake.OPTIONS.anycat
  )
}
const getSuggestions = (
  history: string[],
  options: () => ({ name: string, code?: string }[]),
  getWeight: (option:any)=>number,
  defaultOption: { name: string, icon?: string }
) => {
  if (!history.length)
    // suggests "any", then every options
    return [defaultOption, ...options()]

  // weight by index in history, add icon if needed
  // then sort by weight or alphabetical name
  const suggestions = options()
    .map((option) => {
      const weight = getWeight(option);
      return {
        ...option,
        weight,
        icon: getWeight(option) !== -1 ? Fake.OPTIONS.inhistory.icon : '',
      }
    })
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name))

  // suggest the latest, "any", then the rest
  const latest = {
    ...(suggestions.shift() as { name: string }),
    icon: Fake.OPTIONS.latest.icon,
  }
  return [latest, defaultOption, ...suggestions]
}

figma.on('run', async ({ parameters }: RunEvent) => {

  if(figma.command == 'clearHistory') {
    console.log('clear history')
    await Storage.clear('history.lang')
    await Storage.clear('history.cat')
    await Storage.clear('history.method')
    figma.closePlugin()
    return
  }
  
  if (!parameters) return

  // store type history
  if (parameters.type && parameters.type.name !== Fake.OPTIONS.anytype.name) {
    await Storage.push<Method>('history.method', parameters.type, (stored) => stored.name == parameters.type.name)
  }

  let lang: FakerLanguage
  if (parameters.lang.name == Fake.OPTIONS.anylang.name)
    lang = rand(Fake.languages())
  else lang = parameters.lang

  const text = () => {
    const fake = Fake.getFake(lang, parameters.category.name, parameters.type)
    if (typeof fake === 'object') {
      if (parameters.type.hasOwnProperty('key')) {
        return fake[parameters.type.key]
      }
      return Object.values(fake).join(' ')
    }
    if (Array.isArray(fake))
      return rand(fake);
    return fake;
  }

  const txtRange = figma.currentPage.selectedTextRange
  if (txtRange) {
    await insertInTextRange(txtRange, text)
  } else {
    const txtNodes = getOrCreateNodes(figma.currentPage.selection as SceneNode[])
    for (const node of txtNodes) {
      await replaceText(node, text)
    }
  }
  figma.closePlugin()
})

const getOrCreateNodes = (nodes: SceneNode[]) : TextNode[] => {
  const txtNodes = nodes.filter(n => n.type == 'TEXT') as TextNode[]
  if (txtNodes.length == 0) {
    const newNode = figma.createText()
    newNode.x = figma.viewport.center.x
    newNode.y = figma.viewport.center.y
    txtNodes.push(newNode)
  }
  return txtNodes
}
const replaceText = async (txtNode: TextNode, text: () => string) => {
  await figma.loadFontAsync(txtNode.fontName as FontName)
  txtNode.characters = `${text()}`
}
const insertInTextRange = async (txtRange: {
  node: TextNode
  start: number
  end: number
}, text: () => string) => {
  await figma.loadFontAsync(txtRange.node.fontName as FontName)
  txtRange.node.deleteCharacters(txtRange.start, txtRange.end)
  txtRange.node.insertCharacters(txtRange.start, `${text()}`)
}