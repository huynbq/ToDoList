import { FileTextOutlined } from "@ant-design/icons";
import { Layout } from "antd";
const { Sider } = Layout;
import type { MenuProps } from "antd";
import { Menu } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "sub1",
    label: "Todo List",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "g1",
        label: "Item 1",
      },
      {
        key: "g2",
        label: "Item 2",
      },
    ],
  },
];

const Sidebar = () => {
  return (
    <Sider className="bg-stone-50">
      <Menu
        className="h-full bg-stone-50 border-none"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
      />
    </Sider>
  );
};

export default Sidebar;
