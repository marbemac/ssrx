This folder contains the bare minimum code copied over from the tanstack router repo, to get SSR to work.

Up to date as of: https://github.com/TanStack/router/tree/bed07a1917457085b509ac140fdb8f5ea958f397

The reasons to copy the code over:

1. Some of the functions are not exported from tanstack/start.
2. Importing from tanstack/start pulls in a LOT of code, including vinxi related code, that is not necessary for ssrx
   and complicates the build pipeline in various ways.

Hopefully once tanstack/start is mature, the bits relevant to get basic SSR working are moved over to tanstack/router or
otherwise separated a bit from the rest of the start codebase and made importable.
