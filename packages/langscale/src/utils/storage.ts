type StorageMethod = 'local' | 'session'

interface StorageConfig {
  key: string
  method: StorageMethod
}

const getWebStorage = (method: StorageMethod): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return method === 'local'
    ? window.localStorage
    : window.sessionStorage
}

const getItem = (config: StorageConfig): string | null =>
  getWebStorage(config.method)?.getItem(config.key) ?? null

const setItem = (config: StorageConfig, value: string): void => {
  const webStorage = getWebStorage(config.method)

  if (webStorage === null) {
    return
  }

  webStorage.setItem(config.key, value)
}

const removeItem = (config: StorageConfig): void => {
  const webStorage = getWebStorage(config.method)

  if (webStorage === null) {
    return
  }

  webStorage.removeItem(config.key)
}

export const storage = () => ({
  getItem,
  removeItem,
  setItem
})

export type { StorageConfig, StorageMethod }
