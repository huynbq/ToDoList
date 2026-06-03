export type Todo = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  dueDateTime: string;
  startDateTime: string;
  color: string;
  order: number;
};

export type TodoPage = {
  data: Todo[];
  nextOffset?: number | null;
};

export type TodoResponse = {
  data: Todo;
};
