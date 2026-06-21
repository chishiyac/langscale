declare module 'react' {
  export type ReactNode = unknown

  export interface ReactElement {
    readonly __reactElementBrand?: never
  }

  export interface Context<T> {
    Provider: (props: {
      children?: ReactNode
      value: T
    }) => ReactElement
  }

  export function createContext<T>(defaultValue: T): Context<T>
  export function createElement(
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: ReactNode[]
  ): ReactElement
  export function useContext<T>(context: Context<T>): T
  export function useSyncExternalStore<TSnapshot>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => TSnapshot,
    getServerSnapshot?: () => TSnapshot
  ): TSnapshot
}
