import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { TODO_KEYS } from "../../constants/queryKeys";
import * as todoApi from "../../api/todoApi";
import type { TodoPage } from "../../types/types";

const isTodoListQuery = (queryKey: readonly unknown[]) => {
  const params = queryKey[1];

  return (
    queryKey[0] === TODO_KEYS.all[0] &&
    typeof params === "object" &&
    params !== null &&
    "search" in params &&
    "status" in params
  );
};

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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODO_KEYS.all });

      const previousLists = queryClient.getQueriesData<InfiniteData<TodoPage>>({
        queryKey: TODO_KEYS.all,
        predicate: (query) => isTodoListQuery(query.queryKey),
      });

      queryClient.setQueriesData<InfiniteData<TodoPage>>(
        {
          queryKey: TODO_KEYS.all,
          predicate: (query) => isTodoListQuery(query.queryKey),
        },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              data: page.data.map((todo) =>
                todo.id === id
                  ? {
                      ...todo,
                      status: todo.status === "completed" ? "pending" : "completed",
                    }
                  : todo,
              ),
            })),
          };
        },
      );

      return { previousLists };
    },
    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (todo, id) => {
      queryClient.setQueryData(TODO_KEYS.detail(id), todo);
    },
    onSettled: (_todo, _error, id) => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: TODO_KEYS.detail(id),
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
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
    },
  });
};
