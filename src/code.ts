// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { allFakers } from '@faker-js/faker'
import { methods, languages, FakerLanguage } from './fakerData'
import Fuse from 'fuse.js'

const ALLTAG = '(All)'
const RANDTAG = '(random)'

const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

const format = (s: string) => {
  const spaced = s.replace(/([A-Z])/, ' $1')
  return spaced[0].toUpperCase() + spaced.slice(1)
}
const getFake = (lang:FakerLanguage, category:string, type:Method|string) => {
  const f = (allFakers as any)[lang.code]
  let item:Method
  if(type === RANDTAG) {
    if(category == ALLTAG) item = rand(allMethods)
    else item = rand(allMethods.filter(item => item.category == category))
  } else {
    item = type as Method
  }
  const result = f[item.category.toLowerCase()][item.method]()
  
  // // check if result is an object
  // if (typeof result === 'object')
  //   return Object.values(result).filter((item: any) => typeof item === 'string').join(' ')
  return result
}

interface Method {
  category: string
  method: string
  label: string
  fullLabel: string
  key?: string
}
// setup data
const searchableCategories = new Fuse(Object.keys(methods))
const allMethods:Method[] = Object.keys(methods)
  .map(category => methods[category].map(method => ({
    category : category,
    method: method,
    label : format(method),
    fullLabel : category + ' / ' + format(method)
  })))
  .flat()
// add every method sub results as their own item
allMethods.forEach(item => {
  const result = getFake({ code: 'en', name: '' }, item.category, item)
  if (typeof result === 'object') {
    Object.keys(result)
      .filter((key: string) => typeof result[key] === 'string')
      .forEach((key: string) => allMethods.push({
        ...item,
        fullLabel: item.category + ' / ' + format(item.method) + ' (' + format(key) + ')',
        key: key
      }))
  }
})
const searchableMethods = new Fuse(allMethods, {
  keys: ['category', 'label', 'fullLabel']
})
const searchableLangs = new Fuse(languages, {
  keys: ['name']
})

figma.parameters.on('input', ({key, query, parameters, result}: ParameterInputEvent) =>{
  switch (key) {
    case 'category':
      if(query)
        result.setSuggestions(searchableCategories.search(query).map(result => ({
          name: result.item,
          data: result.refIndex
        })))
      else result.setSuggestions([ALLTAG, ...Object.keys(methods)])
      break
    case 'type':
      if(parameters.category == ALLTAG) {
        if(query) result.setSuggestions(searchableMethods.search({ fullLabel: query }).map(result => ({
          name: result.item.fullLabel,
          data: result.item
        })))
        else result.setSuggestions([RANDTAG, ...allMethods.map(item => ({
          name: item.fullLabel,
          data: item
        }))])
      }
      else {
        if(query) result.setSuggestions(searchableMethods.search({
          $and: [
            { category: parameters.category },
            { label: query }
          ]
        }).map(result => ({
          name: result.item.fullLabel,
          data: result.item
        })))
        else result.setSuggestions([RANDTAG, ...allMethods
          .filter(item => item.category == parameters.category)
          .map(item => ({
            name: item.fullLabel,
            data: item
        }))])
      }
      break
    case 'lang':
      const results = searchableLangs.search(query).map(result => ({
        name: result.item.name,
        data: result.item
      }))
      if(query) result.setSuggestions(results)
      else result.setSuggestions([RANDTAG, ...languages.map(item => ({
        name: item.name,
        data: item
      }))])
      break
    default:
      return
  }
})
figma.on('run', async ({parameters}: RunEvent) => {
  if (!parameters) return

  let lang:FakerLanguage
  if(parameters.lang === RANDTAG) lang = rand(languages)
  else lang = parameters.lang

  const text = () => {
    const fake = getFake(lang, parameters.category, parameters.type)
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
  if(txtRange) {
    await insertInTextRange(txtRange, text)
  } else {
    const txtNodes = getOrCreateNodes(figma.currentPage.selection as SceneNode[])
    for (const node of txtNodes) {
      await replaceText(node, text)
    }
  }
  figma.closePlugin()
})

const getOrCreateNodes = (nodes:SceneNode[]) => {
  const txtNodes = nodes.filter(n => n.type == 'TEXT') as TextNode[]
  if(txtNodes.length == 0) {
    txtNodes.push(figma.createText())
  }
  return txtNodes
}
const replaceText = async (txtNode: TextNode, text: () => string) => {
  await figma.loadFontAsync(txtNode.fontName as FontName)
  txtNode.characters = text()
}
const insertInTextRange = async (txtRange: {
  node: TextNode
  start: number
  end: number
}, text: () => string) => {
  await figma.loadFontAsync(txtRange.node.fontName as FontName)
  txtRange.node.deleteCharacters(txtRange.start, txtRange.end)
  txtRange.node.insertCharacters(txtRange.start, text())
}