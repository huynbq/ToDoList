import axios from "axios";
import { BASE_URL } from "../constants/api";
import type { Todo, TodoPage } from "../types/types";

export const getTodos = async ({
  limit = 10,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
}): Promise<TodoPage> => {
  const { data } = await axios.get<TodoPage>(BASE_URL + "/todos", {
    params: {
      limit,
      offset,
    },
  });
  return data;
};

export const createTodo = async (newTodo: Omit<Todo, "id">): Promise<Todo> => {
  const { data } = await axios.post<Todo>(BASE_URL + "/todos", newTodo);
  return data;
};

export const editTodo = async (editTodo: Todo): Promise<Todo> => {
  const { data } = await axios.put<Todo>(
    `${BASE_URL}/todos/${editTodo.id}`,
    editTodo,
  );
  return data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  const { data } = await axios.delete<void>(`${BASE_URL}/todos/${id}`);
  return data;
};

export const toggleStatus = async (id: string): Promise<Todo> => {
  const { data } = await axios.patch<Todo>(
    `${BASE_URL}/todos/${id}/toggle-status`,
  );
  return data;
};

export const editOrder = async ({
  id,
  order,
}: {
  id: string;
  order: number;
}): Promise<Todo> => {
  const { data } = await axios.patch<Todo>(`${BASE_URL}/todos/${id}/order`, {
    order: order,
  });
  return data;
};
