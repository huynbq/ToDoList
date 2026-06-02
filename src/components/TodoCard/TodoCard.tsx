import { EllipsisOutlined } from "@ant-design/icons";
import { Card, Checkbox, Flex, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { formatDateTime } from "../../utils/format";
import type { Todo } from "../../types/types";

type TodoCardProps = {
  todo: Todo;
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

const CardTitle = ({
  title,
  status,
}: {
  title: string;
  status: "pending" | "completed";
}) => {
  return (
    <Checkbox checked={status === "completed"}>
      <h3 className="text-md font-bold">
        {status === "completed" ? <s>{title}</s> : title}
      </h3>
    </Checkbox>
  );
};

const CardActions = () => {
  return (
    <Dropdown menu={{ items: cardActions }} trigger={["click"]}>
      <EllipsisOutlined className="text-lg font-bold" />
    </Dropdown>
  );
};

const TodoCard = ({ todo }: TodoCardProps) => {
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
          <CardTitle title={todo.title} status={todo.status} />
          <CardActions />
        </Flex>
        <p className="text-sm text-stone-500">{todo.description}</p>
        <p className="text-sm text-stone-800 font-semibold">
          {formatDateTime(todo.startDateTime)} to{" "}
          {formatDateTime(todo.dueDateTime)}
        </p>
      </Flex>
    </Card>
  );
};

export default TodoCard;
