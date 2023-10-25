
const get = async <T extends any[]>(key: string) => {
  return ((await figma.clientStorage.getAsync(key)) || []) as T
}

const clear = async (key: string) => {
  await figma.clientStorage.deleteAsync(key)
}

const push = async <T>(key: string, value: any, compare?: (stored: T) => boolean) => {
  const arr: T[] = await get(key)
  let existingId: number
  if (compare) {
    existingId = arr.findIndex(compare)
  } else {
    existingId = arr.indexOf(value)
  }
  if(existingId == arr.length - 1) return
  if (existingId > -1) arr.splice(existingId, 1)
  arr.push(value)
  console.log('storage', existingId > -1 ? 'update' : 'add', key, arr)
  return figma.clientStorage.setAsync(key, arr)
}

export const Storage = {
  get,
  push,
  clear
}