const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

sgMail.send({
  to: "lakaganth89@gmail.com",
  from: "lakakiru@gmail.com",
  subject: "Thsi is my test email",
  text: "I hope you received this email",
});
