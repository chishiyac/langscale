// oxlint-disable no-inline-comments

/**
 * Supported BCP 47 locale codes used by langscale.
 *
 * @example
 *   ;```ts
 *   const locale: Locale = 'pt-BR'
 *   ```
 */
type Locale =
  | 'pt-BR' // Brazil
  | 'pt-PT' // Portugal
  | 'en-US' // United States
  | 'en-GB' // United Kingdom
  | 'en-CA' // Canada
  | 'es-ES' // Spain
  | 'es-MX' // Mexico
  | 'fr-FR' // France
  | 'fr-CA' // Canada
  | 'de-DE' // Germany
  | 'it-IT' // Italy
  | 'nl-NL' // Netherlands
  | 'ru-RU' // Russia
  | 'ja-JP' // Japan
  | 'ko-KR' // South Korea
  | 'zh-CN' // China
  | 'zh-TW' // Taiwan
  | 'ar-SA' // Saudi Arabia
  | 'hi-IN' // India
  | 'tr-TR' // Turkey
  | 'sv-SE' // Sweden
  | 'da-DK' // Denmark
  | 'no-NO' // Norway
  | 'fi-FI' // Finland
  | 'pl-PL' // Poland

/**
 * Supported ISO 4217 currency codes used by the formatter helpers.
 *
 * @example
 *   ;```ts
 *   const currency: Currency = 'USD'
 *   ```
 */
type Currency =
  | 'BRL' // Brazil
  | 'EUR' // Portugal, Spain, France, Germany, Italy, Netherlands, Finland
  | 'USD' // United States
  | 'GBP' // United Kingdom
  | 'CAD' // Canada
  | 'MXN' // Mexico
  | 'RUB' // Russia
  | 'JPY' // Japan
  | 'KRW' // South Korea
  | 'CNY' // China
  | 'TWD' // Taiwan
  | 'SAR' // Saudi Arabia
  | 'INR' // India
  | 'TRY' // Turkey
  | 'SEK' // Sweden
  | 'DKK' // Denmark
  | 'NOK' // Norway
  | 'PLN' // Poland

/**
 * Extracts the language subtag from a supported locale.
 *
 * @example
 *   ;```ts
 *   const language: Language = 'pt'
 *   ```
 */
type Language = Locale extends `${infer T}-${string}` ? T : never

/**
 * Extracts the region subtag from a supported locale.
 *
 * @example
 *   ;```ts
 *   const region: Region = 'BR'
 *   ```
 */
type Region = Locale extends `${string}-${infer T}` ? T : never

type RelativeUnit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'

type StringKey<T> = Extract<keyof T, string>

type KebabCase<
  S extends string,
  Acc extends string = ''
> = S extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? KebabCase<Rest, `${Acc}${First}`>
    : Acc extends ''
      ? KebabCase<Rest, `${Acc}${Lowercase<First>}`>
      : KebabCase<Rest, `${Acc}-${Lowercase<First>}`>
  : Acc

type LocaleNamespaceEntry<TSchema extends object> = {
  [Parent in StringKey<TSchema>]: TSchema[Parent] extends Record<
    string,
    unknown
  >
    ? {
        [Child in StringKey<
          TSchema[Parent]
        >]: TSchema[Parent][Child] extends Record<string, unknown>
          ? {
              namespace: `${KebabCase<Child>}-${KebabCase<Parent>}`
              value: TSchema[Parent][Child]
            }
          : never
      }[StringKey<TSchema[Parent]>]
    : never
}[StringKey<TSchema>]

type LocaleNamespace<TSchema extends object> =
  LocaleNamespaceEntry<TSchema>['namespace']

type LocaleNamespaceValue<
  TSchema extends object,
  TNamespace extends LocaleNamespace<TSchema>
> = Extract<
  LocaleNamespaceEntry<TSchema>,
  { namespace: TNamespace }
>['value']

export type {
  Currency,
  Language,
  Locale,
  LocaleNamespace,
  LocaleNamespaceValue,
  Region,
  RelativeUnit
}
