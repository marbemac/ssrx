---
'@ssrx/plugin-tanstack-query': minor
'@ssrx/trpc-react-query': minor
---

Per tanstack query recommendations, stop using the suspense: true option by default. Thus you must change your
.useQuery() instances to .useSuspenseQuery() if you would like to preserve the SSR data fetching.
