import sendgridMailer from '@sendgrid/mail';
import { ENV } from './env';

sendgridMailer.setApiKey(ENV.SENDGRID_API_KEY);

const sendEmailVerificationOTP = async (receiverEmail: string, otp: string) => {
  sendEmailOTP(receiverEmail, 'Email Verification Code', otp, (otp) => `<p>Verification Code: ${otp}</p>`);
};

const sendForgetPasswordOTP = async (receiverEmail: string, otp: string) => {
  sendEmailOTP(receiverEmail, 'Forgot Password Code', otp, (otp) => `<p>Forgot Reset Code: ${otp}</p>`);
};

const sendEmailOTP = async (
  receiverEmail: string,
  subject: string,
  otp: string,
  htmlCallback: (otp: string) => string,
) => {
  sendgridMailer.send({
    from: `"No Reply" <lattice@cop4331site.com>`,
    to: receiverEmail,
    subject: subject,
    html: htmlCallback(otp),
  });
};

const sendDuplicateEmailNotification = async (receiverEmail: string) => {
  sendgridMailer.send({
    from: `"No Reply" <lattice@cop4331site.com>`,
    to: receiverEmail,
    subject: 'Email Already In Use',
    html: `<p>This email is already in use.</p>`,
  });
};

export { sendEmailOTP, sendEmailVerificationOTP, sendForgetPasswordOTP, sendDuplicateEmailNotification };
