import dayjs from 'dayjs';

// Feedback: Can Upgrade like this if we have many format type
const formatDate =
  (format: 'HH:mm' | 'HH:mm DD-MM-YYYY') => (dateTime: string) => {
    const date = dayjs(dateTime);
    return date.format(format);
  };

const newFormatHour = formatDate("HH:mm");
const newFormatDateTime = formatDate("HH:mm DD-MM-YYYY");

export const formatHour = (dateTime: string) => {
  const date = dayjs(dateTime);
  return date.format('HH:mm');
};

export const formatDateTime = (dateTime: string) => {
  const date = dayjs(dateTime);
  return date.format('HH:mm DD-MM-YYYY');
};
