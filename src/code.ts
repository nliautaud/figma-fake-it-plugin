// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { allFakers } from '@faker-js/faker'
import { methods, languages } from './fakerData'

figma.parameters.on('input', ({key, query, parameters, result}: ParameterInputEvent) =>{
  const re = new RegExp(`.*${query}.*`,"g")
  switch (key) {
    case 'category':
      const categories = Object.keys(methods).filter(s => re.test(s))
      result.setSuggestions(categories)
      break
    case 'type':
      const format = (s: string) => s[0].toUpperCase() + s.slice(1)
      const types = methods[parameters.category].filter(s => re.test(s)).map(format)
      result.setSuggestions(['(random)', ...types])
      break
    case 'lang':
      const langNames = languages.map(l => l.name)
      result.setSuggestions(['(random)', ...langNames])
      break
    default:
      return
  }
})

figma.on('run', async ({parameters}: RunEvent) => {
  if (!parameters) return

  const languageCode = (langName: string) => {
    if(langName == '(random)') {
      return languages[Math.floor(Math.random() * languages.length)].code
    }
    return languages.filter(l => l.name == langName)[0].code
  }

  const fake = (langname:string, cat:string, type:string) => {
    const lang = languageCode(langname)
    const f = (allFakers as any)[lang][cat.toLowerCase()]
    if(type == '(random)') {
      const types = Object.keys(f)
      type = types[Math.floor(Math.random() * types.length)]
    }
    return f[type.toLowerCase()]()
  }
  const getFake = () => fake(parameters.lang, parameters.category, parameters.type)
  const txtRange = figma.currentPage.selectedTextRange
  if(txtRange) {
    await figma.loadFontAsync(txtRange.node.fontName as FontName)
    txtRange.node.deleteCharacters(txtRange.start, txtRange.end)
    txtRange.node.insertCharacters(txtRange.start, getFake())
  } else {
    let txtNodes = figma.currentPage.selection.filter(n => n.type == 'TEXT') as TextNode[]
    if(txtNodes.length == 0) {
      txtNodes.push(figma.createText())
    }
    for (const node of txtNodes) {
      await figma.loadFontAsync(node.fontName as FontName)
      node.characters = getFake()
    }
  }
  figma.closePlugin()
})