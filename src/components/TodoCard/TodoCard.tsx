import { EllipsisOutlined } from "@ant-design/icons";
import { Card, Checkbox, Flex, Dropdown, Modal, Tag } from "antd";
import type { MenuProps } from "antd";
import { formatDateTime } from "../../utils/format";
import type { Todo } from "../../types/types";
import {
  useDeleteTodo,
  useToggleStatus,
} from "../../hooks/queries/useTodoQueries";

type TodoCardProps = {
  todo: Todo;
  onEdit: (todo: Todo) => void;
};

const cardActions: MenuProps["items"] = [
  {
    label: "Edit",
    key: "0",
  },
  {
    label: "Delete",
    danger: true,
    key: "1",
  },
];

const CardTitle = ({ todo }: { todo: Todo }) => {
  const toggleStatus = useToggleStatus();
  const isCompleted = todo.status === "completed";

  return (
    <Checkbox
      checked={isCompleted}
      disabled={toggleStatus.isPending}
      onChange={(event) => {
        event.stopPropagation();
        toggleStatus.mutate(todo.id);
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <h3 className="text-md font-bold">
        {isCompleted ? <s>{todo.title}</s> : todo.title}
      </h3>
    </Checkbox>
  );
};

const CardActions = ({ todo, onEdit }: TodoCardProps) => {
  const deleteTodo = useDeleteTodo();

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();

    if (key === "0") {
      onEdit(todo);
      return;
    }

    if (key === "1") {
      Modal.confirm({
        title: "Delete task?",
        content: `This will delete "${todo.title}".`,
        okText: "Delete",
        okButtonProps: { danger: true },
        onOk: () => deleteTodo.mutateAsync(todo.id),
      });
    }
  };

  return (
    <Dropdown
      menu={{ items: cardActions, onClick: handleMenuClick }}
      trigger={["click"]}
    >
      <EllipsisOutlined
        className="text-lg font-bold"
        onClick={(event) => event.stopPropagation()}
      />
    </Dropdown>
  );
};

const TodoCard = ({ todo, onEdit }: TodoCardProps) => {
  return (
    <Card
      classNames={{
        body: "p-2",
      }}
      styles={{
        root: {
          backgroundColor: todo.color,
        },
      }}
    >
      <Flex vertical gap={8}>
        <Flex justify="space-between" align="center">
          <CardTitle todo={todo} />
          <Flex align="center" gap={8}>
            {todo.status === "overdue" ? <Tag color="error">Overdue</Tag> : null}
            <CardActions todo={todo} onEdit={onEdit} />
          </Flex>
        </Flex>
        <p className="text-sm text-stone-500">{todo.description}</p>
        <p className="text-sm text-stone-800 font-semibold">
          {formatDateTime(todo.startDateTime)} to{" "}
          {formatDateTime(todo.dueDateTime)}
        </p>
        {todo.reminderDateTime ? (
          <p className="text-xs text-stone-700">
            Reminder: {formatDateTime(todo.reminderDateTime)}
          </p>
        ) : null}
      </Flex>
    </Card>
  );
};

export default TodoCard;
