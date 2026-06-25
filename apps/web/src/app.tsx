import { createLocaleConfig } from '@langscale/react'
import { defineLocale, type Locale } from 'langscale'

interface DemoSchema {
  component: {
    bubble: {
      state: (input: boolean) => string
    }
  }
  dashboard: {
    stats: {
      lastSync: string
      orders: string
      revenue: string
    }
    title: string
  }
  form: {
    login: {
      email: {
        description: string
        label: string
        placeholder: string
      }
    }
  }
  global: {
    action: {
      continue: string
      save: string
    }
    state: {
      loading: string
      saved: string
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
    component: {
      bubble: {
        state: (input: boolean): string =>
          input ? 'Collapse' : 'Expand'
      }
    },
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
      login: {
        email: {
          description:
            'Use an organization email to easily collaborate with teammates.',
          label: 'Email',
          placeholder: 'joedoe@company.com'
        }
      }
    },
    global: {
      action: {
        continue: 'Continue',
        save: 'Save'
      },
      state: {
        loading: 'Loading',
        saved: 'Saved'
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
    component: {
      bubble: {
        state: (input: boolean): string =>
          input ? 'Recolher' : 'Expandir'
      }
    },
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
      login: {
        email: {
          description:
            'Use um email corporativo para colaborar facilmente com sua equipe.',
          label: 'Email',
          placeholder: 'joaosilva@empresa.com'
        }
      }
    },
    global: {
      action: {
        continue: 'Continuar',
        save: 'Salvar'
      },
      state: {
        loading: 'Carregando',
        saved: 'Salvo'
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
    globals: ['global.action', 'global.state'],
    locales: [enUS, ptBR],
    namespaces: {
      'bubble-component': ['component.bubble'],
      'home-page': ['page.home'],
      'login-form': ['form.login']
    },
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
  const loginForm = getTranslations({
    namespace: 'login-form'
  })
  const bubble = getTranslations({
    namespace: 'bubble-component'
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
          <h2>{loginForm.email.label}</h2>
          <label className='field'>
            <span>{loginForm.email.description}</span>
            <input
              aria-label={loginForm.email.label}
              placeholder={loginForm.email.placeholder}
              type='email'
            />
          </label>
          <div className='form-actions'>
            <button className='button primary' type='button'>
              {loginForm.action.continue}
            </button>
            <span className='muted'>{loginForm.state.saved}</span>
          </div>
          <p className='muted'>{loginForm.state.loading}</p>
          <strong>{bubble.state(false)}</strong>
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
