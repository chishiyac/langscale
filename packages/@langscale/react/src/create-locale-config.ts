import {
  createLocaleConfig as createCoreLocaleConfig,
  createFmt,
  type Locale,
  type LocaleNamespace,
  type LocaleNamespaceValue
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
  TBaseSchema extends TranslationSchema
> {
  defaultLocale: TBaseSchema
  locales: TBaseSchema[]
  /**
   * Storage used to persist the selected locale between sessions.
   *
   * @default { key: '@langscale_lang', method: 'local' }
   */
  storage?: StorageConfig
}

interface CreateLocaleConfigReturn<
  TBaseSchema extends TranslationSchema
> {
  LocaleProvider: (props: {
    children?: ReactNode
  }) => ReturnType<typeof createElement>
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
  useLocale: <
    TNamespace extends LocaleNamespace<TBaseSchema> | undefined =
      undefined
  >(options?: {
    namespace?: TNamespace
  }) => TNamespace extends LocaleNamespace<TBaseSchema>
    ? {
        content: LocaleNamespaceValue<TBaseSchema, TNamespace>
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

interface LocaleStore<TBaseSchema extends TranslationSchema> {
  getLocale: () => Locale
  getTranslations: CreateLocaleConfigReturn<TBaseSchema>['getTranslations']
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
 *     locales: [enUS, ptBR]
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
const createLocaleConfig = <TBaseSchema extends TranslationSchema>({
  defaultLocale,
  locales,
  storage
}: CreateLocaleConfigInput<TBaseSchema>): CreateLocaleConfigReturn<TBaseSchema> => {
  const core = createCoreLocaleConfig({
    defaultLocale,
    locales,
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

  const LocaleContext =
    createContext<LocaleStore<TBaseSchema> | null>(null)

  const store: LocaleStore<TBaseSchema> = {
    getLocale,
    getTranslations: core.getTranslations,
    setLocale,
    subscribe,
    t: core.t
  }

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
    TNamespace extends LocaleNamespace<TBaseSchema> | undefined =
      undefined
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

    const content = context.getTranslations(options)

    return {
      content,
      fmt,
      locale,
      setLocale: context.setLocale
    } as TNamespace extends LocaleNamespace<TBaseSchema>
      ? {
          content: LocaleNamespaceValue<TBaseSchema, TNamespace>
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
    getTranslations: core.getTranslations,
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
