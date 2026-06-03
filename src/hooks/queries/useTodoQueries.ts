import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { NOTIFICATION_KEYS, TODO_KEYS } from '../../constants/queryKeys';
import * as notificationApi from '../../api/notificationApi';
import * as todoApi from '../../api/todoApi';
import type {
  ReminderNotification,
  TodoPage,
  TodoStatus,
  TodoStatusFilter,
} from '../../types/types';

const statusAfterToggle = (todo: {
  status: TodoStatus;
  dueDateTime: string;
}) => {
  if (todo.status !== 'completed') {
    return 'completed';
  }

  return new Date(todo.dueDateTime).getTime() <= Date.now()
    ? 'overdue'
    : 'pending';
};

const isTodoListQuery = (queryKey: readonly unknown[]) => {
  const params = queryKey[1];

  return (
    queryKey[0] === TODO_KEYS.all[0] &&
    typeof params === 'object' &&
    params !== null &&
    'search' in params &&
    'status' in params
  );
};

// Feedback: can think about the way that all hooks (or hook use useQueryClient) to a single hook
// Then return the function at the end of the hook. But the TodoProxyProps can remove when we implement like this strategic

export const useGetTodos = ({
  search,
  status,
}: {
  search: string;
  status: TodoStatusFilter;
}) => {
  // Feedback: Can move the limit to props with default value is 10
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

// Feedback: Can move it to type folder or ./types in current path
interface TodoProxyProps {
  // Just an example, can change it to onDone or something
  // Cause I see the same logic after done with useCreateTodo & useEditTodo
  onSuccess?: () => void;
}

export const useCreateTodo = ({ onSuccess }: TodoProxyProps = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
      onSuccess?.();
    },
  });
};

export const useEditTodo = ({ onSuccess }: TodoProxyProps = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.editTodo,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: TODO_KEYS.detail(variables.id),
      });
      onSuccess?.();
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
                      status: statusAfterToggle(todo),
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

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread,
    queryFn: notificationApi.getUnreadNotifications,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread });
    },
  });
};

export const useAddRealtimeNotification = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (notification: ReminderNotification) => {
      queryClient.setQueryData<ReminderNotification[]>(
        NOTIFICATION_KEYS.unread,
        (current) => {
          if (!current) {
            return [notification];
          }

          if (current.some((item) => item.id === notification.id)) {
            return current;
          }

          return [notification, ...current];
        },
      );
    },
    [queryClient],
  );
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
