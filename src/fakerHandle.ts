
import { methods, languages, FakerLanguage } from './fakerData'
import { rand } from './utils'

import Fuse from 'fuse.js'
import { allFakers } from '@faker-js/faker'

export interface Method {
  category: string
  name: string
  label: string
  fullLabel: string
  key?: string
}

export const OPTIONS = {
  latest: {
    name: 'Latest',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-6.88 2.77V3a1 1 0 0 0-2 0v4.5a1 1 0 0 0 1 1h4.5a1 1 0 0 0 0-2h-2.4A8 8 0 1 1 4 12a1 1 0 0 0-2 0A10 10 0 1 0 12 2Zm0 6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 0-2h-1V9a1 1 0 0 0-1-1Z"/></svg>'
  },
  inhistory: {
    icon:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#ccc" d="M12 10a2 2 0 0 0-2 2a2 2 0 0 0 2 2c1.11 0 2-.89 2-2a2 2 0 0 0-2-2Z"/></svg>' 
  },
  anylang: {
    name: 'Any language',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path fill="#fff" d="m478.33 433.6l-90-218a22 22 0 0 0-40.67 0l-90 218a22 22 0 1 0 40.67 16.79L316.66 406h102.67l18.33 44.39A22 22 0 0 0 458 464a22 22 0 0 0 20.32-30.4ZM334.83 362L368 281.65L401.17 362Zm-66.99-19.08a22 22 0 0 0-4.89-30.7c-.2-.15-15-11.13-36.49-34.73c39.65-53.68 62.11-114.75 71.27-143.49H330a22 22 0 0 0 0-44H214V70a22 22 0 0 0-44 0v20H54a22 22 0 0 0 0 44h197.25c-9.52 26.95-27.05 69.5-53.79 108.36c-31.41-41.68-43.08-68.65-43.17-68.87a22 22 0 0 0-40.58 17c.58 1.38 14.55 34.23 52.86 83.93c.92 1.19 1.83 2.35 2.74 3.51c-39.24 44.35-77.74 71.86-93.85 80.74a22 22 0 1 0 21.07 38.63c2.16-1.18 48.6-26.89 101.63-85.59c22.52 24.08 38 35.44 38.93 36.1a22 22 0 0 0 30.75-4.9Z"/></svg>'
  },
  anycat: {
    name: 'Any category',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M11.15 3.4L7.43 9.48c-.41.66.07 1.52.85 1.52h7.43c.78 0 1.26-.86.85-1.52L12.85 3.4a.993.993 0 0 0-1.7 0z"/><circle cx="17.5" cy="17.5" r="4.5" fill="#fff"/><path fill="#fff" d="M4 21.5h6c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1z"/></svg>'
  },
  anytype: {
    name: 'Any type',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#fff" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="round" d="M12 8v8m0-8H8m4 0h4"/><path d="M21 13.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5.5m18-3V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5.5m16.5 3v-3h3v3h-3Zm-18 0v-3h3v3h-3Z"/></g></svg>'
  }
}

const getFake = (lang: FakerLanguage, category: string, type: Method | string) => {
  const f = (allFakers as any)[lang.code]
  let item: Method
  if (type === OPTIONS.anytype.name) {
    if (category == OPTIONS.anycat.name) item = rand(allMethods)
    else item = rand(allMethods.filter(item => item.category == category))
  } else {
    item = type as Method
  }
  const result = f[item.category.toLowerCase()][item.name]()

  // // check if result is an object
  // if (typeof result === 'object')
  //   return Object.values(result).filter((item: any) => typeof item === 'string').join(' ')
  return result
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
const categories = () => methodsKeys.map(name => ({ name: name }))
const searchableCategories = new Fuse(categories(), {
  keys: ['name']
})
const allMethods: Method[] = methodsKeys.map(category =>
  methods()[category].map(name => ({
    category,
    name,
    label: format(name),
    fullLabel: category + ' / ' + format(name)
  })))
  .flat()
// add every method sub results as their own item
allMethods.forEach(item => {
  const result = getFake({ code: 'en', name: '' }, item.category, item)
  if (typeof result === 'object') {
    Object.keys(result)
      .forEach((key: string) => allMethods.push({
        ...item,
        label: format(item.name) + ' (' + format(key) + ')',
        fullLabel: item.category + ' / ' + format(item.name) + ' (' + format(key) + ')',
        key: key
      }))
  }
})
const searchableMethods = new Fuse(allMethods, {
  keys: ['category', 'label', 'fullLabel']
})

export const Fake = {
  OPTIONS,
  getFake,
  format,
  languages,
  categories,
  searchableLangs,
  searchableCategories,
  searchableMethods,
  allMethods,
}
