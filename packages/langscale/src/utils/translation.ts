import { isRecord } from '#utils/helpers'
import { toNamespaceSegment } from '#utils/string'

type TranslationSchema = object

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

export {
  getValueAtPath,
  isRecord,
  resolveNamespaceValue,
  resolveValueAtPath
}

export type { TranslationSchema }
