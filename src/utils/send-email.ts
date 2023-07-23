import * as nodemailer from 'nodemailer';

// Function to send the confirmation email with default body
export async function sendConfirmationEmail(
  recipientEmail: string,
  subject: string,
  body = ' ',
): Promise<void> {
  // Configure the transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    // Send the confirmation email
    await transporter.sendMail({
      from: 'test@gmail.com',
      to: recipientEmail,
      subject: subject,
      html: body,
    });
    console.log('Confirmation email sent');
  } catch (error) {
    console.error('Error sending confirmation email', error);
    throw new Error('Failed to send confirmation email');
  }
}
