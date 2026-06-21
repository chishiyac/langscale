type RegexParam = string | null | undefined
type RegexTestReturn = boolean

const safe = (value: RegexParam): string => value ?? ''

const mask = {
  camelCase:
    /^[\p{Ll}][\p{L}\p{M}\p{N}]*(?:[\p{Lu}\p{N}][\p{L}\p{M}\p{N}]*)*$/u,
  combiningMarks: /[\u0300-\u036F]/gu,
  digit: /\p{Nd}/u,
  digits: /^\p{Nd}+$/u,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/u,
  extraWhitespace: /\s{2,}/gu,
  hexadecimal: /^#?(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/iu,
  invisibleChars: /[\u200B-\u200D\uFEFF]/gu,
  kebabCase: /^[\p{Ll}\p{N}]+(?:-[\p{Ll}\p{N}]+)*$/u,
  letter: /^\p{L}+$/u,
  nonDigits: /[^\p{Nd}]/gu,
  nonLetters: /[^\p{L}\p{M}]/gu,
  nonWords: /[^\p{L}\p{M}\p{N}\s'-]/gu,
  number:
    /^[+-]?(?:\p{Nd}+|\p{Nd}+[.,]\p{Nd}+|\p{Nd}{1,3}(?:[.,\s]\p{Nd}{3})+)$/u,
  pascalCase:
    /^[\p{Lu}][\p{L}\p{M}\p{N}]*(?:[\p{Lu}\p{N}][\p{L}\p{M}\p{N}]*)*$/u,
  slugSeparator: /[\s_-]+/gu,
  slugUnsafe: /[^\p{L}\p{M}\p{N}\s-]/gu,
  snakeCase: /^[\p{Ll}\p{N}]+(?:_[\p{Ll}\p{N}]+)*$/u,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/iu,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
  whitespace: /\s+/gu,
  word: /^[\p{L}\p{M}]+$/u,
  words: /^[\p{L}\p{M}\s'-]+$/u
} as const

const format = {
  camelCase(value: string, locale: string): string {
    return value
      .toLocaleLowerCase(locale)
      .replaceAll(/[-_\s]+(?<char>.)/gu, (_, char: string) =>
        char.toLocaleUpperCase(locale)
      )
  },
  cleanDigits(value: string): string {
    return value.replaceAll(mask.nonDigits, '')
  },
  cleanLetters(value: string): string {
    return value.replaceAll(mask.nonLetters, '')
  },
  cleanWords(value: string): string {
    return value.replaceAll(mask.nonWords, '')
  },
  kebabCase(value: string, locale: string): string {
    return value
      .replaceAll(
        /(?<lower>[\p{Ll}\p{N}])(?<upper>\p{Lu})/gu,
        '$<lower>-$<upper>'
      )
      .replaceAll(/[\s_]+/gu, '-')
      .toLocaleLowerCase(locale)
  },
  normalize(value: string): string {
    return value.normalize('NFD').replaceAll(mask.combiningMarks, '')
  },
  pascalCase(value: string, locale: string): string {
    const camel = format.camelCase(value, locale)

    return camel.charAt(0).toLocaleUpperCase(locale) + camel.slice(1)
  },
  removeExtraSpaces(value: string): string {
    return value.trim().replaceAll(mask.extraWhitespace, ' ')
  },
  removeInvisible(value: string): string {
    return value.replaceAll(mask.invisibleChars, '')
  },
  slug(value: string, locale: string): string {
    return format
      .normalize(value)
      .toLocaleLowerCase(locale)
      .trim()
      .replaceAll(mask.slugUnsafe, '')
      .replaceAll(mask.slugSeparator, '-')
      .replaceAll(/^-+|-+$/gu, '')
  },
  snakeCase(value: string, locale: string): string {
    return value
      .replaceAll(
        /(?<lower>[\p{Ll}\p{N}])(?<upper>\p{Lu})/gu,
        '$<lower>_$<upper>'
      )
      .replaceAll(/[\s-]+/gu, '_')
      .toLocaleLowerCase(locale)
  }
} as const

const test = {
  camelCase(value: RegexParam): RegexTestReturn {
    return mask.camelCase.test(safe(value))
  },
  digit(value: RegexParam): RegexTestReturn {
    return mask.digit.test(safe(value))
  },
  digits(value: RegexParam): RegexTestReturn {
    return mask.digits.test(safe(value))
  },
  email(value: RegexParam): RegexTestReturn {
    return mask.email.test(safe(value).trim())
  },
  hexadecimal(value: RegexParam): RegexTestReturn {
    return mask.hexadecimal.test(safe(value).trim())
  },
  kebabCase(value: RegexParam): RegexTestReturn {
    return mask.kebabCase.test(safe(value))
  },
  letter(value: RegexParam): RegexTestReturn {
    return mask.letter.test(safe(value))
  },
  number(value: RegexParam): RegexTestReturn {
    return mask.number.test(safe(value))
  },
  pascalCase(value: RegexParam): RegexTestReturn {
    return mask.pascalCase.test(safe(value))
  },
  snakeCase(value: RegexParam): RegexTestReturn {
    return mask.snakeCase.test(safe(value))
  },
  url(value: RegexParam): RegexTestReturn {
    return mask.url.test(safe(value).trim())
  },
  uuid(value: RegexParam): RegexTestReturn {
    return mask.uuid.test(safe(value).trim())
  },
  word(value: RegexParam): RegexTestReturn {
    return mask.word.test(safe(value))
  },
  words(value: RegexParam): RegexTestReturn {
    return mask.words.test(safe(value))
  }
} as const

const regex = () => ({
  format,
  mask,
  test
})

export { regex }
