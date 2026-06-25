import {
  createLocaleConfig as createCoreLocaleConfig,
  createFmt,
  type ComposedLocaleNamespaceValue,
  type Locale,
  type LocaleNamespaceOption,
  type LocaleNamespacesConfig,
  type LocalePath
} from 'langscale'
import {
  createContext,
  createElement,
  useContext,
  useSyncExternalStore,
  type ReactNode
} from 'react'

type TranslationSchema = object

interface StorageConfig {
  key: string
  method: 'local' | 'session'
}

interface CreateLocaleConfigInput<
  TBaseSchema extends TranslationSchema,
  TGlobals extends readonly LocalePath<TBaseSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TBaseSchema>
> {
  defaultLocale: TBaseSchema
  /**
   * Locale paths composed into every namespace and mounted by their
   * final path segment.
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

interface CreateLocaleConfigReturn<
  TBaseSchema extends TranslationSchema,
  TGlobals extends readonly LocalePath<TBaseSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TBaseSchema>
> {
  LocaleProvider: (props: {
    children?: ReactNode
  }) => ReturnType<typeof createElement>
  getTranslations: GetTranslations<TBaseSchema, TGlobals, TNamespaces>
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TBaseSchema
  useLocale: <
    TNamespace extends
      | LocaleNamespaceOption<TBaseSchema, TNamespaces>
      | undefined = undefined
  >(options?: {
    namespace?: TNamespace
  }) => TNamespace extends LocaleNamespaceOption<
    TBaseSchema,
    TNamespaces
  >
    ? {
        content: ComposedLocaleNamespaceValue<
          TBaseSchema,
          TGlobals,
          TNamespaces,
          TNamespace
        >
        fmt: ReturnType<typeof createFmt>
        locale: Locale
        setLocale: (locale: Locale) => void
      }
    : {
        content: TBaseSchema
        fmt: ReturnType<typeof createFmt>
        locale: Locale
        setLocale: (locale: Locale) => void
      }
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

interface LocaleStore<
  TBaseSchema extends TranslationSchema,
  TGlobals extends readonly LocalePath<TBaseSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TBaseSchema>
> {
  getLocale: () => Locale
  getTranslations: CreateLocaleConfigReturn<
    TBaseSchema,
    TGlobals,
    TNamespaces
  >['getTranslations']
  setLocale: (locale: Locale) => void
  subscribe: (listener: () => void) => () => void
  t: TBaseSchema
}

/**
 * Creates a locale configuration with React bindings.
 *
 * The returned API mirrors the core locale manager and adds: -
 * `LocaleProvider` to scope the locale store to a React tree -
 * `useLocale` to read the current locale and the active translation
 * branch
 *
 * @example
 *   ;```ts
 *   const { LocaleProvider, useLocale } = createLocaleConfig({
 *     defaultLocale: enUS,
 *     locales: [enUS, ptBR],
 *     globals: ['global.action'],
 *     namespaces: {
 *       'home-page': ['page.home'],
 *       'login-form': ['form.login']
 *     }
 *   })
 *
 *   function App() {
 *     const { content, locale, setLocale } = useLocale({
 *       namespace: 'home-page'
 *     })
 *
 *     return (
 *       <LocaleProvider>
 *         <h1>{content.title}</h1>
 *       </LocaleProvider>
 *     )
 *   }
 *   ```
 *
 * @param config - Locale configuration shared with the core package.
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
  storage
}: CreateLocaleConfigInput<
  TBaseSchema,
  TGlobals,
  TNamespaces
>): CreateLocaleConfigReturn<TBaseSchema, TGlobals, TNamespaces> => {
  const core = createCoreLocaleConfig({
    defaultLocale,
    globals,
    locales,
    namespaces,
    storage
  })

  let currentLocale = core.locale
  const listeners = new Set<() => void>()

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  const notify = (): void => {
    for (const listener of listeners) {
      listener()
    }
  }

  const getLocale = (): Locale => currentLocale

  const setLocale = (nextLocale: Locale): void => {
    if (nextLocale === currentLocale) {
      return
    }

    currentLocale = nextLocale
    core.setLocale(nextLocale)
    notify()
  }

  const LocaleContext = createContext<LocaleStore<
    TBaseSchema,
    TGlobals,
    TNamespaces
  > | null>(null)

  const store: LocaleStore<TBaseSchema, TGlobals, TNamespaces> = {
    getLocale,
    getTranslations: core.getTranslations,
    setLocale,
    subscribe,
    t: core.t
  }

  const getTranslations = ((options?: {
    namespace?: LocaleNamespaceOption<TBaseSchema, TNamespaces>
  }) => {
    useSyncExternalStore(subscribe, getLocale, getLocale)

    if (options?.namespace === undefined) {
      return core.getTranslations()
    }

    return core.getTranslations({
      namespace: options.namespace
    })
  }) as GetTranslations<TBaseSchema, TGlobals, TNamespaces>

  const LocaleProvider = ({
    children
  }: {
    children?: ReactNode
  }): ReturnType<typeof createElement> =>
    createElement(LocaleContext.Provider, {
      children,
      value: store
    })

  const useLocale = <
    TNamespace extends
      | LocaleNamespaceOption<TBaseSchema, TNamespaces>
      | undefined = undefined
  >(options?: {
    namespace?: TNamespace
  }) => {
    const context = useContext(LocaleContext)

    if (context === null) {
      throw new Error(
        'useLocale must be used inside a LocaleProvider'
      )
    }

    const locale = useSyncExternalStore(
      context.subscribe,
      context.getLocale,
      context.getLocale
    )
    const fmt = createFmt(locale)

    const content =
      options?.namespace === undefined
        ? context.getTranslations()
        : context.getTranslations({
            namespace: options.namespace
          })

    return {
      content,
      fmt,
      locale,
      setLocale: context.setLocale
    } as unknown as TNamespace extends LocaleNamespaceOption<
      TBaseSchema,
      TNamespaces
    >
      ? {
          content: ComposedLocaleNamespaceValue<
            TBaseSchema,
            TGlobals,
            TNamespaces,
            TNamespace
          >
          fmt: ReturnType<typeof createFmt>
          locale: Locale
          setLocale: (locale: Locale) => void
        }
      : {
          content: TBaseSchema
          fmt: ReturnType<typeof createFmt>
          locale: Locale
          setLocale: (locale: Locale) => void
        }
  }

  return {
    LocaleProvider,
    getTranslations,
    get locale(): Locale {
      return currentLocale
    },
    setLocale,
    t: core.t,
    useLocale
  }
}

export { createLocaleConfig }

export type { CreateLocaleConfigInput, CreateLocaleConfigReturn }
