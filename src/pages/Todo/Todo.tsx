import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Space, Button, Flex, Modal, Form, Select, DatePicker } from "antd";
import TodoList from "../../components/TodoList";
import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { Todo } from "../../types/types";
import { useCreateTodo, useEditTodo } from "../../hooks/queries/useTodoQueries";

type TodoFormValues = {
  title: string;
  description: string;
  status: "pending" | "completed";
  startDateTime: Dayjs;
  dueDateTime: Dayjs;
  color: string;
};

const TodoPage = () => {
  const [form] = Form.useForm<TodoFormValues>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const createTodo = useCreateTodo();
  const editTodo = useEditTodo();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  const openCreateModal = () => {
    setEditingTodo(null);
    form.setFieldsValue({
      title: "",
      description: "",
      status: "pending",
      startDateTime: dayjs(),
      dueDateTime: dayjs().add(1, "day"),
      color: "#3b82f6",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      status: todo.status,
      startDateTime: dayjs(todo.startDateTime),
      dueDateTime: dayjs(todo.dueDateTime),
      color: todo.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      title: values.title,
      description: values.description,
      status: values.status,
      startDateTime: values.startDateTime.toISOString(),
      dueDateTime: values.dueDateTime.toISOString(),
      color: values.color,
      ...(editingTodo ? { order: editingTodo.order } : {}),
    };

    if (editingTodo) {
      await editTodo.mutateAsync({ ...editingTodo, ...payload });
    } else {
      await createTodo.mutateAsync(payload);
    }

    setIsModalOpen(false);
    form.resetFields();
  };

  const isSubmitting = createTodo.isPending || editTodo.isPending;

  return (
    <Flex vertical className="h-full min-h-0">
      <Flex
        justify="flex-end"
        align="center"
        className="p-4 border-b-stone-200 border-b shrink-0"
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
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Task
          </Button>
        </Space>
      </Flex>
      <TodoList search={debouncedSearch} onEditTodo={openEditModal} />
      <Modal
        title={editingTodo ? "Edit Task" : "Add Task"}
        open={isModalOpen}
        okText={editingTodo ? "Save" : "Create"}
        confirmLoading={isSubmitting}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Pending", value: "pending" },
                { label: "Completed", value: "completed" },
              ]}
            />
          </Form.Item>
          <Form.Item name="startDateTime" label="Start" rules={[{ required: true }]}>
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="dueDateTime" label="Due" rules={[{ required: true }]}>
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="color" label="Color" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Red", value: "#ef4444" },
                { label: "Orange", value: "#f97316" },
                { label: "Yellow", value: "#f59e0b" },
                { label: "Green", value: "#22c55e" },
                { label: "Teal", value: "#14b8a6" },
                { label: "Blue", value: "#3b82f6" },
                { label: "Purple", value: "#8b5cf6" },
                { label: "Pink", value: "#ec4899" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default TodoPage;
