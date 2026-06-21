import type { Currency, Locale } from '#types/index'

const currencyMap: Record<Locale, Currency> = {
  'ar-SA': 'SAR',
  'da-DK': 'DKK',
  'de-DE': 'EUR',
  'en-CA': 'CAD',
  'en-GB': 'GBP',
  'en-US': 'USD',
  'es-ES': 'EUR',
  'es-MX': 'MXN',
  'fi-FI': 'EUR',
  'fr-CA': 'CAD',
  'fr-FR': 'EUR',
  'hi-IN': 'INR',
  'it-IT': 'EUR',
  'ja-JP': 'JPY',
  'ko-KR': 'KRW',
  'nl-NL': 'EUR',
  'no-NO': 'NOK',
  'pl-PL': 'PLN',
  'pt-BR': 'BRL',
  'pt-PT': 'EUR',
  'ru-RU': 'RUB',
  'sv-SE': 'SEK',
  'tr-TR': 'TRY',
  'zh-CN': 'CNY',
  'zh-TW': 'TWD'
}

export { currencyMap }
