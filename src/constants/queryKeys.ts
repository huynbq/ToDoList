export const TODO_KEYS = {
  all: ["todos"],
  list: (params: { search: string; status: string }) => ["todos", params],
  detail: (id: string) => ["todos", id],
};
