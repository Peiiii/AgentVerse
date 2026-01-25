import { Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/login-page";
import { VerifyEmailPage } from "../pages/verify-email-page";
import { ForgotPasswordPage } from "../pages/forgot-password-page";
import { ResetPasswordPage } from "../pages/reset-password-page";

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
    </Routes>
  );
}
