import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { TODO_KEYS } from "../../constants/queryKeys";
import * as todoApi from "../../api/todoApi";

export const useGetTodos = ({
  search,
  status,
}: {
  search: string;
  status: "all" | "completed" | "pending";
}) => {
  const limit = 10;

  return useInfiniteQuery({
    queryKey: TODO_KEYS.list({ search, status }),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      todoApi.getTodos({ limit, offset: pageParam, search, status }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.nextOffset !== null && lastPage.nextOffset !== undefined) {
        return lastPage.nextOffset;
      }

      if (lastPage.data.length < limit) return undefined;

      return allPages.length * limit;
    },
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
    },
  });
};

export const useEditTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.editTodo,
    onSuccess: (_, varibles) => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: TODO_KEYS.detail(varibles.id),
      });
    },
  });
};

export const useToggleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.toggleStatus,
    onSuccess: (_, varibles) => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: TODO_KEYS.detail(varibles),
      });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
    },
  });
};

export const useEditOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.editOrder,
    onSuccess: (todo) => {
      queryClient.setQueryData(TODO_KEYS.detail(todo.id), todo);
    },
  });
};
