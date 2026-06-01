import { lazy } from "react";

const Todo = lazy(() => import("./Todo"));

export default [
  {
    path: "/todos",
    component: Todo,
    index: true,
  },
];
