import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerifyCode(email, code) {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f6f8fb; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); padding: 30px;">
      <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="color: #4A3AFF; margin: 0;">ES English</h1>
        <p style="color: #888; font-size: 14px; margin-top: 5px;">Học tiếng Anh dễ dàng hơn mỗi ngày</p>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào,</p>
      <p style="font-size: 16px; color: #333;">
        Cảm ơn bạn đã đăng ký tài khoản tại <b>ES English</b>.  
        Dưới đây là mã xác minh của bạn:
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 24px; font-weight: bold; color: #4A3AFF; letter-spacing: 4px;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #555;">Mã này sẽ hết hạn sau <b>10 phút</b>.  
        Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px; text-align: center; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} ES English.  
        Mọi thắc mắc vui lòng liên hệ <a href="mailto:contact.work.esenglish@gmail.com" style="color: #4A3AFF; text-decoration: none;">contact.work.esenglish@gmail.com</a>.
      </div>
    </div>
  </div>
  `;

  await mailer.sendMail({
    from: `"ES English" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🔐 Xác nhận đăng ký tài khoản ES English",
    html,
  });
}
