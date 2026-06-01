import { Badge, Button } from "antd";
import { BellFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
const NotificationButton = () => {
  return (
    <Tooltip title="Notifications">
      <Badge dot>
        <Button type="primary" shape="circle" icon={<BellFilled />} />
      </Badge>
    </Tooltip>
  );
};

export default NotificationButton;
