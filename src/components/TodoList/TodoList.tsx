import { Flex, Segmented } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import TodoCard from "../TodoCard";
import { useEditOrder, useGetTodos } from "../../hooks/queries/useTodoQueries";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Todo } from "../../types/types";
type TodoStatusFilter = "all" | "completed" | "pending";

const TodoList = ({
  search,
  onEditTodo,
}: {
  search: string;
  onEditTodo: (todo: Todo) => void;
}) => {
  const [filter, setFilter] = useState<TodoStatusFilter>("all");
  const [view, setView] = useState("card");

  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTodos({ search, status: filter });

  const todos = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const [items, setItems] = useState(todos);
  const renderedItems = items.length === todos.length ? items : todos;
  const editOrder = useEditOrder();

  const parentRef = useRef<HTMLDivElement>(null);
  const draggedTodoIdRef = useRef<string | null>(null);
  const todoVitualizer = useVirtualizer({
    count: hasNextPage ? todos.length + 1 : todos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 10,
  });

  useEffect(() => {
    setItems(todos);
  }, [todos]);

  useEffect(() => {
    const [lastItem] = [...todoVitualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= todos.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    todos.length,
    isFetchingNextPage,
    todoVitualizer.getVirtualItems(),
  ]);

  if (isPending) {
    return <p className="p-4 flex-1 min-h-0">Loading todos...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500 flex-1 min-h-0">Failed to load todos.</p>;
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, todo: Todo) => {
    draggedTodoIdRef.current = todo.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", todo.id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetTodo: Todo) => {
    event.preventDefault();

    const sourceTodoId =
      draggedTodoIdRef.current || event.dataTransfer.getData("text/plain");

    if (!sourceTodoId || sourceTodoId === targetTodo.id) {
      return;
    }

    const sourceIndex = renderedItems.findIndex(
      (todo) => todo.id === sourceTodoId,
    );
    const targetIndex = renderedItems.findIndex(
      (todo) => todo.id === targetTodo.id,
    );

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const sourceTodo = renderedItems[sourceIndex];
    const nextItems = [...renderedItems];
    const [movedTodo] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, movedTodo);
    const movedIndex = nextItems.findIndex((todo) => todo.id === sourceTodo.id);
    const previousTodo = movedIndex > 0 ? nextItems[movedIndex - 1] : null;
    const nextTodo = movedIndex < nextItems.length - 1 ? nextItems[movedIndex + 1] : null;

    setItems(nextItems);
    draggedTodoIdRef.current = null;

    editOrder.mutate({
      id: sourceTodo.id,
      previousId: previousTodo?.id ?? null,
      nextId: nextTodo?.id ?? null,
    });
  };

  const TodoRow = ({
    size,
    start,
    todo,
  }: {
    size: number;
    start: number;
    todo: Todo;
  }) => {
    return (
      <div
        data-todo-id={todo.id}
        draggable
        onDragStart={(event) => handleDragStart(event, todo)}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={(event) => handleDrop(event, todo)}
        onDragEnd={() => {
          draggedTodoIdRef.current = null;
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${size}px`,
          transform: `translateY(${start}px)`,
          cursor: "grab",
        }}
      >
        <TodoCard todo={todo} onEdit={onEditTodo} />
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-4">
      <Flex justify="space-between" align="center" className="shrink-0">
        <Segmented
          options={[
            { label: "All Tasks", value: "all" },
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
          ]}
          value={filter}
          onChange={(value) => {
            setFilter(value as TodoStatusFilter);
          }}
        />
        <Segmented
          options={[
            { value: "card", icon: <AppstoreOutlined /> },
            { value: "list", icon: <BarsOutlined /> },
          ]}
          value={view}
          onChange={(value) => {
            setView(value);
          }}
        />
      </Flex>
      <div className="min-h-0 flex-1 w-full overflow-auto" ref={parentRef}>
        <div
          className="w-full relative"
          style={{ height: `${todoVitualizer.getTotalSize()}px` }}
        >
          {todoVitualizer.getVirtualItems().map((virtualItem) => {
            const isLoader = virtualItem.index > todos.length - 1;
            const todo = renderedItems[virtualItem.index];

            if (isLoader) {
              return (
                <div key="loader">
                  {hasNextPage ? "Loading more..." : "Nothing more to load"}
                </div>
              );
            }

            if (!todo) {
              return null;
            }

            return (
              <TodoRow
                key={todo.id}
                todo={todo}
                size={virtualItem.size}
                start={virtualItem.start}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
