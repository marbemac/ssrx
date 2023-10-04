import { routes } from "./routes-lazy.tsx";

import blah from "/dx:routes.js";

const PORT = 3005;

console.log(`server-lazy.ts is running at http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch(req: Request) {
    return new Response(
      JSON.stringify({
        req: req.url,
        msg: "hello world",
        foo: blah,
        manifest: import.meta.env.SSR_MANIFEST,
      })
    );
  },
};
