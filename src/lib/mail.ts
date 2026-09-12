import nodemailer from "nodemailer";

type MailPayload = { to: string; subject: string; html: string; text: string };

let transporter: nodemailer.Transporter | null | undefined;

// SMTP genérico a propósito: todavía no se eligió proveedor (Resend, SMTP
// propio, lo que sea), así que solo lee host/usuario/clave por variable de
// entorno. Sin SMTP_HOST configurado, loguea el email en vez de fallar,
// para poder probar el flujo (magic link, etc.) sin depender de eso.
function getTransporter() {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) {
    transporter = null;
    return transporter;
  }
  const port = Number(SMTP_PORT ?? 587);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }: MailPayload) {
  const t = getTransporter();
  if (!t) {
    console.log(
      `[mail] SMTP no configurado todavía, no se envió nada.\nPara: ${to}\nAsunto: ${subject}\n\n${text}`
    );
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@localhost";
  await t.sendMail({ from, to, subject, html, text });
}
