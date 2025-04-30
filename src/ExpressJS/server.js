const express = require('express');
const app = express();

app.use(express.json());

// Povezava z rutami
app.use('/api/uporabniki', require('./routes/uporabnikiRoutes'));
app.use('/api/dokumenti', require('./routes/dokumentiRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API teče na http://localhost:${PORT}`));
