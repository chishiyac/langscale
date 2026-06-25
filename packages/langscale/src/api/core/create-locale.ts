import { getDefinedLocale } from '#api/core/define-locale'
import { createTranslationProxy } from '#api/proxy/create-proxy'
import { DEFAULT_STORAGE_CONFIG } from '#constants/default-config'
import type {
  ComposedLocaleNamespaceValue,
  Locale,
  LocaleNamespaceOption,
  LocaleNamespacesConfig,
  LocalePath
} from '#types/index'
import { storage, type StorageConfig } from '#utils/storage'
import {
  composeLocalePaths,
  mergeRecords,
  type TranslationSchema
} from '#utils/translation'

interface CreateLocaleConfig<
  TBaseSchema extends TranslationSchema,
  TGlobals extends readonly LocalePath<TBaseSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TBaseSchema>
> {
  defaultLocale: TBaseSchema
  /**
   * Locale paths composed into every namespace and mounted by their
   * final path segment.
   *
   * @example
   *   ['global.action'] exposes `content.action`.
   */
  globals?: TGlobals
  locales: TBaseSchema[]
  /**
   * Explicit namespace composition. Paths listed here are merged at
   * the namespace root after globals.
   */
  namespaces?: TNamespaces
  /**
   * Storage used to persist the selected locale between sessions.
   *
   * @default { key: '@langscale_lang', method: 'local' }
   */
  storage?: StorageConfig
}

interface CreateLocaleReturn<
  TBaseSchema extends TranslationSchema,
  TGlobals extends readonly LocalePath<TBaseSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TBaseSchema>
> {
  getTranslations: GetTranslations<TBaseSchema, TGlobals, TNamespaces>
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TBaseSchema
}

interface GetTranslations<
  TBaseSchema extends TranslationSchema,
  TGlobals extends readonly LocalePath<TBaseSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TBaseSchema>
> {
  (): TBaseSchema
  <
    const TNamespace extends LocaleNamespaceOption<
      TBaseSchema,
      TNamespaces
    >
  >(options: {
    namespace: TNamespace
  }): ComposedLocaleNamespaceValue<
    TBaseSchema,
    TGlobals,
    TNamespaces,
    TNamespace
  >
}

/**
 * Creates the locale state manager for a set of defined locales.
 *
 * The returned `t` object always reflects the active locale, while
 * `getTranslations` can narrow the returned branch using a configured
 * namespace such as `login-form` or `checkout-form`.
 *
 * @example
 *   ;```ts
 *   const { t, setLocale, getTranslations } = createLocaleConfig({
 *     defaultLocale: enUS,
 *     locales: [enUS, ptBR],
 *     globals: ['global.action'],
 *     namespaces: {
 *       'home-page': ['page.home'],
 *       'login-form': ['form.login']
 *     }
 *   })
 *
 *   setLocale('pt-BR')
 *   t.page.home.title
 *   getTranslations({ namespace: 'login-form' }).action.submit
 *   ```
 *
 * @default { key: '@langscale_lang', method: 'local' }
 * @param options - Configuration for the locale manager.
 * @param options.defaultLocale - The fallback locale schema.
 * @param options.globals - Locale paths included in every namespace.
 * @param options.locales - The list of available locale schemas.
 * @param options.namespaces - Explicit namespace compositions.
 * @param options.storage - Optional persistence config.
 */
const createLocaleConfig = <
  TBaseSchema extends TranslationSchema,
  const TGlobals extends readonly LocalePath<TBaseSchema>[] = [],
  const TNamespaces extends LocaleNamespacesConfig<TBaseSchema> =
    Record<never, never>
>({
  defaultLocale,
  globals,
  locales,
  namespaces,
  storage: storageConfig = DEFAULT_STORAGE_CONFIG
}: CreateLocaleConfig<
  TBaseSchema,
  TGlobals,
  TNamespaces
>): CreateLocaleReturn<TBaseSchema, TGlobals, TNamespaces> => {
  const storageApi = storage()
  const LOCALE_MAP = new Map<Locale, TBaseSchema>()
  const globalPaths = globals ?? ([] as unknown as TGlobals)
  const namespacePaths = namespaces ?? ({} as TNamespaces)

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

  const resolveComposedNamespace = (
    activeSource: TBaseSchema,
    namespace: string
  ): Record<string, unknown> | undefined => {
    const content = composeLocalePaths(
      activeSource,
      defaultLocale,
      globalPaths,
      'mounted'
    )
    const configuredPaths =
      namespacePaths[namespace as keyof TNamespaces]

    if (configuredPaths === undefined) {
      return undefined
    }

    return mergeRecords(
      content,
      composeLocalePaths(
        activeSource,
        defaultLocale,
        configuredPaths,
        'root'
      )
    )
  }

  const setLocale = (nextLocale: Locale): void => {
    currentLocale = nextLocale
    storageApi.setItem(storageConfig, nextLocale)
  }

  const getTranslations = ((options?: {
    namespace?: LocaleNamespaceOption<TBaseSchema, TNamespaces>
  }) => {
    const namespace = options?.namespace

    if (namespace === undefined) {
      return t
    }

    const fallbackValue = resolveComposedNamespace(
      defaultLocale,
      namespace
    )

    if (fallbackValue === undefined) {
      throw new Error(`Unknown namespace: ${namespace}`)
    }

    return createTranslationProxy(
      () =>
        resolveComposedNamespace(
          getActiveLocale(),
          namespace
        ) as TBaseSchema,
      fallbackValue as TBaseSchema
    )
  }) as GetTranslations<TBaseSchema, TGlobals, TNamespaces>

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
