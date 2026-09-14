import nodemailer from "nodemailer";
import "dotenv/config";


async function sendMail(sendTo , subject , text , html) {
  
  console.log(process.env.MY_GMAIL_ACCOUNT);
  console.log(process.env.MY_GMAIL_ACCOUNT_PASSWORD);
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.MY_GMAIL_ACCOUNT,
      pass: process.env.MY_GMAIL_ACCOUNT_PASSWORD
    },
  });

let mailOptions = {
  from: '"BruteForce Reminders" <trybruteforcedev@gmail.com>',
  to: sendTo,
  subject: subject || "Your Daily DSA Reminder", 
  text: text || "It is time to review your saved problems.",
  html: html || undefined,
};

  let info = await transporter.sendMail(mailOptions);``
  
  console.log("Message sent: %s", info.messageId);

  return info;
}

export {sendMail};