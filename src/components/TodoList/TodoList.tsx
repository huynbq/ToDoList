import { Button, Col, Flex, Row, Segmented, Space } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import TodoCard from "../TodoCard";
import { useGetTodos } from "../../hooks/queries/useTodoQueries";
import { useVirtualizer } from "@tanstack/react-virtual";

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

  const todos = data?.pages.flatMap((page) => page.data) ?? [];

  const parentRef = useRef<HTMLDivElement>(null);

  const todoVitualizer = useVirtualizer({
    count: hasNextPage ? todos.length + 1 : todos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 10,
  });

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
      <div
        ref={parentRef}
        style={{
          height: "550px",
          width: "100%",
          overflow: "auto",
        }}
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
            const todo = todos[virtualItem.index];

            return (
              <div
                key={virtualItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
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
