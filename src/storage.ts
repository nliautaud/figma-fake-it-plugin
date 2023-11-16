
const get = async <T>(key: string):Promise<T[]> => {
  const result = await figma.clientStorage.getAsync(key)
  return (result || []) as T[]
}
const latest = async <T>(key: string):Promise<T|undefined> => {
  const result = await get<T>(key)
  if (!result.length) return
  return result[result.length - 1]
}

const clear = async (key: string) => {
  await figma.clientStorage.deleteAsync(key)
}

const push = async <T>(key: string, value: any, compare?: (stored: T) => boolean) => {
  const arr = await get<T>(key)
  let existingId: number
  if (compare) {
    existingId = arr.findIndex(compare)
  } else {
    existingId = arr.indexOf(value)
  }
  if(existingId != -1 && existingId == arr.length - 1) return
  if (existingId > -1) arr.splice(existingId, 1)
  arr.push(value)
  console.log('storage', existingId > -1 ? 'update' : 'add', key, arr)
  return figma.clientStorage.setAsync(key, arr)
}

export const Storage = {
  get,
  latest,
  push,
  clear
}