import { getDefinedLocale } from '#api/core/define-locale'
import { createTranslationProxy } from '#api/proxy/create-proxy'
import { DEFAULT_STORAGE_CONFIG } from '#constants/default-config'
import type {
  Locale,
  LocaleNamespace,
  LocaleNamespaceValue
} from '#types/index'
import { isRecord } from '#utils/helpers'
import { storage, type StorageConfig } from '#utils/storage'
import {
  resolveNamespaceValue,
  type TranslationSchema
} from '#utils/translation'

interface CreateLocaleConfig<TBaseSchema extends TranslationSchema> {
  defaultLocale: TBaseSchema
  locales: TBaseSchema[]
  /**
   * Storage used to persist the selected locale between sessions.
   *
   * @default { key: '@langscale_lang', method: 'local' }
   */
  storage?: StorageConfig
}

interface CreateLocaleReturn<TBaseSchema extends TranslationSchema> {
  getTranslations: <
    TNamespace extends LocaleNamespace<TBaseSchema> | undefined =
      undefined
  >(options?: {
    namespace?: TNamespace
  }) => TNamespace extends LocaleNamespace<TBaseSchema>
    ? LocaleNamespaceValue<TBaseSchema, TNamespace>
    : TBaseSchema
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TBaseSchema
}

/**
 * Creates the locale state manager for a set of defined locales.
 *
 * The returned `t` object always reflects the active locale, while
 * `getTranslations` can narrow the returned branch using a 2-level
 * namespace such as `home-page` or `checkout-form`.
 *
 * @example
 *   ;```ts
 *   const { t, setLocale, getTranslations } = createLocaleConfig({
 *     defaultLocale: enUS,
 *     locales: [enUS, ptBR]
 *   })
 *
 *   setLocale('pt-BR')
 *   t.page.home.title
 *   getTranslations({ namespace: 'home-page' }).title
 *   ```
 *
 * @default { key: '@langscale_lang', method: 'local' }
 * @param options - Configuration for the locale manager.
 * @param options.defaultLocale - The fallback locale schema.
 * @param options.locales - The list of available locale schemas.
 * @param options.storage - Optional persistence config.
 */
const createLocaleConfig = <TBaseSchema extends TranslationSchema>({
  defaultLocale,
  locales,
  storage: storageConfig = DEFAULT_STORAGE_CONFIG
}: CreateLocaleConfig<TBaseSchema>): CreateLocaleReturn<TBaseSchema> => {
  const storageApi = storage()
  const LOCALE_MAP = new Map<Locale, TBaseSchema>()

  const defaultLocaleCode = getDefinedLocale(defaultLocale)

  if (defaultLocaleCode === undefined) {
    throw new Error(
      'defaultLocale must be created with defineLocale before using createLocaleConfig'
    )
  }

  LOCALE_MAP.set(defaultLocaleCode, defaultLocale)

  for (const localeDefinition of locales) {
    const localeCode = getDefinedLocale(localeDefinition)

    if (localeCode !== undefined) {
      LOCALE_MAP.set(localeCode, localeDefinition)
    }
  }

  const storedLocale = storageApi.getItem(storageConfig)
  let currentLocale: Locale =
    storedLocale !== null && LOCALE_MAP.has(storedLocale as Locale)
      ? (storedLocale as Locale)
      : defaultLocaleCode

  const getActiveLocale = (): TBaseSchema =>
    LOCALE_MAP.get(currentLocale) ?? defaultLocale

  const t = createTranslationProxy(getActiveLocale, defaultLocale)

  const setLocale = (nextLocale: Locale): void => {
    currentLocale = nextLocale
    storageApi.setItem(storageConfig, nextLocale)
  }

  const getTranslations = <
    TNamespace extends LocaleNamespace<TBaseSchema> | undefined =
      undefined
  >(options?: {
    namespace?: TNamespace
  }): TNamespace extends LocaleNamespace<TBaseSchema>
    ? LocaleNamespaceValue<TBaseSchema, TNamespace>
    : TBaseSchema => {
    const namespace = options?.namespace

    if (namespace === undefined) {
      return t as TNamespace extends LocaleNamespace<TBaseSchema>
        ? LocaleNamespaceValue<TBaseSchema, TNamespace>
        : TBaseSchema
    }

    const fallbackValue = resolveNamespaceValue(
      defaultLocale,
      defaultLocale,
      namespace
    )

    if (fallbackValue === undefined || !isRecord(fallbackValue)) {
      throw new Error(`Unknown namespace: ${namespace}`)
    }

    return createTranslationProxy(
      () =>
        resolveNamespaceValue(
          getActiveLocale(),
          defaultLocale,
          namespace
        ) as TBaseSchema,
      fallbackValue as TBaseSchema
    ) as TNamespace extends LocaleNamespace<TBaseSchema>
      ? LocaleNamespaceValue<TBaseSchema, TNamespace>
      : TBaseSchema
  }

  return {
    getTranslations,
    get locale(): Locale {
      return currentLocale
    },
    setLocale,
    t
  }
}

export { createLocaleConfig }
