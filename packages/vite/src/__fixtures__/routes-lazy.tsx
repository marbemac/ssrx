import "./style-1.css";

import Layout from "./layout";

export const routes = [
  {
    element: <Layout />, // simulate a pathless layout component
    children: [
      {
        path: "hello",
      },

      {
        path: "todos",
        lazy: () => import("./lazy/todos.tsx"),
        children: [
          {
            path: ":todoId",
            lazy: () => import("./lazy/todo.tsx"),
            children: [
              {
                path: "history",
              },
            ],
          },

          {
            path: "bulk-edit",
          },
        ],
      },
    ],
  },
];
