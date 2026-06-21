import { createFmt } from '#api/fmt/create-fmt'
import type { Locale } from '#types/index'

interface DefineLocaleContext {
  fmt: ReturnType<typeof createFmt>
}

type DefineLocaleFactory<TBaseSchema extends object> = (
  context: DefineLocaleContext
) => TBaseSchema

type DefineLocaleSchema<TBaseSchema extends object> =
  | TBaseSchema
  | DefineLocaleFactory<TBaseSchema>

type DefineLocaleConfig<TBaseSchema extends object> = [
  DefineLocaleSchema<TBaseSchema>,
  Locale
]

const LOCALE_REGISTRY = new WeakMap<object, Locale>()

/**
 * Creates a locale schema and registers its locale code for later
 * lookup.
 *
 * This helper accepts either a plain schema object or a factory that
 * receives a locale-aware `fmt` helper.
 *
 * @example
 *   ;```ts
 *   const enUS = defineLocale([
 *     {
 *       page: {
 *         home: {
 *           title: 'Hello, World!'
 *         }
 *       }
 *     },
 *     'en-US'
 *   ])
 *   ```
 *
 * @example
 *   ;```ts
 *   const ptBR = defineLocale<DemoSchema>([
 *     ({ fmt }) => ({
 *       page: {
 *         home: {
 *           title: fmt.toTitleCase('olá, mundo!')
 *         }
 *       }
 *     }),
 *     'pt-BR'
 *   ])
 *   ```
 *
 * @param config - Tuple containing either the schema object or the
 *   factory, plus its associated locale code.
 */
const defineLocale = <TBaseSchema extends object>(
  config: DefineLocaleConfig<TBaseSchema>
): TBaseSchema => {
  const [schema, locale] = config

  const resolvedSchema =
    typeof schema === 'function'
      ? schema({
          fmt: createFmt(locale)
        })
      : schema

  LOCALE_REGISTRY.set(resolvedSchema, locale)

  return resolvedSchema
}

const getDefinedLocale = (schema: object): Locale | undefined =>
  LOCALE_REGISTRY.get(schema)

export { defineLocale, getDefinedLocale }
