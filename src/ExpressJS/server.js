const express = require('express');
const cors = require('cors');
const app = express();
app.use(
  cors({
    origin: 'http://localhost:3001', // dovoli tvoj frontend
    credentials: true, // če uporabljaš piškotke ali auth
  })
);

app.use(express.json());

// Povezava z rutami
app.use('/api/uporabniki', require('./routes/uporabnikiRoutes'));
app.use('/api/dokumenti', require('./routes/dokumentiRoutes'));
app.use('/api/opomniki', require('./routes/opomnikiRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API teče na http://localhost:${PORT}`));
