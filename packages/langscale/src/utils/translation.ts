import { isRecord } from '#utils/helpers'
import { toNamespaceSegment } from '#utils/string'

type TranslationSchema = object

type LocalePathMountMode = 'mounted' | 'root'

const getValueAtPath = (
  source: TranslationSchema,
  path: readonly string[]
): unknown => {
  let current: unknown = source

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined
    }

    current = current[segment]
  }

  return current
}

const resolveValueAtPath = (
  activeSource: TranslationSchema,
  fallbackSource: TranslationSchema,
  path: readonly string[]
): unknown => {
  const activeValue = getValueAtPath(activeSource, path)

  if (activeValue !== undefined) {
    return activeValue
  }

  return getValueAtPath(fallbackSource, path)
}

const resolveNamespaceValue = (
  activeSource: TranslationSchema,
  fallbackSource: TranslationSchema,
  namespace: string
): unknown => {
  for (const [parentKey, parentValue] of Object.entries(
    activeSource
  )) {
    if (!isRecord(parentValue)) {
      continue
    }

    for (const [childKey, childValue] of Object.entries(
      parentValue
    )) {
      const namespaceKey = `${toNamespaceSegment(childKey)}-${toNamespaceSegment(parentKey)}`

      if (namespace === namespaceKey) {
        return childValue
      }
    }
  }

  for (const [parentKey, parentValue] of Object.entries(
    fallbackSource
  )) {
    if (!isRecord(parentValue)) {
      continue
    }

    for (const [childKey, childValue] of Object.entries(
      parentValue
    )) {
      const namespaceKey = `${toNamespaceSegment(childKey)}-${toNamespaceSegment(parentKey)}`

      if (namespace === namespaceKey) {
        return childValue
      }
    }
  }

  return undefined
}

const splitLocalePath = (path: string): string[] => path.split('.')

const getLocalePathMountKey = (path: string): string => {
  const segments = splitLocalePath(path)

  return segments.at(-1) ?? path
}

const mergeRecords = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> => {
  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = target[key]

    if (isRecord(targetValue) && isRecord(sourceValue)) {
      target[key] = mergeRecords({ ...targetValue }, sourceValue)
      continue
    }

    target[key] = sourceValue
  }

  return target
}

const mergeLocalePathValue = (
  target: Record<string, unknown>,
  path: string,
  value: Record<string, unknown>,
  mode: LocalePathMountMode
): void => {
  if (mode === 'mounted') {
    mergeRecords(target, {
      [getLocalePathMountKey(path)]: value
    })

    return
  }

  mergeRecords(target, value)
}

const composeLocalePaths = (
  activeSource: TranslationSchema,
  fallbackSource: TranslationSchema,
  paths: readonly string[],
  mode: LocalePathMountMode
): Record<string, unknown> => {
  const content: Record<string, unknown> = {}

  for (const path of paths) {
    const segments = splitLocalePath(path)
    const fallbackValue = getValueAtPath(fallbackSource, segments)

    if (!isRecord(fallbackValue)) {
      throw new Error(`Unknown locale path: ${path}`)
    }

    const activeValue = resolveValueAtPath(
      activeSource,
      fallbackSource,
      segments
    )

    mergeLocalePathValue(
      content,
      path,
      isRecord(activeValue) ? activeValue : fallbackValue,
      mode
    )
  }

  return content
}

export {
  composeLocalePaths,
  getValueAtPath,
  isRecord,
  mergeRecords,
  resolveNamespaceValue,
  resolveValueAtPath
}

export type { LocalePathMountMode, TranslationSchema }
