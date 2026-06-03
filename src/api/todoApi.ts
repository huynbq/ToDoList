import { apiClient } from "./http";
import type { Todo, TodoCreateRequest, TodoPage, TodoResponse, TodoStatusFilter, TodoUpdateRequest } from "../types/types";

export const getTodos = async ({
  limit = 10,
  offset = 0,
  search = "",
  status = "all",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: TodoStatusFilter;
}): Promise<TodoPage> => {
  const { data } = await apiClient.get<TodoPage>("/todos", {
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
  const { data } = await apiClient.post<TodoResponse>("/todos", newTodo);
  return data.data;
};

export const editTodo = async (editTodo: TodoUpdateRequest): Promise<Todo> => {
  const { data } = await apiClient.put<TodoResponse>(
    `/todos/${editTodo.id}`,
    editTodo,
  );
  return data.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  const { data } = await apiClient.delete<void>(`/todos/${id}`);
  return data;
};

export const toggleStatus = async (id: string): Promise<Todo> => {
  const { data } = await apiClient.patch<TodoResponse>(
    `/todos/${id}/toggle-status`,
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
  const { data } = await apiClient.patch<TodoResponse>(`/todos/${id}/reorder`, {
    previousId,
    nextId,
  });
  return data.data;
};
