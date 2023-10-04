import { routes } from "./routes-lazy.tsx";

export const clientEntry = () => {
  // simulate "window" being accessed in the client entry, which is common
  // @ts-expect-error ignore
  if (window.foo === "bar") {
    console.log("window!", routes);
  }

  return "hello";
};

clientEntry();
