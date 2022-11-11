const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    // this.firstName = user.name.split(" ")[0];
    this.firstName = user.name;

    this.url = url;
    this.from = `Zeeshan Arshad <${process.env.EMAIL_FROM}>`;
    // this.from = `Zeeshan Arshad <zeshanarshad28@gmail.com>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(subject, template) {
    console.log("in send()....");

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: template,
    };
    // 3)Creat a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    // console.log("innnnnnnnnnnnnnnn");
    await this.send(
      "Account Created",
      "Congratulations your account is created successfully!"
    );
  }

  async sendPasswordReset(a, b) {
    await this.send(a, b);
  }
};
