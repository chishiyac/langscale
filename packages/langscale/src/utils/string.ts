import type { Locale } from '#types/index'
import type { DateValue } from '#types/primitives'
import { regex } from '#utils/regex'

const toDate = (value: DateValue): Date => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date: ${String(value)}`)
  }

  return date
}

const splitGraphemes = (value: string, locale: Locale): string[] => {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(locale, {
      granularity: 'grapheme'
    })

    return [...segmenter.segment(value)].map((item) => item.segment)
  }

  return [...value]
}

const normalize = (value: string): string =>
  regex().format.normalize(value)

/**
 * Converts a mixed-case or spaced key into a kebab-like namespace
 * segment.
 *
 * @example
 *   ;```ts
 *   toNamespaceSegment('signIn') // 'sign-in'
 *   toNamespaceSegment('home page') // 'home-page'
 *   ```
 *
 * @param value - Source key segment.
 */
const toNamespaceSegment = (value: string): string =>
  value
    .replaceAll(
      /(?<lower>[a-z0-9])(?<upper>[A-Z])/gu,
      '$<lower>-$<upper>'
    )
    .replaceAll(/[\s_]+/gu, '-')
    .toLowerCase()

export const string = () => ({
  normalize,
  splitGraphemes,
  toDate,
  toNamespaceSegment
})

export { toNamespaceSegment }
