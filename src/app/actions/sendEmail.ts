'use server'

import nodemailer from 'nodemailer';

interface SendEmailState {
  success: boolean;
  message?: string;
}

export async function sendEmail(formData: FormData): Promise<SendEmailState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { success: false, message: 'Chybí povinné údaje.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT), 
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, 
      greetingTimeout: 5000,    
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, 
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Nová zpráva z webu od: ${name}`,
      text: message,
      html: `
        <h3>Nová zpráva z kontaktního formuláře</h3>
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Zpráva:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
          ${message.replace(/\n/g, '<br>')}
        </blockquote>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (error) {
    console.error('Chyba při odesílání emailu:', error);
    return { success: false, message: 'Odeslání selhalo. Zkuste to prosím později.' };
  }
}