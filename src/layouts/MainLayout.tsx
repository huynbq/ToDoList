import { Layout } from "antd";

import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const { Content } = Layout;
const MainLayout = () => {
  return (
    <Layout>
      <Sidebar />
      <Layout className="bg-stone-50">
        <Header />
        <Content className="bg-white rounded-xl m-2">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
