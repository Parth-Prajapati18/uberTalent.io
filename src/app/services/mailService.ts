const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');

const testOptions = {
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
};

const transporter = nodemailer.createTransport((process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) ?
  testOptions :
  nodemailerSendgrid({ apiKey: process.env.SENDGRID_API_KEY })
);

export const mailService = {
    async  sendMail(data: any) {
      try {
        console.log('Sending email...', data.to, data.subject);
        await transporter.sendMail(data);
        console.log('Email sent');
      } catch (err) {
        console.error(err);
      }
    },
}