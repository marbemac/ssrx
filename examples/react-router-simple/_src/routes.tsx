import "./routes.css";

import type { RouteObject } from "react-router-dom";

import { RootLayout } from "./layouts/root.tsx";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () => import("./pages/home.tsx"),
      },
      // {
      //   path: "about",
      //   element: <About />,
      // },
      // {
      //   path: "dashboard",
      //   loader: dashboardLoader,
      //   element: <Dashboard />,
      // },
      // {
      //   path: "lazy",
      //   lazy: () => import("./routes/lazy.tsx"),
      // },
      // {
      //   path: "redirect",
      //   loader: redirectLoader,
      // },
      // {
      //   path: "*",
      //   element: <NoMatch />,
      // },
    ],
  },
];
