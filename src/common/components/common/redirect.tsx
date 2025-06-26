import { Navigate } from "react-router-dom";

// 重定向到聊天页面的组件
export const RedirectToChat = () => <Navigate to="/chat" replace />;

// 通用的重定向组件
export const Redirect = ({ to }: { to: string }) => <Navigate to={to} replace />; 