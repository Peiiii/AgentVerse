import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AuthShell } from "../components/auth-shell";
import { useAuth } from "@/core/hooks/use-auth";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!token) {
      setError("缺少重置令牌，请重新发起重置");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (result.ok) {
      setInfo("密码已更新，即将进入应用");
      setTimeout(() => {
        navigate("/chat", { replace: true });
      }, 800);
      return;
    }
    setError(result.error || "重置失败，请稍后再试");
  };

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>设置新密码</CardTitle>
          <CardDescription>请输入新密码并确认</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>重置失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {info && (
            <Alert className="mb-4">
              <AlertTitle>完成</AlertTitle>
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "正在更新..." : "确认重置"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              返回登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
