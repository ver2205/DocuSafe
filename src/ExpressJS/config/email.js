require('dotenv').config();

const nodemailer = require('nodemailer');

console.log('[EMAIL.JS] Host:', process.env.SMTP_HOST);

module.exports = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
