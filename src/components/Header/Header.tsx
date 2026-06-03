import { Button, Flex, Layout, Space, Typography } from "antd";
import NotificationButton from "./NotificationButton/NotificationButton";
import { useAuth } from "../../auth/AuthContext";
const { Header } = Layout;
const HeaderComponent = () => {
  const auth = useAuth();

  return (
    <Header className="bg-stone-50 px-4 shrink-0">
      <Flex className="h-full items-center justify-between">
        <div className="text-xl font-bold">My TodoList</div>
        <Space>
          <Typography.Text type="secondary">{auth.user?.email}</Typography.Text>
          <NotificationButton />
          <Button onClick={() => auth.signOut()}>Sign out</Button>
        </Space>
      </Flex>
    </Header>
  );
};

export default HeaderComponent;
