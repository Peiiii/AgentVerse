import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AuthShell } from "../components/auth-shell";
import { useAuth } from "@/core/hooks/use-auth";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/chat";
  const navigate = useNavigate();
  const { login, register, resendVerification } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginInfo, setLoginInfo] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerInfo, setRegisterInfo] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginInfo(null);
    setNeedsVerify(false);
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.ok) {
      navigate(redirect, { replace: true });
      return;
    }
    if (result.code === "email_not_verified") {
      setNeedsVerify(true);
    }
    setLoginError(result.error || "登录失败，请稍后再试");
  };

  const handleResend = async () => {
    if (!loginEmail) {
      setLoginError("请输入邮箱后再发送验证邮件");
      return;
    }
    setLoginLoading(true);
    const result = await resendVerification(loginEmail);
    setLoginLoading(false);
    if (result.ok) {
      setLoginInfo("验证邮件已发送，请查收");
      return;
    }
    setLoginError(result.error || "发送失败，请稍后再试");
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    setRegisterInfo(null);
    if (registerPassword !== registerConfirm) {
      setRegisterError("两次输入的密码不一致");
      return;
    }
    setRegisterLoading(true);
    const result = await register(registerEmail, registerPassword);
    setRegisterLoading(false);
    if (result.ok) {
      setRegisterInfo("验证邮件已发送，请前往邮箱完成验证");
      return;
    }
    setRegisterError(result.error || "注册失败，请稍后再试");
  };

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>欢迎使用 AgentVerse</CardTitle>
          <CardDescription>登录或注册后即可发布与使用 Bot</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>登录失败</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              {loginInfo && (
                <Alert className="mb-4">
                  <AlertTitle>提示</AlertTitle>
                  <AlertDescription>{loginInfo}</AlertDescription>
                </Alert>
              )}
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">邮箱</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Link to="/forgot" className="text-primary hover:underline">
                    忘记密码？
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "正在登录..." : "登录"}
                </Button>
                {needsVerify && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={loginLoading}
                  >
                    重新发送验证邮件
                  </Button>
                )}
              </form>
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              {registerError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>注册失败</AlertTitle>
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
              {registerInfo && (
                <Alert className="mb-4">
                  <AlertTitle>提示</AlertTitle>
                  <AlertDescription>{registerInfo}</AlertDescription>
                </Alert>
              )}
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-email">邮箱</Label>
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">密码</Label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">确认密码</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={registerConfirm}
                    onChange={(event) => setRegisterConfirm(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={registerLoading}>
                  {registerLoading ? "正在注册..." : "注册并发送验证邮件"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
