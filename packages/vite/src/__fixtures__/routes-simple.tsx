import "./style-1.css";

import Layout from "./layout";

export const routes = [
  {
    element: <Layout />, // simulate a pathless layout component
    children: [
      {
        path: "hello",
        children: [
          {
            path: "world",
          },
        ],
      },
    ],
  },
];
