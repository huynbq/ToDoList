import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Space, Button, Flex } from "antd";
import TodoList from "../../components/TodoList";
const Todo = () => {
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
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Add Task
          </Button>
        </Space>
      </Flex>
      <TodoList />
    </Flex>
  );
};

export default Todo;
