export type Todo = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
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

export type TodoCreateRequest = Omit<Todo, "id" | "order" | "reminderSent" | "reminderSentAt"> & {
  order?: number;
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
