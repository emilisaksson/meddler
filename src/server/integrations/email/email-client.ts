import nodemailer, { type Transporter } from 'nodemailer';
import { appConfig } from '../../app-config';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: appConfig.email.host,
      port: appConfig.email.port,
      secure: appConfig.email.secure,
      auth: {
        user: appConfig.email.user,
        pass: appConfig.email.pass
      }
    });
  }

  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  await getTransporter().sendMail({
    from: appConfig.email.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });
}
