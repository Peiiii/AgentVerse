import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AuthShell } from "../components/auth-shell";
import { useAuth } from "@/core/hooks/use-auth";

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.ok) {
      setInfo("如果该邮箱已注册，我们已发送重置邮件");
      return;
    }
    setError(result.error || "发送失败，请稍后再试");
  };

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>输入邮箱后我们会发送重置链接</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>发送失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {info && (
            <Alert className="mb-4">
              <AlertTitle>已发送</AlertTitle>
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">邮箱</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "正在发送..." : "发送重置邮件"}
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
