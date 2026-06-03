import axios from "axios";
import { BASE_URL } from "../constants/api";
import type { Todo, TodoCreateRequest, TodoPage, TodoResponse } from "../types/types";

export const getTodos = async ({
  limit = 10,
  offset = 0,
  search = "",
  status = "all",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: "all" | "completed" | "pending";
}): Promise<TodoPage> => {
  const { data } = await axios.get<TodoPage>(BASE_URL + "/todos", {
    params: {
      limit,
      offset,
      search,
      status,
    },
  });
  return data;
};

export const createTodo = async (newTodo: TodoCreateRequest): Promise<Todo> => {
  const { data } = await axios.post<TodoResponse>(BASE_URL + "/todos", newTodo);
  return data.data;
};

export const editTodo = async (editTodo: Todo): Promise<Todo> => {
  const { data } = await axios.put<TodoResponse>(
    `${BASE_URL}/todos/${editTodo.id}`,
    editTodo,
  );
  return data.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  const { data } = await axios.delete<void>(`${BASE_URL}/todos/${id}`);
  return data;
};

export const toggleStatus = async (id: string): Promise<Todo> => {
  const { data } = await axios.patch<TodoResponse>(
    `${BASE_URL}/todos/${id}/toggle-status`,
  );
  return data.data;
};

export const editOrder = async ({
  id,
  previousId,
  nextId,
}: {
  id: string;
  previousId?: string | null;
  nextId?: string | null;
}): Promise<Todo> => {
  const { data } = await axios.patch<TodoResponse>(`${BASE_URL}/todos/${id}/reorder`, {
    previousId,
    nextId,
  });
  return data.data;
};
