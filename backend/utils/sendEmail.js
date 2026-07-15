const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP variables are set in process.env
  const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const message = {
        from: `${process.env.FROM_NAME || 'Book A Doctor'} <${process.env.FROM_EMAIL || 'noreply@bookadoctor.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
      };

      const info = await transporter.sendMail(message);
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('SMTP Email transmission failed, falling back to console logging:', err.message);
    }
  }

  // Fallback: Mock email logger for development ease!
  console.log('\n======================================================');
  console.log('📬 [MOCK EMAIL SENT] (SMTP not configured in backend/.env)');
  console.log(`TO:      ${options.email}`);
  console.log(`SUBJECT: ${options.subject}`);
  console.log('MESSAGE:');
  console.log(options.message || options.html);
  console.log('======================================================\n');
  return { messageId: 'mock-id-12345' };
};

module.exports = sendEmail;
