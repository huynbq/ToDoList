import { Col, Flex, Row, Segmented, Space } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useState } from "react";
import TodoCard from "../TodoCard";
import type { Todo } from "../../types/types";

const todoData: Todo[] = [
  {
    id: 1,
    title: "Buy groceries",
    description: "Milk, Bread, Eggs, Butter",
    status: "pending",
    dueDateTime: "2024-06-30T12:00:00",
    startDateTime: "2024-06-28T10:00:00",
    color: "#d1e7fd",
  },
  {
    id: 2,
    title: "Finish project report",
    description: "Complete the final report for the project",
    status: "completed",
    dueDateTime: "2024-06-25T12:00:00",
    startDateTime: "2024-06-20T10:00:00",
    color: "#fff1d6",
  },
];

const TodoList = () => {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("card");
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
      <div>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          {todoData.map((todo) => (
            <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={6}>
              <TodoCard key={todo.id} todo={todo} />
            </Col>
          ))}
        </Row>
      </div>
    </Space>
  );
};

export default TodoList;
