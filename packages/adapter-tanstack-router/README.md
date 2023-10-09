### TODO

Note, the `lazyRouteComponent` included in tanstack/react-router does not preserve the identity of the original dynamic
import when it assigns to preload.

Use the function below instead, which does.

```tsx
/**
 * Adapted from https://github.com/TanStack/router/blob/806ef336e52d786ea7b5bc5988b96df9526e9218/packages/react-router/src/react.tsx#L266
 *
 * Changed to preserve identity of the importer promise.
 */
export function lazyRouteComponent<T extends Record<string, any>, TKey extends keyof T = 'default'>(
  importer: () => Promise<T>,
  exportName?: TKey,
): T[TKey] extends (props: infer TProps) => any ? AsyncRouteComponent<TProps> : never {
  const load = importer;

  const lazyComp = React.lazy(async () => {
    const moduleExports = await load();
    const comp = moduleExports[exportName ?? 'default'];
    return {
      default: comp,
    };
  });

  (lazyComp as any).preload = load;

  return lazyComp as any;
}
```
