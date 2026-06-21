import { isRecord } from '#utils/helpers'
import {
  getValueAtPath,
  resolveValueAtPath,
  type TranslationSchema
} from '#utils/translation'

const createTranslationProxy = <
  TBaseSchema extends TranslationSchema
>(
  resolveCurrentSource: () => TBaseSchema,
  fallbackSource: TBaseSchema,
  path: readonly string[] = []
): TBaseSchema =>
  new Proxy({} as TBaseSchema, {
    get(_target, property) {
      if (typeof property === 'symbol') {
        return Reflect.get({}, property)
      }

      const value = resolveValueAtPath(
        resolveCurrentSource(),
        fallbackSource,
        [...path, property]
      )

      if (isRecord(value)) {
        return createTranslationProxy(
          resolveCurrentSource,
          fallbackSource,
          [...path, property]
        )
      }

      return value
    },
    getOwnPropertyDescriptor(_target, property) {
      if (typeof property === 'symbol') {
        return
      }

      const value = resolveValueAtPath(
        resolveCurrentSource(),
        fallbackSource,
        [...path, property]
      )

      if (value === undefined) {
        return
      }

      return {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      }
    },
    ownKeys() {
      const currentValue = resolveValueAtPath(
        resolveCurrentSource(),
        fallbackSource,
        path
      )
      const fallbackValue = getValueAtPath(fallbackSource, path)

      if (!isRecord(currentValue) && !isRecord(fallbackValue)) {
        return []
      }

      return [
        ...new Set([
          ...Reflect.ownKeys(
            isRecord(currentValue) ? currentValue : {}
          ),
          ...Reflect.ownKeys(
            isRecord(fallbackValue) ? fallbackValue : {}
          )
        ])
      ]
    }
  })

export { createTranslationProxy }
