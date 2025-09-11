import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';

interface VehicleRequest {
  nip?: string | null;
  email: string;
  name: string;
  mobile_number: string;
  date: string;
  startDateTime: string;
  endDateTime: string;
  destination: string;
  vehicleName: string;
  vehiclePlate: string;
}


export async function sendConfirmationEmail(request: VehicleRequest) {
  const templateEmail = fs.readFileSync(`${process.cwd()}/public/approved.html`, 'utf-8');
  const renderTemplate = handlebars.compile(templateEmail);
  const content = renderTemplate({
    nip: request.nip || '',
    name: request.name,
    mobile_number: request.mobile_number,
    date: request.date,
    destination: request.destination,
    vehicleName: request.vehicleName,
    startDateTime: request.startDateTime,
    endDateTime: request.endDateTime,
    vehiclePlate: request.vehiclePlate,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    return await transporter.sendMail({
      from: `"TAMVEMS" <super_admin@tamvems.id>`,
      to: request.email,
      replyTo: 'super_admin@tamvems.id',
      subject: 'Pengajuan Kendaraan - Disetujui',
      html: content
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send confirmation email');
  }
} 