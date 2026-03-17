import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  },
});

export default transporter;

const sendVerificationEmail = async (receiverEmail: string, url: string) => {
  await transporter.sendMail({
    from: `"No Reply" <encrypt.lattice.chat@gmail.com>`,
    to: receiverEmail,
    subject: "Verify Email",
    html: `<p>Verify Email: <a href="${url}">Click Here</a> </p>`
  });
}

const sendDuplicateEmail = async (receiverEmail: string) => {
  await transporter.sendMail({
    from: `"No Reply" <encrypt.lattice.chat@gmail.com>`,
    to: receiverEmail,
    subject: "Email Already In Use",
    html: `<p>This email is already in use.</p>`
  });
}

export {sendVerificationEmail, sendDuplicateEmail}

