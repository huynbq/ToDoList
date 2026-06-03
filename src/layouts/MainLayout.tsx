import { Layout } from "antd";

import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const { Content } = Layout;
const MainLayout = () => {
  return (
    <Layout className="h-svh overflow-hidden">
      <Layout className="bg-stone-50 min-w-0">
        <Header />
        <Content className="bg-white rounded-xl m-2 min-h-0 overflow-hidden">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
