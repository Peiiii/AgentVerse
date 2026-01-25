import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AuthShell } from "../components/auth-shell";
import { useAuth } from "@/core/hooks/use-auth";

type VerifyStatus = "idle" | "loading" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("缺少验证令牌，请重新获取验证邮件");
      return;
    }
    let canceled = false;
    const run = async () => {
      setStatus("loading");
      const result = await verifyEmail(token);
      if (canceled) {
        return;
      }
      if (result.ok) {
        setStatus("success");
        setMessage("邮箱验证成功，欢迎使用 AgentVerse");
      } else {
        setStatus("error");
        setMessage(result.error || "验证失败，请稍后再试");
      }
    };
    void run();
    return () => {
      canceled = true;
    };
  }, [token, verifyEmail]);

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>邮箱验证</CardTitle>
          <CardDescription>完成验证后即可进入应用</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <Alert className="mb-4">
              <AlertTitle>处理中</AlertTitle>
              <AlertDescription>正在验证，请稍候...</AlertDescription>
            </Alert>
          )}
          {status === "success" && (
            <Alert className="mb-4">
              <AlertTitle>验证成功</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>验证失败</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/chat", { replace: true })} disabled={status === "loading"}>
              进入应用
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline text-center">
              返回登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
