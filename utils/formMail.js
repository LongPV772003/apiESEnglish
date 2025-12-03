// emailTemplates.js

export const templates = {
  register: (code) => `
    <div style="font-family: Arial, sans-serif; background-color: #f6f8fb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); padding: 30px;">
        <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="color: #4A3AFF; margin: 0;">ES English</h1>
          <p style="color: #888; font-size: 14px; margin-top: 5px;">Chào mừng bạn đến với ES English!</p>
        </div>

        <p style="font-size: 16px; color: #333;">Xin chào,</p>
        <p style="font-size: 16px; color: #333;">
          Cảm ơn bạn đã đăng ký tài khoản tại <b>ES English</b>.  
          Dưới đây là mã xác minh của bạn:
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #4A3AFF; letter-spacing: 4px;">${code}</span>
        </div>

        <p style="font-size: 14px; color: #555;">Mã này sẽ hết hạn sau <b>5 phút</b>.</p>

        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px; text-align: center; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} ES English.
        </div>
      </div>
    </div>
  `,

  resetPassword: (code) => `
    <div style="font-family: Arial, sans-serif; background-color: #f6f8fb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); padding: 30px;">
        <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="color: #FF6B00; margin: 0;">ES English</h1>
          <p style="color: #888; font-size: 14px; margin-top: 5px;">Khôi phục mật khẩu</p>
        </div>

        <p style="font-size: 16px; color: #333;">Xin chào,</p>
        <p style="font-size: 16px; color: #333;">
          Bạn đã yêu cầu <b>lấy lại mật khẩu</b> tại ES English.  
          Đây là mã xác nhận của bạn:
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #FF6B00; letter-spacing: 4px;">${code}</span>
        </div>

        <p style="font-size: 14px; color: #555;">Mã này sẽ hết hạn sau <b>5 phút</b>.  
        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>

        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px; text-align: center; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} ES English.
        </div>
      </div>
    </div>
  `
};
