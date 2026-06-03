import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Space, Button, Flex, Modal, Form, Select, DatePicker, ColorPicker } from "antd";
import TodoList from "../../components/TodoList";
import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { Todo, TodoWriteStatus } from "../../types/types";
import { useCreateTodo, useEditTodo } from "../../hooks/queries/useTodoQueries";

type TodoFormValues = {
  title: string;
  description: string;
  status?: TodoWriteStatus;
  startDateTime: Dayjs;
  dueDateTime: Dayjs;
  reminderDateTime?: Dayjs | null;
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
      reminderDateTime: null,
      color: "#3b82f6",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      status: todo.status === "overdue" ? "pending" : todo.status,
      startDateTime: dayjs(todo.startDateTime),
      dueDateTime: dayjs(todo.dueDateTime),
      reminderDateTime: todo.reminderDateTime ? dayjs(todo.reminderDateTime) : null,
      color: todo.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const status: TodoWriteStatus = editingTodo
      ? values.status ?? (editingTodo.status === "completed" ? "completed" : "pending")
      : "pending";
    const payload = {
      title: values.title,
      description: values.description,
      status,
      startDateTime: values.startDateTime.toISOString(),
      dueDateTime: values.dueDateTime.toISOString(),
      reminderDateTime: values.reminderDateTime?.toISOString() ?? null,
      color: values.color,
      ...(editingTodo ? { order: editingTodo.order } : {}),
    };

    if (editingTodo) {
      await editTodo.mutateAsync({ id: editingTodo.id, ...payload });
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
          {editingTodo ? (
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Completed", value: "completed" },
                ]}
              />
            </Form.Item>
          ) : null}
          <Flex gap={12}>
            <Form.Item
              name="startDateTime"
              label="Start"
              rules={[{ required: true }]}
              className="flex-1"
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
            <Form.Item
              name="dueDateTime"
              label="Due"
              rules={[{ required: true }]}
              className="flex-1"
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </Flex>
          <Flex gap={12} align="flex-start">
            <Form.Item name="reminderDateTime" label="Reminder" className="flex-1">
              <DatePicker showTime allowClear className="w-full" />
            </Form.Item>
            <Form.Item
              name="color"
              label="Color"
              rules={[{ required: true }]}
              getValueFromEvent={(color) => color.toHexString()}
              className="flex-1"
            >
              <ColorPicker
                showText={(color) => color.toHexString()}
                disabledAlpha
                format="hex"
              />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
    </Flex>
  );
};

export default TodoPage;
