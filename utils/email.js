import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // example for Gmail
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAILJS_MY_EMAIL, // your email
        pass: process.env.EMAILJS_MY_EMAIL_PW,   // app password from Gmail
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: '"Media Store" <youremail@gmail.com>',
            to,
            subject,
            html,
        });
        console.log("Email sent to", to);
        return true;
    } catch (error) {
        console.error("Email error:", error);
        return false;
    }
};
