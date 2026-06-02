import dayjs from "dayjs";

export const formatHour = (dateTime: string) => {
  const date = dayjs(dateTime);
  return date.format("HH:mm");
};

export const formatDateTime = (dateTime: string) => {
  const date = dayjs(dateTime);
  return date.format("YYYY-MM-DD HH:mm");
};
