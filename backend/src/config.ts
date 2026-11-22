import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/hive',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key',
  QR_SECRET: process.env.QR_SECRET || 'super_secret_qr_signing_key',

  // Email (SMTP) — used to deliver passes to members. If SMTP_HOST is unset,
  // the app runs in a no-send dev mode (logs instead of sending) so the pass
  // flow still completes locally without email credentials.
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'M3HFIL <no-reply@m3hfil.local>',

  // GCS bucket for event images (flyers/covers). Not a secret — bucket names
  // are public. If unset, image uploads are disabled and the API returns a
  // clear error, but everything else works.
  GCS_EVENT_IMAGES_BUCKET: process.env.GCS_EVENT_IMAGES_BUCKET || '',
};
