import { Flex, Segmented, Space } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import TodoCard from "../TodoCard";
import { useEditOrder, useGetTodos } from "../../hooks/queries/useTodoQueries";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import type { Todo } from "../../types/types";
import { closestCenter } from "@dnd-kit/collision";
const TodoList = () => {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("card");

  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTodos();

  const todos = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const [items, setItems] = useState(todos);
  const renderedItems = items.length === todos.length ? items : todos;
  const editOrder = useEditOrder();

  const parentRef = useRef<HTMLDivElement>(null);
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
    return <p className="p-4">Loading todos...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Failed to load todos.</p>;
  }

  const Sortable = ({
    id,
    index,
    size,
    start,
    isLoader,
    todo,
  }: {
    id: string;
    index: number;
    size: number;
    start: number;
    isLoader: boolean;
    todo: Todo;
  }) => {
    const { ref } = useSortable({
      id,
      index,
      collisionDetector: closestCenter,
    });

    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${size}px`,
          transform: `translateY(${start}px)`,
        }}
      >
        {isLoader ? (
          hasNextPage ? (
            "Loading more..."
          ) : (
            "Nothing more to load"
          )
        ) : (
          <TodoCard todo={todo} />
        )}
      </div>
    );
  };
  // function handleDragEnd(event: DragEndEvent) {
  //   const { active, over } = event;

  //   if (!over || active.id === over.id) {
  //     return;
  //   }

  //   const activeTodo = todos.find(
  //     (todo) => String(todo.id) === String(active.id),
  //   );
  //   const overTodo = todos.find((todo) => String(todo.id) === String(over.id));

  //   if (!activeTodo || !overTodo) {
  //     return;
  //   }

  //   updateTodoOrder.mutate({
  //     id: activeTodo.id,
  //     order: overTodo.order,
  //   });
  // }
  return (
    <Space vertical className="p-4">
      <Flex justify="space-between" align="center">
        <Segmented
          options={[
            { label: "All Tasks", value: "all" },
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
          ]}
          value={filter}
          onChange={(value) => {
            setFilter(value);
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
      <DragDropProvider
        onDragEnd={(event) => {
          const { operation } = event;

          if (isSortableOperation(operation)) {
            const { source } = operation;

            if (!source) {
              return;
            }

            const sourceTodo = renderedItems[source.initialIndex];
            const targetTodo = renderedItems[source.index];

            if (!sourceTodo || !targetTodo || sourceTodo.id === targetTodo.id) {
              return;
            }

            console.log(sourceTodo.id, targetTodo.order);
            editOrder.mutate({
              id: sourceTodo.id,
              order: targetTodo.order,
            });
          }
        }}
      >
        <div
          style={{
            height: "550px",
            width: "100%",
            overflow: "auto",
          }}
          ref={parentRef}
        >
          <div
            style={{
              height: `${todoVitualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {todoVitualizer.getVirtualItems().map((virtualItem) => {
              const isLoader = virtualItem.index > todos.length - 1;
              const todo = renderedItems[virtualItem.index];

              if (!isLoader && !todo) {
                return null;
              }

              return isLoader ? (
                hasNextPage ? (
                  "Loading more..."
                ) : (
                  "Nothing more to load"
                )
              ) : (
                <Sortable
                  key={todo.id}
                  isLoader={isLoader}
                  id={todo.id}
                  index={virtualItem.index}
                  todo={todo}
                  size={virtualItem.size}
                  start={virtualItem.start}
                />
              );
            })}
          </div>
          {/* <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} ref={parentRef}>
          {todos.map((todo) => (
            <Col
              key={todo.id}
              className="gutter-row"
              xs={24}
              sm={12}
              md={6}
              lg={6}
              xl={6}
            >
              <TodoCard todo={todo} />
            </Col>
          ))}
        </Row> */}
        </div>
      </DragDropProvider>
      {/* {hasNextPage && (
        <Button
          loading={isFetchingNextPage}
          onClick={() => {
            void fetchNextPage();
          }}
        >
          Load more
        </Button>
      )} */}
    </Space>
  );
};

export default TodoList;
