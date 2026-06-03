import { Badge, Button, Empty, List, notification, Popover, Space, Typography } from "antd";
import { BellFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import {
  useAddRealtimeNotification,
  useMarkNotificationRead,
  useUnreadNotifications,
} from "../../../hooks/queries/useTodoQueries";
import { formatDateTime } from "../../../utils/format";
import type { ReminderNotification } from "../../../types/types";

type RealtimeReminderNotification = {
  id: string;
  user_id: string;
  todo_id: string;
  title: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
};

const toReminderNotification = (notification: RealtimeReminderNotification): ReminderNotification => ({
  id: notification.id,
  userId: notification.user_id,
  todoId: notification.todo_id,
  title: notification.title,
  message: notification.message,
  readAt: notification.read_at,
  createdAt: notification.created_at,
});

const NotificationButton = () => {
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const shownNotificationIdsRef = useRef(new Set<string>());
  const notifications = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const addRealtimeNotification = useAddRealtimeNotification();
  const unreadNotifications = notifications.data ?? [];

  useEffect(() => {
    let removeChannel: (() => void) | undefined;

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;

      if (!userId) {
        return;
      }

      const channel = supabase
        .channel(`reminder-notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "reminder_notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newNotification = toReminderNotification(payload.new as RealtimeReminderNotification);

            addRealtimeNotification(newNotification);

            if (shownNotificationIdsRef.current.has(newNotification.id)) {
              return;
            }

            shownNotificationIdsRef.current.add(newNotification.id);
            notificationApi.info({
              message: newNotification.title,
              description: newNotification.message || "Reminder is due now.",
              placement: "topRight",
            });
          },
        )
        .subscribe();

      removeChannel = () => {
        supabase.removeChannel(channel);
      };
    });

    return () => {
      removeChannel?.();
    };
  }, [addRealtimeNotification, notificationApi]);

  const content = unreadNotifications.length ? (
    <List
      className="w-80"
      dataSource={unreadNotifications}
      renderItem={(notification) => (
        <List.Item
          actions={[
            <Button
              key="dismiss"
              size="small"
              type="link"
              loading={markRead.isPending}
              onClick={() => markRead.mutate(notification.id)}
            >
              Dismiss
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={notification.title}
            description={
              <Space direction="vertical" size={0}>
                {notification.message ? (
                  <Typography.Text type="secondary">
                    {notification.message}
                  </Typography.Text>
                ) : null}
                <Typography.Text type="warning">
                  Reminder: {formatDateTime(notification.createdAt)}
                </Typography.Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  ) : (
    <Empty className="w-72" description="No reminders due" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );

  return (
    <>
      {notificationContextHolder}
      <Popover content={content} title="Due reminders" trigger="click" placement="bottomRight">
        <Tooltip title="Notifications">
          <Badge count={unreadNotifications.length} size="small">
            <Button
              type="primary"
              shape="circle"
              icon={<BellFilled />}
              loading={notifications.isFetching && !notifications.data}
            />
          </Badge>
        </Tooltip>
      </Popover>
    </>
  );
};

export default NotificationButton;
