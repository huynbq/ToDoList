import { Flex, Layout, Space } from "antd";
import NotificationButton from "./NotificationButton/NotificationButton";
const { Header } = Layout;
const HeaderComponent = () => {
  return (
    <Header className="bg-stone-50 px-4 shrink-0">
      <Flex className="h-full items-center justify-between">
        <div className="text-xl font-bold">My App</div>
        <Space>
          <NotificationButton />
        </Space>
      </Flex>
    </Header>
  );
};

export default HeaderComponent;
