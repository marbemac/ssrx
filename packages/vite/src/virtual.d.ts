declare module 'virtual:dete-routes' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const routes: import('./router.ts').IdentifiedRouteInfo[];
  export default routes;
}

declare module 'virtual:dete-ssr-manifest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const ssrManifest: import('./helpers/routes.ts').SSRManifest;
  export default ssrManifest;
}
