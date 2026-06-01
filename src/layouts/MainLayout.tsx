import { Layout } from "antd";

import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const { Content } = Layout;
const MainLayout = () => {
  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header />
        <Content className="bg-white p-4 rounded-lg ">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
