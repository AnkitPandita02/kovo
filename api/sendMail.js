import nodemailer from "nodemailer";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false, // MUST disable for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const busboy = Busboy({ headers: req.headers });
  let formData = {};
  let fileBuffer = null;
  let fileName = "";

  busboy.on("file", (name, file, info) => {
    fileName = info.filename;
    const chunks = [];

    file.on("data", (chunk) => {
      chunks.push(chunk);
    });

    file.on("end", () => {
      fileBuffer = Buffer.concat(chunks);
    });
  });

  busboy.on("field", (fieldname, val) => {
    formData[fieldname] = val;
  });

  busboy.on("finish", async () => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_USER,
        subject: "New Career Form Submission",
        html: `
          <h2>New Submission</h2>
          <p><b>Name:</b> ${formData.name}</p>
          <p><b>Phone:</b> ${formData.phone}</p>
          <p><b>Email:</b> ${formData.email}</p>
          <p><b>Role:</b> ${formData.role}</p>
          <p><b>Why Join:</b> ${formData.whyJoin}</p>
        `,
        attachments: fileBuffer
          ? [
              {
                filename: fileName,
                content: fileBuffer,
              },
            ]
          : [],
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Email Error:", err);
      res.status(500).json({ success: false });
    }
  });

  req.pipe(busboy);
}
