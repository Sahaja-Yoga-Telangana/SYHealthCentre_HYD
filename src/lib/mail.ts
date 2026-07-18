import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || 'sahajogtelangana@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'luhfliropgpddybm',
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<string | null> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sahaja Yoga Telangana <sahajogtelangana@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    });
    return info?.messageId || null;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};
