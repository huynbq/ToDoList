import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Space, Button, Flex } from "antd";
import TodoList from "../../components/TodoList";
import { useEffect, useState } from "react";
const Todo = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  return (
    <Flex vertical>
      <Flex
        justify="flex-end"
        align="center"
        className="p-4 border-b-stone-200 border-b"
      >
        <Space>
          <Input
            placeholder="Search Tasks"
            allowClear
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Add Task
          </Button>
        </Space>
      </Flex>
      <TodoList search={debouncedSearch} />
    </Flex>
  );
};

export default Todo;
