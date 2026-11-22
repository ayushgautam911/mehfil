import nodemailer, { type Transporter } from 'nodemailer';
import QRCode from 'qrcode';
import { config } from './config.js';

// Email is "configured" only when an SMTP host is provided. Otherwise the app
// runs in a no-send dev mode (logs the would-be email) so the pass flow still
// completes locally without credentials.
export const emailConfigured = Boolean(config.SMTP_HOST);

let transporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!emailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export interface PassEmailInput {
  to: string;
  memberName: string;
  qrPayload: string; // "<qrToken>:<qrSignature>" — what the door scanner reads
  event: { name: string; date: string; time: string; venue: string };
}

export interface PassEmailResult {
  configured: boolean;
  sent: boolean;
  error?: string;
}

export async function sendPassEmail(input: PassEmailInput): Promise<PassEmailResult> {
  const { to, memberName, qrPayload, event } = input;

  // Short, human-friendly reference derived from the secure token.
  const ref = qrPayload.split(':')[0].slice(0, 8).toUpperCase();
  const subject = `your pass for ${event.name}`;

  let qrBuffer: Buffer;
  try {
    qrBuffer = await QRCode.toBuffer(qrPayload, {
      type: 'png',
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#00ff41', light: '#000000' },
    });
  } catch (err: any) {
    return { configured: emailConfigured, sent: false, error: `qr_generation_failed: ${err?.message || err}` };
  }

  const { html, text } = renderPassEmail({ memberName, event, ref });

  const tx = getTransporter();
  if (!tx) {
    // Dev mode: no SMTP configured. Log instead of sending so the flow completes.
    console.log(`[email] SMTP not configured — would send pass "${subject}" to ${to} (ref ${ref}).`);
    return { configured: false, sent: false };
  }

  try {
    await tx.sendMail({
      from: config.MAIL_FROM,
      to,
      subject,
      text,
      html,
      attachments: [{ filename: 'm3hfil-pass-qr.png', content: qrBuffer, cid: 'passqr' }],
    });
    return { configured: true, sent: true };
  } catch (err: any) {
    console.error('[email] Failed to send pass email:', err?.message || err);
    return { configured: true, sent: false, error: err?.message || String(err) };
  }
}

export function renderPassEmail({
  memberName,
  event,
  ref,
}: {
  memberName: string;
  event: { name: string; date: string; time: string; venue: string };
  ref: string;
}): { html: string; text: string } {
  const when = `${event.date} · ${event.time}`;
  const name = (memberName || '').replace(/^@/, '');

  const text = [
    `you're in${name ? `, ${name}` : ''}.`,
    ``,
    `${event.name}`,
    `${when}`,
    `${event.venue}`,
    ``,
    `Your entry pass is attached as a QR code — present it at the door.`,
    `Pass reference: ${ref}`,
    ``,
    `This pass admits one. It's non-transferable and can only be scanned once.`,
    ``,
    `— M3HFIL`,
  ].join('\n');

  // Inline-styled HTML for broad email-client support. Dark, phosphor-green brand.
  // bgcolor attributes + color-scheme meta keep it dark in clients (Gmail, Outlook)
  // that strip <body>/<html> backgrounds or force a light default.
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
  </head>
  <body style="margin:0;padding:0;background:#000000;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background:#000000;">
      <tr>
        <td align="center" bgcolor="#000000" style="padding:32px 16px;background:#000000;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0d0d0d" style="max-width:480px;background:#0d0d0d;border:1px solid #1a1a1a;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
                <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:18px;letter-spacing:6px;color:#e8e8e8;">M<span style="color:#00ff41;">3</span>HFIL</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#00ff41;">[ Approved Pass ]</p>
                <h1 style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:22px;letter-spacing:1px;color:#e8e8e8;text-transform:uppercase;">${escapeHtml(event.name)}</h1>
                <p style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#606060;">${escapeHtml(when)} &nbsp;·&nbsp; ${escapeHtml(event.venue)}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:8px 0 16px;">
                      <img src="cid:passqr" alt="Entry QR code" width="240" height="240" style="display:block;border:1px solid #1a1a1a;background:#000000;" />
                      <p style="margin:12px 0 0;font-family:'SF Mono',Menlo,monospace;font-size:13px;letter-spacing:2px;color:#00ff41;">REF ${escapeHtml(ref)}</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:16px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.6;color:#606060;">
                  Present this QR code at the door. It admits one, is non-transferable, and can only be scanned once.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #1a1a1a;">
                <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#333333;">PRIVATE EVENT · CURATED ACCESS</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface CustomEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendCustomEmail(input: CustomEmailInput): Promise<PassEmailResult> {
  const { to, subject, html, text } = input;
  const tx = getTransporter();
  if (!tx) {
    console.log(`[email] SMTP not configured — would send custom email "${subject}" to ${to}.`);
    return { configured: false, sent: false };
  }
  try {
    await tx.sendMail({
      from: config.MAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    return { configured: true, sent: true };
  } catch (err: any) {
    console.error('[email] Failed to send custom email:', err?.message || err);
    return { configured: true, sent: false, error: err?.message || String(err) };
  }
}

