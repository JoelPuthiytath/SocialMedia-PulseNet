import Mailgen from "mailgen";
import { createMailTransporter } from "../utils/createMailTransporter.js";

const recoveryMail = async (req, res) => {
  try {
    const { userName, userEmail, text, subject } = req.body;
    console.log(process.env.NODEMAILER_EMAIL, "<====Main Email");
    console.log(process.env.NODEMAILER_PASSWORD, "<====Main Password");
    console.log(req.body, "<=== mailSender");

    let transporter = createMailTransporter();

    let MailGenerator = new Mailgen({
      theme: process.env.MAILGEN_THEME,
      product: {
        name: process.env.MAILGEN_PRODUCT_NAME,
        link: process.env.MAILGEN_PRODUCT_LINK,
      },
    });

    let response = {
      body: {
        name: userName,
        intro:
          text ||
          `Welcome to PulseNet! We're very excited to have you on board.`,
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    let mail = await MailGenerator.generate(response);

    let message = {
      from: process.env.NODEMAILER_EMAIL,
      to: userEmail,
      subject: subject || "Password recovery mail",
      html: mail,
    };
    transporter
      .sendMail(message)
      .then(() => {
        return res.status(201).json({
          msg: "you should receive an email from us",
          success: true,
        });
      })
      .catch((error) => {
        return res.status(500).json({ error: "error in sending mail", error });
      });
  } catch (error) {
    return res.status(500).json({ error: "full error" });
  }
};

const verificationMail = async (user) => {
  try {
    console.log(user.emailToken);
    console.log(process.env.CLIENT_URL);
    let transporter = createMailTransporter();

    let MailGenerator = new Mailgen({
      theme: process.env.MAILGEN_THEME,
      product: {
        name: process.env.MAILGEN_PRODUCT_NAME,
        link: process.env.MAILGEN_PRODUCT_LINK,
      },
    });
    const verifyLink = `<a href="${process.env.CLIENT_URL}/login-profile?emailToken=${user.emailToken}">Verify Email</a>`;

    let response = {
      body: {
        name: user.userName,
        intro: `Welcome to PulseNet! We're very excited to have you on board.
          verify your email by cliking this link ${verifyLink}`,
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    let mail = await MailGenerator.generate(response);

    let message = {
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "verify your email...",
      html: mail,
    };
    transporter
      .sendMail(message)
      .then(() => {
        return { msg: "you should receive an email from us" };
      })
      .catch((error) => {
        return { error: "error in sending mail" };
      });
  } catch (error) {
    console.log(error);
  }
};
export { verificationMail, recoveryMail };
