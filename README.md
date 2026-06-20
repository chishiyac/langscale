<div align="center">
  <h1>langscale</h1>
  <p>Type-safe localization and language management for modern TypeScript applications.</p>
  <p>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" />
    </a>
    <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-339933?logo=node.js&logoColor=white" alt="Node.js >=20.0.0" />
    <img src="https://img.shields.io/badge/package%20manager-pnpm-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
  </p>
</div>

## Introduction

`langscale` is a small, framework-agnostic localization library for TypeScript.
It is designed to help applications manage translations, locales, and language metadata while keeping translation keys type-safe all the way through nested message objects.

The core package focuses on translation state, locale switching, and fallback behavior.
React support is available through the `langscale/react` subpath without forcing React onto non-React consumers.

## Main Features

- type-safe nested translation keys inferred from your fallback locale
- simple locale switching with fallback support
- optional language metadata for labels, native names, and text direction
- template interpolation with typed placeholder arguments
- React bindings for context-based consumption and reactive UI updates
- ESM-first package output for modern TypeScript tooling

## Installation

Install the core package:

```bash
pnpm add langscale
```

If you plan to use the React bindings, make sure your app already has React installed:

```bash
pnpm add react
```

The React helpers are imported from `langscale/react`.

## Basic Usage

```ts
import { createLangscale } from 'langscale'

const i18n = createLangscale({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      common: {
        hello: 'Hello',
        welcome: 'Welcome, {{name}}!'
      }
    },
    pt: {
      common: {
        hello: 'Olá'
      }
    }
  }
})

i18n.t('common.hello')
i18n.t('common.welcome', { name: 'Langscale' })
i18n.setLocale('pt')
```

## Type-Safe Translations

`langscale` infers nested keys from the fallback locale so your editor can catch typos before they ship.

```ts
import { createLangscale } from 'langscale'

const i18n = createLangscale({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      auth: {
        signIn: {
          title: 'Sign in',
          subtitle: 'Welcome back, {{name}}.'
        }
      }
    },
    fr: {
      auth: {
        signIn: {
          title: 'Se connecter'
        }
      }
    }
  }
})

i18n.t('auth.signIn.title')
i18n.t('auth.signIn.subtitle', { name: 'Ava' })

// @ts-expect-error - unknown nested key
i18n.t('auth.signUp.title')
```

## Locale and Language Configuration

`langscale` keeps locale state separate from optional language metadata so you can use whichever naming convention fits your product.

```ts
import { createLangscale } from 'langscale'

const i18n = createLangscale({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': {
      common: {
        title: 'Dashboard'
      }
    },
    'pt-BR': {
      common: {
        title: 'Painel'
      }
    }
  },
  languages: [
    {
      code: 'en-US',
      label: 'English',
      nativeLabel: 'English',
      direction: 'ltr'
    },
    {
      code: 'pt-BR',
      label: 'Portuguese',
      nativeLabel: 'Português',
      direction: 'ltr'
    }
  ]
})

i18n.getLanguage('pt-BR')
i18n.locales
i18n.setLocale('pt-BR')
```

## React Support

React integration lives in the `langscale/react` subpath and stays in sync with the underlying locale store.

```tsx
import { createLangscale } from 'langscale'
import { createLangscaleReact } from 'langscale/react'

const i18n = createLangscale({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { common: { hello: 'Hello' } },
    pt: { common: { hello: 'Olá' } }
  }
})

const { Provider, useTranslation } = createLangscaleReact(i18n)

function Greeting() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <button
      type='button'
      onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
    >
      {t('common.hello')}
    </button>
  )
}

export function App() {
  return (
    <Provider>
      <Greeting />
    </Provider>
  )
}
```

## API Overview

- `createLangscale(options)` creates a localization instance with locale state, fallback behavior, and translation helpers.
- `langscale.t(key, params?)` resolves a translated string using the active locale and fallback locale.
- `langscale.setLocale(locale)` updates the active locale.
- `langscale.getMessage(locale, key)` reads a raw message from a specific locale.
- `langscale.getLanguage(locale?)` returns metadata for a configured language.
- `createLangscaleReact(instance)` binds a Langscale instance to React context and hooks.
- `useLangscale()` returns the active Langscale instance inside React.
- `useTranslation()` returns the translation helper plus locale state for UI rendering.
- `useLocale()` returns just the locale state and setter.

## Development

```bash
pnpm install
pnpm build
pnpm dev
pnpm type-check
pnpm fmt:check
```

## License

This project is licensed under the MIT License.
