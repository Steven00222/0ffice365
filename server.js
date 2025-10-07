const express = require('express');
const sgMail = require('@sendgrid/mail');

const app = express();
const port = 3000;

// Helper to visualize invisible characters
function showChars(str) {
  if (!str) return 'undefined';
  return str.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code === 32) return '[space]';
    if (code === 10) return '[LF]';
    if (code === 13) return '[CR]';
    return c;
  }).join('');
}

// Inspect environment variables
console.log('=== Environment Variables Inspection ===');
console.log('SENDGRID_API_KEY:', showChars(process.env.SENDGRID_API_KEY));
console.log('RECEIVER_EMAIL:', showChars(process.env.RECEIVER_EMAIL));

// Attempt to configure SendGrid only if variables appear correct
if (process.env.SENDGRID_API_KEY && process.env.RECEIVER_EMAIL) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configured.');
} else {
  console.warn('⚠️ SENDGRID_API_KEY or RECEIVER_EMAIL missing or invalid. Emails will not be sent.');
}

// Simple test route
app.get('/test', async (req, res) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.RECEIVER_EMAIL) {
    return res.send('⚠️ Cannot send test email: Env vars missing or invalid.');
  }

  try {
    await sgMail.send({
      to: process.env.RECEIVER_EMAIL,
      from: process.env.RECEIVER_EMAIL,
      subject: 'Railway Env Var Test',
      text: 'This is a test email to confirm environment variables.',
    });
    res.send('✅ Test email sent!');
  } catch (err) {
    console.error('SendGrid error:', err);
    res.send('❌ Test email failed. Check logs.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
