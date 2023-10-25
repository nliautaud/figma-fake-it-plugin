
import { methods, languages, FakerLanguage, objectMethods } from './data'
import { rand } from './utils'

import Fuse from 'fuse.js'
import { allFakers } from '@faker-js/faker'

export interface NamedItem {
  name: string
}
export interface Method {
  category: string // ex. Airline
  name: string // ex. aircraftType
  key?: string // ex. iataCode
  label: string // ex. Aircraft Type (Iata Code)
  fullLabel: string // ex. Airline / Aircraft Type (Iata Code)
}
function equals(a: Method, b: Method) {
  return a.category == b.category
  && a.name == b.name
  && (!a.key && !b.key || a.key == b.key)
}

const getMethodInfo = (lang: FakerLanguage|false, category: string|false, method: Method|false) => {

  if(!lang) {
    lang = rand(languages()) as FakerLanguage
  }
  const f = (allFakers as any)[lang.code]

  let item: Method
  if (!method) {
    if (!category) item = rand(allMethods)
    else item = rand(allMethods.filter(item => item.category == category))
  } else {
    item = method as Method
  }
  const result = f[item.category.toLowerCase()][item.name]()
  return {
    langCode: lang.code,
    type: result instanceof Date ? 'date'
    : Array.isArray(result) ? 'array'
    : typeof result,
    result: result,
    key: item.hasOwnProperty('key')? item.key : null
  }
}
const fake = (lang: FakerLanguage|false, category: string|false, method: Method|false) => {

  const { langCode, type, result, key } = getMethodInfo(lang, category, method)
  switch(type) {
    case 'date':
      return result.toLocaleDateString(
        langCode.replace('_', '-'),
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    case 'array':
      return result.join(' ')//rand(result)
    case 'object':
      if (key) return result[key]
      return Object.values(result).join(' ')
    default:
      return result
  }
}

// setup data
const format = (s: string) => {
  const spaced = s.replace(/([A-Z])/, ' $1')
  return spaced[0].toUpperCase() + spaced.slice(1)
}
const searchableLangs = new Fuse(languages(), {
  keys: ['name']
})
const methodsKeys = Object.keys(methods())
const categories = () => methodsKeys.map(name => ({ name: name }) as NamedItem)
const searchableCategories = new Fuse(categories(), {
  keys: ['name']
})
const allMethods: Method[] = methodsKeys.map(category =>
  methods()[category].map(name => ({
    id: `${category}.${name}`,
    category,
    name,
    label: format(name),
    fullLabel: `${category} / ${format(name)}`
  })))
  .flat()
// for methods returning objects, add object keys as their own item
allMethods
.filter(method => objectMethods.find(m => m.category == method.category && m.method == method.name))
.forEach(method => {
  const infos = getMethodInfo({ code: 'en', name: '' }, method.category, method)
  if (infos.type === 'object') {
    Object.keys(infos.result)
      .forEach((key: string) => allMethods.push({
        ...method,
        key,
        label: `${method.label} (${format(key)})`,
        fullLabel: `${method.fullLabel} (${format(key)})`,
      }))
  }
})
const searchableMethods = new Fuse(allMethods, {
  keys: ['category', 'label', 'fullLabel']
})

export const Fake = {
  fake,
  languages,
  categories,
  searchableLangs,
  searchableCategories,
  searchableMethods,
  allMethods,
  equals
}
