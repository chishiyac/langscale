import { currencyMap } from '#constants/currency-map'
import type { Currency, Locale } from '#types/index'

/**
 * Checks whether a value is a non-null object.
 *
 * @example
 *   ;```ts
 *   isRecord({ title: 'Hello' }) // true
 *   isRecord(null) // false
 *   ```
 *
 * @param value - Value to inspect.
 * @returns `true` when the value is a plain object-like record.
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getCurrencyByLocale = (locale: Locale): Currency =>
  currencyMap[locale] ?? 'USD'

export const helpers = () => ({
  getCurrencyByLocale,
  isRecord
})

export { isRecord }
