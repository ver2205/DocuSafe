const jwt = require('jsonwebtoken');
const SECRET = 'verkrismeg';

function preveriToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Manjka Authorization header');

  const token = auth.split(' ')[1]; // Bearer <token>
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Neveljaven žeton');
    req.user = decoded;
    next();
  });
}

module.exports = { preveriToken };
