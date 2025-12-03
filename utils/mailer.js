import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { templates } from "./formMail.js";
dotenv.config();

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerifyCode(email, code, type = "register") {
  const template = templates[type];

  if (!template) throw new Error("Invalid email template type");

  const subject =
    type === "register"
      ? "Xác nhận đăng ký tài khoản ES English"
      : "Mã xác thực đặt lại mật khẩu ES English";

  await mailer.sendMail({
    from: `"ES English" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: template(code),
  });
}
