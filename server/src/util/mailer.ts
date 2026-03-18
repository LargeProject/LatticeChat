import nodemailer from 'nodemailer';
import { ENV } from "./env";

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: ENV.SENDGRID_API_KEY
  },
});

export default transporter;

const sendEmailOTP = async (receiverEmail: string, subject: string, otp: string, htmlCallback: (otp: string) => string) => {
  await transporter.sendMail({
    from: `"No Reply" <encrypt.lattice.chat@gmail.com>`,
    to: receiverEmail,
    subject: subject,
    html: htmlCallback(otp)
  });
}

const sendEmailVerificationOTP = async (receiverEmail: string, otp: string) => {
  sendEmailOTP(receiverEmail, otp, "Email Verification Code", otp => `<p>Verification Code: ${otp}</p>`);
}

const sendForgetPasswordOTP = async (receiverEmail: string, otp: string) => {
  sendEmailOTP(receiverEmail, otp, "Forgot Password Code", otp => `<p>Forgot Reset Code: ${otp}</p>`);
}

const sendDuplicateEmailNotification = async (receiverEmail: string) => {
  await transporter.sendMail({
    from: `"No Reply" <encrypt.lattice.chat@gmail.com>`,
    to: receiverEmail,
    subject: "Email Already In Use",
    html: `<p>This email is already in use.</p>`
  });
}

export {sendEmailOTP, sendEmailVerificationOTP, sendForgetPasswordOTP, sendDuplicateEmailNotification}