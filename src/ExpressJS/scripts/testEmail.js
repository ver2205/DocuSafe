require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

const transporter = require('../config/email');

transporter
  .sendMail({
    from: process.env.FROM_EMAIL,
    to: 'veronija.kodovska@student.um.si',
    subject: ' Test iz DocuSafe',
    text: 'To je preizkusno sporočilo iz DocuSafe.',
    html: '<p>Če to vidiš, email deluje 🎉</p>',
  })
  .then(() => {
    console.log(' E-mail uspešno poslan!');
  })
  .catch((err) => {
    console.error('Napaka pri pošiljanju:', err);
  });
