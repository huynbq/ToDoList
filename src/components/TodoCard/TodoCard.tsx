import { EllipsisOutlined } from '@ant-design/icons';
import { Card, Checkbox, Flex, Dropdown, Modal, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { formatDateTime } from '../../utils/format';
import type { Todo } from '../../types/types';
import {
  useDeleteTodo,
  useToggleStatus,
} from '../../hooks/queries/useTodoQueries';

type TodoCardProps = {
  todo: Todo;
  onEdit: (todo: Todo) => void;
};

// Feedback: Key should be enum for reuse below with check if condition
const cardActions: MenuProps['items'] = [
  {
    label: 'Edit',
    key: '0',
  },
  {
    label: 'Delete',
    danger: true,
    key: '1',
  },
];

const CardTitle = ({ todo }: { todo: Todo }) => {
  const toggleStatus = useToggleStatus();
  const isCompleted = todo.status === 'completed';

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
      <h3 className='text-md font-bold'>
        {isCompleted ? <s>{todo.title}</s> : todo.title}
      </h3>
    </Checkbox>
  );
};

const CardActions = ({ todo, onEdit }: TodoCardProps) => {
  const deleteTodo = useDeleteTodo();

  const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
    domEvent.stopPropagation();

    if (key === '0') {
      onEdit(todo);
      return;
    }

    if (key === '1') {
      Modal.confirm({
        title: 'Delete task?',
        content: `This will delete "${todo.title}".`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        onOk: () => deleteTodo.mutateAsync(todo.id),
      });
    }
  };

  return (
    <Dropdown
      menu={{ items: cardActions, onClick: handleMenuClick }}
      trigger={['click']}
    >
      <EllipsisOutlined
        className='text-lg font-bold'
        onClick={(event) => event.stopPropagation()}
      />
    </Dropdown>
  );
};

const TodoCard = ({ todo, onEdit }: TodoCardProps) => {
  const {
    color,
    status,
    description,
    startDateTime,
    dueDateTime,
    reminderDateTime,
  } = todo;

  return (
    <Card
      classNames={{
        body: 'p-2',
      }}
      styles={{
        root: {
          backgroundColor: color,
        },
      }}
    >
      <Flex vertical gap={8}>
        <Flex justify='space-between' align='center'>
          <CardTitle todo={todo} />
          <Flex align='center' gap={8}>
            {status === 'overdue' ? <Tag color='error'>Overdue</Tag> : null}
            <CardActions todo={todo} onEdit={onEdit} />
          </Flex>
        </Flex>
        <p className='text-sm text-stone-500'>{description}</p>
        <p className='text-sm text-stone-800 font-semibold'>
          {formatDateTime(startDateTime)} to {formatDateTime(dueDateTime)}
        </p>
        {reminderDateTime ? (
          <p className='text-xs text-stone-700'>
            Reminder: {formatDateTime(reminderDateTime)}
          </p>
        ) : null}
      </Flex>
    </Card>
  );
};

export default TodoCard;
