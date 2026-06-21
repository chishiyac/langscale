import type {
  Currency,
  DateValue,
  DurationStyle,
  Language,
  Locale,
  Region,
  RelativeUnit
} from '#types/index'
import { helpers } from '#utils/helpers'
import { regex } from '#utils/regex'
import { string } from '#utils/string'

/**
 * Creates a locale-aware formatter toolkit for strings, dates, and
 * numbers.
 *
 * @example
 *   ;```ts
 *   const fmt = createFmt('en-US')
 *   fmt.currency(48_290.4, { currency: 'USD' })
 *   fmt.toTitleCase('local operations')
 *   ```
 *
 * @param locale - The active BCP 47 locale used for formatting.
 */
const createFmt = (locale: Locale) => {
  const capitalize = (input: string): string => {
    const chars = string().splitGraphemes(input, locale)
    const [first = '', ...rest] = chars

    return first.toLocaleUpperCase(locale) + rest.join('')
  }

  const lowercase = (input: string): string =>
    input.toLocaleLowerCase(locale)

  const uppercase = (input: string): string =>
    input.toLocaleUpperCase(locale)

  const toCamelCase = (input: string): string =>
    regex().format.camelCase(input, locale)

  const toPascalCase = (input: string): string =>
    regex().format.pascalCase(input, locale)

  const toKebabCase = (input: string): string =>
    regex().format.kebabCase(input, locale)

  const toSnakeCase = (input: string): string =>
    regex().format.snakeCase(input, locale)

  const slugify = (input: string): string =>
    regex().format.slug(input, locale)

  return {
    capitalize,

    compact(
      input: number,
      options?: Intl.NumberFormatOptions
    ): string {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        ...options
      }).format(input)
    },

    currency(
      input: number,
      options?: Intl.NumberFormatOptions & { currency?: Currency }
    ): string {
      const currency =
        options?.currency ?? helpers().getCurrencyByLocale(locale)

      return new Intl.NumberFormat(locale, {
        currency,
        style: 'currency',
        ...options
      }).format(input)
    },

    currencyName(
      input?: Currency,
      options?: Intl.DisplayNamesOptions
    ): string {
      const currency = input ?? helpers().getCurrencyByLocale(locale)

      const dn = new Intl.DisplayNames([locale], {
        type: 'currency',
        ...options
      })

      return dn.of(currency) ?? currency
    },

    currencySymbol(input?: Currency): string {
      const currency = input ?? helpers().getCurrencyByLocale(locale)

      return (
        new Intl.NumberFormat(locale, {
          currency,
          currencyDisplay: 'narrowSymbol',
          style: 'currency'
        })
          .formatToParts(0)
          .find((part) => part.type === 'currency')?.value ?? currency
      )
    },

    date(
      input: DateValue,
      options?: Intl.DateTimeFormatOptions
    ): string {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        ...options
      }).format(string().toDate(input))
    },

    dateTime(
      input: DateValue,
      options?: Intl.DateTimeFormatOptions
    ): string {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
        ...options
      }).format(string().toDate(input))
    },

    decimal(
      input: number,
      options?: Intl.NumberFormatOptions
    ): string {
      return new Intl.NumberFormat(locale, {
        style: 'decimal',
        ...options
      }).format(input)
    },

    duration(
      input: number,
      options?: { style?: DurationStyle }
    ): string {
      const style = options?.style ?? 'long'
      const safeinput = Math.max(0, Math.floor(input))

      const hours = Math.floor(safeinput / 3600)
      const minutes = Math.floor((safeinput % 3600) / 60)
      const seconds = safeinput % 60

      const parts: string[] = []

      const listFmt = new Intl.ListFormat(locale, {
        style,
        type: 'conjunction'
      })

      const unitFmt = (
        val: number,
        unit: NonNullable<Intl.NumberFormatOptions['unit']>
      ): string =>
        new Intl.NumberFormat(locale, {
          style: 'unit',
          unit,
          unitDisplay: style
        }).format(val)

      if (hours > 0) {
        parts.push(unitFmt(hours, 'hour'))
      }
      if (minutes > 0) {
        parts.push(unitFmt(minutes, 'minute'))
      }

      if (seconds > 0 || parts.length === 0) {
        parts.push(unitFmt(seconds, 'second'))
      }

      return listFmt.format(parts)
    },

    integer(
      input: number,
      options?: Intl.NumberFormatOptions
    ): string {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
        ...options
      }).format(input)
    },

    languageName(
      input: Language,
      options?: Intl.DisplayNamesOptions
    ): string {
      const dn = new Intl.DisplayNames([locale], {
        type: 'language',
        ...options
      })

      return dn.of(input) ?? input
    },

    list(input: string[], options?: Intl.ListFormatOptions): string {
      return new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
        ...options
      }).format(input)
    },

    lowercase,

    mask(input: string | number, options: { mask: string }): string {
      const str = regex().format.cleanDigits(String(input))
      let index = 0

      return options.mask.replaceAll('n', () => {
        const current = str[index] ?? ''
        index += 1
        return current
      })
    },

    month(
      input: DateValue,
      options?: Intl.DateTimeFormatOptions
    ): string {
      return new Intl.DateTimeFormat(locale, {
        month: 'long',
        ...options
      }).format(string().toDate(input))
    },

    normalize: string().normalize,

    percent(
      input: number,
      options?: Intl.NumberFormatOptions
    ): string {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        ...options
      }).format(input)
    },

    pluralize(
      input: number,
      options: Partial<Record<Intl.LDMLPluralRule, string>> & {
        other: string
      }
    ): string {
      const rule = new Intl.PluralRules(locale).select(input)

      return options[rule] ?? options.other
    },

    range(
      start: number,
      end: number,
      options?: Intl.NumberFormatOptions
    ): string {
      const fmt = new Intl.NumberFormat(locale, options)

      if (typeof fmt.formatRange === 'function') {
        return fmt.formatRange(start, end)
      }

      return `${fmt.format(start)}–${fmt.format(end)}`
    },

    regionName(
      input: Region,
      options?: Intl.DisplayNamesOptions
    ): string {
      const dn = new Intl.DisplayNames([locale], {
        type: 'region',
        ...options
      })

      return dn.of(input) ?? input
    },

    relative(
      input: number,
      unit: RelativeUnit,
      options?: Intl.RelativeTimeFormatOptions
    ): string {
      return new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
        ...options
      }).format(input, unit)
    },

    slugify,

    time(
      input: DateValue,
      options?: Intl.DateTimeFormatOptions
    ): string {
      return new Intl.DateTimeFormat(locale, {
        timeStyle: 'short',
        ...options
      }).format(string().toDate(input))
    },

    toCamelCase,

    toKebabCase,

    toPascalCase,

    toSnakeCase,

    toTitleCase(input: string): string {
      if (typeof Intl.Segmenter === 'function') {
        const segmenter = new Intl.Segmenter(locale, {
          granularity: 'word'
        })

        return [...segmenter.segment(input)]
          .map((item) => {
            if (!item.isWordLike) {
              return item.segment
            }

            return capitalize(lowercase(item.segment))
          })
          .join('')
      }

      return input.replaceAll(/\p{L}[\p{L}\p{M}]*/gu, (word) =>
        capitalize(lowercase(word))
      )
    },

    truncate(
      input: string,
      options?: { length?: number; suffix?: string }
    ): string {
      const length = options?.length ?? 30
      const suffix = options?.suffix ?? '...'

      const chars = string().splitGraphemes(input, locale)
      const suffixLength = string().splitGraphemes(
        suffix,
        locale
      ).length

      if (chars.length <= length) {
        return input
      }

      return chars.slice(0, length - suffixLength).join('') + suffix
    },

    unit(
      input: number,
      options: Intl.NumberFormatOptions & {
        unit: NonNullable<Intl.NumberFormatOptions['unit']>
      }
    ): string {
      return new Intl.NumberFormat(locale, {
        style: 'unit',
        unitDisplay: 'short',
        ...options
      }).format(input)
    },

    uppercase,

    weekday(
      input: DateValue,
      options?: Intl.DateTimeFormatOptions
    ): string {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        ...options
      }).format(string().toDate(input))
    }
  }
}

export { createFmt }
