import { Empty, Flex, Segmented, Skeleton, Spin } from "antd";
import {
  HolderOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import TodoCard from "../TodoCard";
import { useEditOrder, useGetTodos } from "../../hooks/queries/useTodoQueries";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Todo, TodoStatusFilter } from "../../types/types";

type DropPosition = "before" | "after";

const TodoList = ({
  search,
  onEditTodo,
}: {
  search: string;
  onEditTodo: (todo: Todo) => void;
  }) => {
  const [filter, setFilter] = useState<TodoStatusFilter>("all");

  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTodos({ search, status: filter });

  const todos = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const [items, setItems] = useState(todos);
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
  const [dragOverTodoId, setDragOverTodoId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>("before");
  const renderedItems = items.length === todos.length ? items : todos;
  const editOrder = useEditOrder();

  const parentRef = useRef<HTMLDivElement>(null);
  const draggedTodoIdRef = useRef<string | null>(null);
  const dragOverTodoIdRef = useRef<string | null>(null);
  const dropPositionRef = useRef<DropPosition>("before");
  const todoVitualizer = useVirtualizer({
    count: hasNextPage ? todos.length + 1 : todos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
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

  const clearDragState = () => {
    draggedTodoIdRef.current = null;
    dragOverTodoIdRef.current = null;
    dropPositionRef.current = "before";
    setDraggedTodoId(null);
    setDragOverTodoId(null);
    setDropPosition("before");
  };

  const reorderTodo = (
    sourceTodoId: string | null,
    targetTodoId: string | null,
    position: DropPosition,
  ) => {
    if (!sourceTodoId || !targetTodoId || sourceTodoId === targetTodoId) {
      clearDragState();
      return;
    }

    const sourceIndex = renderedItems.findIndex(
      (todo) => todo.id === sourceTodoId,
    );
    const targetIndex = renderedItems.findIndex(
      (todo) => todo.id === targetTodoId,
    );

    if (sourceIndex === -1 || targetIndex === -1) {
      clearDragState();
      return;
    }

    const sourceTodo = renderedItems[sourceIndex];
    const nextItems = [...renderedItems];
    const [movedTodo] = nextItems.splice(sourceIndex, 1);
    const insertIndex = targetIndex + (position === "after" ? 1 : 0);
    const adjustedInsertIndex = sourceIndex < insertIndex ? insertIndex - 1 : insertIndex;

    if (sourceIndex === adjustedInsertIndex) {
      clearDragState();
      return;
    }

    nextItems.splice(adjustedInsertIndex, 0, movedTodo);
    const movedIndex = nextItems.findIndex((todo) => todo.id === sourceTodo.id);
    const previousTodo = movedIndex > 0 ? nextItems[movedIndex - 1] : null;
    const nextTodo =
      movedIndex < nextItems.length - 1 ? nextItems[movedIndex + 1] : null;

    setItems(nextItems);
    clearDragState();

    editOrder.mutate({
      id: sourceTodo.id,
      previousId: previousTodo?.id ?? null,
      nextId: nextTodo?.id ?? null,
    });
  };

  const startPointerDrag = (todo: Todo) => {
    draggedTodoIdRef.current = todo.id;
    dragOverTodoIdRef.current = null;
    dropPositionRef.current = "before";
    setDraggedTodoId(todo.id);
    setDragOverTodoId(null);
    setDropPosition("before");
  };

  useEffect(() => {
    if (!draggedTodoId) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const handlePointerMove = (event: PointerEvent) => {
      const scrollElement = parentRef.current;

      if (scrollElement) {
        const rect = scrollElement.getBoundingClientRect();
        const edgeSize = 48;

        if (event.clientY < rect.top + edgeSize) {
          scrollElement.scrollTop -= 12;
        } else if (event.clientY > rect.bottom - edgeSize) {
          scrollElement.scrollTop += 12;
        }
      }

      const targetElement = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const targetRow = targetElement?.closest("[data-todo-id]") as
        | HTMLElement
        | null;
      const targetTodoId = targetRow?.dataset.todoId ?? null;

      if (!targetRow || !targetTodoId || targetTodoId === draggedTodoIdRef.current) {
        dragOverTodoIdRef.current = null;
        setDragOverTodoId(null);
        return;
      }

      const rowRect = targetRow.getBoundingClientRect();
      const nextPosition =
        event.clientY < rowRect.top + rowRect.height / 2 ? "before" : "after";

      dragOverTodoIdRef.current = targetTodoId;
      dropPositionRef.current = nextPosition;
      setDragOverTodoId(targetTodoId);
      setDropPosition(nextPosition);
    };

    const handlePointerUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      reorderTodo(
        draggedTodoIdRef.current,
        dragOverTodoIdRef.current,
        dropPositionRef.current,
      );
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    window.addEventListener("pointercancel", clearDragState, { once: true });

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", clearDragState);
    };
  }, [draggedTodoId, renderedItems]);

  const TodoRow = ({
    index,
    start,
    todo,
  }: {
    index: number;
    start: number;
    todo: Todo;
  }) => {
    const isDragging = draggedTodoId === todo.id;
    const isDropTarget = dragOverTodoId === todo.id && !isDragging;
    const lineStyle =
      dropPosition === "before"
        ? { top: "-5px" }
        : { bottom: "5px" };

    return (
      <div
        ref={todoVitualizer.measureElement}
        data-index={index}
        data-todo-id={todo.id}
        className="relative"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${start}px)`,
        }}
      >
        {isDropTarget ? (
          <div
            className="pointer-events-none absolute left-10 right-2 z-20 flex items-center"
            style={lineStyle}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm" />
            <span className="h-0.5 flex-1 rounded-full bg-blue-500 shadow-sm" />
          </div>
        ) : null}
        <div
          className={`group flex gap-2 pb-2 transition duration-150 ease-out ${
            isDragging ? "scale-[0.98] opacity-35" : ""
          }`}
        >
          <div
            className={`flex w-8 shrink-0 items-stretch justify-center rounded-xl border border-dashed bg-white/80 transition ${
              isDragging
                ? "border-blue-300 text-blue-500 opacity-100"
                : "border-stone-200 text-stone-400 opacity-60 group-hover:opacity-100"
            }`}
          >
            <div
              role="button"
              aria-label={`Drag ${todo.title}`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                startPointerDrag(todo);
              }}
              className="flex h-full w-full cursor-grab items-center justify-center rounded-xl text-lg active:cursor-grabbing"
            >
              <HolderOutlined />
            </div>
          </div>
          <div className="min-w-0 flex-1 rounded-xl transition">
            <TodoCard todo={todo} onEdit={onEditTodo} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-4">
      <Flex align="center" className="shrink-0">
        <Segmented
          options={[
            { label: "All Tasks", value: "all" },
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
            { label: "Overdue", value: "overdue" },
          ]}
          value={filter}
          onChange={(value) => {
            setFilter(value as TodoStatusFilter);
          }}
        />
      </Flex>
      <div
        className="min-h-0 flex-1 w-full overflow-auto"
        ref={parentRef}
      >
        {isPending ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton.Node
                key={index}
                active
                className="h-24 w-full rounded-lg!"
              />
            ))}
          </div>
        ) : error ? (
          <p className="p-4 text-red-500">Failed to load todos.</p>
        ) : todos.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Empty
              description={
                search || filter !== "all"
                  ? "No tasks match your filters"
                  : "No tasks yet"
              }
            />
          </div>
        ) : (
          <div
            className="w-full relative"
            style={{ height: `${todoVitualizer.getTotalSize()}px` }}
          >
            {todoVitualizer.getVirtualItems().map((virtualItem) => {
              const isLoader = virtualItem.index > todos.length - 1;
              const todo = renderedItems[virtualItem.index];

              if (isLoader) {
                return (
                  <div
                    key="loader"
                    ref={todoVitualizer.measureElement}
                    data-index={virtualItem.index}
                    className="flex h-20 items-center justify-center"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {hasNextPage ? <Spin /> : null}
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
                  index={virtualItem.index}
                  start={virtualItem.start}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
