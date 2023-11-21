import nodemailer from "nodemailer"

const createMailTransporter=()=>{
    let config = {
        service: "gmail",
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      };
  
      let transporter = nodemailer.createTransport(config);
      return transporter
}
export{createMailTransporter}