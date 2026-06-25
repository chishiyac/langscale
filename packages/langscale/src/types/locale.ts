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

type Simplify<T> = {
  [Key in keyof T]: T[Key]
}

type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never

type IsMergeableObject<T> = T extends (
  ...args: infer _TArguments
) => unknown
  ? false
  : T extends object
    ? true
    : false

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
  [Parent in StringKey<TSchema>]: IsMergeableObject<
    TSchema[Parent]
  > extends true
    ? {
        [Child in StringKey<TSchema[Parent]>]: IsMergeableObject<
          TSchema[Parent][Child]
        > extends true
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

type LocalePath<TSchema extends object> = {
  [Parent in StringKey<TSchema>]: IsMergeableObject<
    TSchema[Parent]
  > extends true
    ? {
        [Child in StringKey<TSchema[Parent]>]: IsMergeableObject<
          TSchema[Parent][Child]
        > extends true
          ? `${Parent}.${Child}`
          : never
      }[StringKey<TSchema[Parent]>]
    : never
}[StringKey<TSchema>]

type LocalePathValue<
  TSchema extends object,
  TPath extends LocalePath<TSchema>
> = TPath extends `${infer Parent}.${infer Child}`
  ? Parent extends keyof TSchema
    ? Child extends keyof TSchema[Parent]
      ? TSchema[Parent][Child]
      : never
    : never
  : never

type LastPathSegment<TPath extends string> =
  TPath extends `${string}.${infer Tail}`
    ? LastPathSegment<Tail>
    : TPath

type DeepMerge<TLeft, TRight> = Simplify<{
  [Key in keyof TLeft | keyof TRight]: Key extends keyof TRight
    ? Key extends keyof TLeft
      ? IsMergeableObject<TLeft[Key]> extends true
        ? IsMergeableObject<TRight[Key]> extends true
          ? DeepMerge<TLeft[Key], TRight[Key]>
          : TRight[Key]
        : TRight[Key]
      : TRight[Key]
    : Key extends keyof TLeft
      ? TLeft[Key]
      : never
}>

type LocalePathObject<
  TSchema extends object,
  TPath extends LocalePath<TSchema>,
  TMode extends 'mounted' | 'root'
> = TMode extends 'mounted'
  ? Record<LastPathSegment<TPath>, LocalePathValue<TSchema, TPath>>
  : LocalePathValue<TSchema, TPath>

type MergeLocalePaths<
  TSchema extends object,
  TPaths extends readonly LocalePath<TSchema>[],
  TMode extends 'mounted' | 'root',
  TAcc extends object = Record<never, never>
> = number extends TPaths['length']
  ? [TPaths[number]] extends [never]
    ? TAcc
    : DeepMerge<
        TAcc,
        Simplify<
          UnionToIntersection<
            LocalePathObject<TSchema, TPaths[number], TMode>
          >
        >
      >
  : TPaths extends readonly [
        infer First extends LocalePath<TSchema>,
        ...infer Rest extends readonly LocalePath<TSchema>[]
      ]
    ? MergeLocalePaths<
        TSchema,
        Rest,
        TMode,
        DeepMerge<TAcc, LocalePathObject<TSchema, First, TMode>>
      >
    : TAcc

type LocaleNamespacesConfig<TSchema extends object> = Record<
  string,
  readonly LocalePath<TSchema>[]
>

type ConfiguredLocaleNamespace<TNamespaces> = Extract<
  keyof TNamespaces,
  string
>

type LocaleNamespaceOption<
  TSchema extends object,
  TNamespaces extends LocaleNamespacesConfig<TSchema>
> = ConfiguredLocaleNamespace<TNamespaces>

type ComposedLocaleNamespaceValue<
  TSchema extends object,
  TGlobals extends readonly LocalePath<TSchema>[],
  TNamespaces extends LocaleNamespacesConfig<TSchema>,
  TNamespace extends LocaleNamespaceOption<TSchema, TNamespaces>
> = TNamespace extends keyof TNamespaces
  ? DeepMerge<
      MergeLocalePaths<TSchema, TGlobals, 'mounted'>,
      MergeLocalePaths<TSchema, TNamespaces[TNamespace], 'root'>
    >
  : never

export type {
  ComposedLocaleNamespaceValue,
  Currency,
  LocaleNamespaceOption,
  Language,
  Locale,
  LocaleNamespace,
  LocaleNamespaceValue,
  LocaleNamespacesConfig,
  LocalePath,
  LocalePathValue,
  Region,
  RelativeUnit
}
