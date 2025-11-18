import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const { name, phone, email, whyJoin } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER, // admin@kovointernational.com
        pass: process.env.MAIL_PASS, // GoDaddy email password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER,
      subject: "New Career Form Submission",
      html: `
        <h2>New Submission</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Why Join Kovo:</b> ${whyJoin}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("Email Error:", error);
    return res.status(500).json({ success: false });
  }
}
