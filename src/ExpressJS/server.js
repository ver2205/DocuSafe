const express = require('express');
const cors = require('cors');
const app = express();
const webpush = require('web-push');
const cron = require('node-cron');
const { exec } = require('child_process');

require('dotenv').config();

cron.schedule('0 9 * * *', () => {
  exec('node scripts/checkReminders.js', (err, stdout, stderr) => {
    console.log('checkReminders.js zagnan ob', new Date().toLocaleString());
    if (err) return console.error('Napaka pri pošiljanju opomnikov:', err);
    console.log(' Opomniki poslani:\n', stdout);
  });
});

webpush.setVapidDetails(
  'mailto:veronijak05@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/uporabniki', require('./routes/uporabnikiRoutes'));
app.use('/api/dokumenti', require('./routes/dokumentiRoutes'));
app.use('/api/opomniki', require('./routes/opomnikiRoutes'));
app.use('/api/push', require('./routes/pushRoutes'));
app.use('/api/nastavitve', require('./routes/nastavitveRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API teče na http://localhost:${PORT}`));
