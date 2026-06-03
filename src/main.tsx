import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StyleProvider layer>
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </StyleProvider>,
);
