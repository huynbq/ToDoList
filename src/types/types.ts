export type TodoStatus = "pending" | "overdue" | "completed";
export type TodoWriteStatus = "pending" | "completed";
export type TodoStatusFilter = "all" | TodoStatus;

export type Todo = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  dueDateTime: string;
  startDateTime: string;
  reminderDateTime: string | null;
  reminderSent: boolean;
  reminderSentAt: string | null;
  color: string;
  order: number;
};

export type TodoPage = {
  data: Todo[];
  nextOffset?: number | null;
};

export type TodoCreateRequest = Omit<Todo, "id" | "order" | "status" | "reminderSent" | "reminderSentAt"> & {
  order?: number;
  status: TodoWriteStatus;
};

export type TodoUpdateRequest = TodoCreateRequest & {
  id: string;
};

export type TodoResponse = {
  data: Todo;
};

export type TodosResponse = {
  data: Todo[];
};

export type ReminderNotification = {
  id: string;
  userId: string;
  todoId: string;
  title: string;
  message: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ReminderNotificationResponse = {
  data: ReminderNotification;
};

export type ReminderNotificationsResponse = {
  data: ReminderNotification[];
};
