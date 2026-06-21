import { createLocaleConfig } from '@langscale/react'
import { defineLocale, type Locale } from 'langscale'

interface DemoSchema {
  dashboard: {
    stats: {
      lastSync: string
      orders: string
      revenue: string
    }
    title: string
  }
  form: {
    checkout: {
      cta: string
      description: string
      title: string
    }
  }
  marketing: {
    hero: {
      badge: string
      description: string
    }
  }
  page: {
    home: {
      description: string
      title: string
    }
  }
}

const enUS = defineLocale<DemoSchema>([
  ({ fmt }) => ({
    dashboard: {
      stats: {
        lastSync: fmt.relative(-15, 'minute'),
        orders: fmt.pluralize(128, {
          one: '1 order received today',
          other: '128 orders received today'
        }),
        revenue: fmt.currency(48_290.4, { currency: 'USD' })
      },
      title: fmt.toTitleCase('local operations')
    },
    form: {
      checkout: {
        cta: 'Continue to payment',
        description: `Localized by langscale and rendered in ${fmt.languageName('en')}.`,
        title: 'Fast checkout flow'
      }
    },
    marketing: {
      hero: {
        badge: 'Reactive translations',
        description: `Vite-powered demo, built with ${fmt.list([
          'React',
          'TypeScript',
          'langscale'
        ])}.`
      }
    },
    page: {
      home: {
        description: fmt.list(['React', 'TypeScript', 'langscale']),
        title: fmt.toTitleCase('langscale home page')
      }
    }
  }),
  'en-US'
])

const ptBR = defineLocale<DemoSchema>([
  ({ fmt }) => ({
    dashboard: {
      stats: {
        lastSync: fmt.relative(-15, 'minute'),
        orders: fmt.pluralize(128, {
          one: '1 pedido recebido hoje',
          other: '128 pedidos recebidos hoje'
        }),
        revenue: fmt.currency(48_290.4, { currency: 'BRL' })
      },
      title: fmt.toTitleCase('operacoes locais')
    },
    form: {
      checkout: {
        cta: 'Continuar para pagamento',
        description: `Localizado com langscale e renderizado em ${fmt.languageName('pt')}.`,
        title: 'Fluxo de checkout rapido'
      }
    },
    marketing: {
      hero: {
        badge: 'Traducoes reativas',
        description: `Demo com Vite, feita com ${fmt.list([
          'React',
          'TypeScript',
          'langscale'
        ])}.`
      }
    },
    page: {
      home: {
        description: fmt.list(['React', 'TypeScript', 'langscale']),
        title: fmt.toTitleCase('pagina inicial langscale')
      }
    }
  }),
  'pt-BR'
])

const { LocaleProvider, getTranslations, useLocale } =
  createLocaleConfig({
    defaultLocale: enUS,
    locales: [enUS, ptBR],
    storage: {
      key: '@langscale_demo_locale',
      method: 'local'
    }
  })

const availableLocales: Locale[] = ['en-US', 'pt-BR']

const AppContent = (): JSX.Element => {
  const {
    content: translations,
    fmt,
    locale,
    setLocale
  } = useLocale()
  const home = useLocale({
    namespace: 'home-page'
  })
  const checkout = getTranslations({
    namespace: 'checkout-form'
  })

  return (
    <main className='shell'>
      <section className='hero'>
        <div className='eyebrow'>langscale demo</div>
        <h1>{home.content.title}</h1>
        <p className='lede'>{home.content.description}</p>
        <div className='actions'>
          {availableLocales.map((nextLocale) => (
            <button
              key={nextLocale}
              className={
                nextLocale === locale ? 'button active' : 'button'
              }
              onClick={() => setLocale(nextLocale)}
              type='button'
            >
              {nextLocale}
            </button>
          ))}
        </div>
      </section>

      <section className='grid'>
        <article className='card'>
          <h2>{translations.dashboard.title}</h2>
          <ul>
            <li>{translations.dashboard.stats.orders}</li>
            <li>{translations.dashboard.stats.lastSync}</li>
            <li>{translations.dashboard.stats.revenue}</li>
          </ul>
        </article>

        <article className='card'>
          <h2>{translations.marketing.hero.badge}</h2>
          <p>{translations.marketing.hero.description}</p>
          <p className='muted'>
            {fmt.currencyName('USD')} / {fmt.currencySymbol('USD')}
          </p>
        </article>

        <article className='card'>
          <h2>{checkout.title}</h2>
          <p>{checkout.description}</p>
          <strong>{checkout.cta}</strong>
        </article>
      </section>
    </main>
  )
}

export default function App(): JSX.Element {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  )
}
