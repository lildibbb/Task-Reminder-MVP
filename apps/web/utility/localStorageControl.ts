const getItem = (key: string): any => {
  const data: any = typeof window !== 'undefined' ? window.localStorage.getItem(key) : ''

  try {
    return JSON.parse(data)
  } catch (err) {
    return data
  }
}

const setItem = (key: string, value: string): any => {
  const stringify = typeof value !== 'string' ? JSON.stringify(value) : value

  return window.localStorage.setItem(key, stringify)
}

const removeItem = (key: string): any => {
  return window.localStorage.removeItem(key)
}

export { getItem, setItem, removeItem }
