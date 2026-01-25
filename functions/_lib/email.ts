import type { Env } from "../_types";
import { getAppUrl, getEmailFrom } from "./config";

async function sendEmail(env: Env, payload: Record<string, unknown>): Promise<void> {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error: ${details}`);
  }
}

export async function sendVerificationEmail(
  request: Request,
  env: Env,
  email: string,
  token: string
): Promise<void> {
  const appUrl = getAppUrl(request, env);
  const verifyUrl = `${appUrl}/#/verify?token=${encodeURIComponent(token)}`;
  const from = getEmailFrom(env);
  await sendEmail(env, {
    from,
    to: [email],
    subject: "验证你的 AgentVerse 邮箱",
    html: `<p>请点击以下链接完成邮箱验证：</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    text: `请打开以下链接完成邮箱验证：${verifyUrl}`,
  });
}

export async function sendResetPasswordEmail(
  request: Request,
  env: Env,
  email: string,
  token: string
): Promise<void> {
  const appUrl = getAppUrl(request, env);
  const resetUrl = `${appUrl}/#/reset?token=${encodeURIComponent(token)}`;
  const from = getEmailFrom(env);
  await sendEmail(env, {
    from,
    to: [email],
    subject: "重置你的 AgentVerse 密码",
    html: `<p>请点击以下链接重置密码：</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    text: `请打开以下链接重置密码：${resetUrl}`,
  });
}
