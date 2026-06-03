import { Button, Card, Form, Input, Typography, message } from "antd";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./useAuth";

type AuthFormValues = {
  email: string;
  password: string;
};

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  if (auth.loading) {
    return <div className="grid h-svh place-items-center">Loading...</div>;
  }

  if (auth.session) {
    return children;
  }

  const handleSubmit = async (values: AuthFormValues) => {
    setSubmitting(true);

    try {
      if (mode === "signin") {
        await auth.signIn(values.email, values.password);
        navigate("/todos", { replace: true });
      } else {
        await auth.signUp(values.email, values.password);
        message.success("Account created. Check your email if confirmation is enabled.");
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid h-svh place-items-center bg-stone-100 px-4">
      <Card className="w-full max-w-sm">
        <Typography.Title level={3} className="text-center">
          {mode === "signin" ? "Sign in" : "Create account"}
        </Typography.Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}> 
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}> 
            <Input.Password autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </Form>
        <Button
          type="link"
          block
          className="mt-2"
          onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Button>
      </Card>
    </div>
  );
};
