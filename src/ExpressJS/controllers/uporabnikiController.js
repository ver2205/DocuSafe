const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Uporabnik');
const SECRET = 'verkrismeg';
const mailer = require('../config/email');

exports.getAll = async (req, res) => {
  try {
    const users = await User.fetchAll({ columns: ['id', 'ime', 'email'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.create = async (req, res) => {
  const { ime, email, geslo } = req.body;

  try {
    const obstoja = await User.where({ email }).fetch({ require: false });
    if (obstoja) return res.status(409).json({ msg: 'Uporabnik že obstaja' });

    const isValidPassword =
      geslo.length >= 8 && /[A-Z]/.test(geslo) && /[0-9]/.test(geslo);
    if (!isValidPassword) {
      return res.status(400).json({
        msg: 'Geslo mora vsebovati vsaj 8 znakov, eno veliko črko in eno številko.',
      });
    }

    const hashed = await bcrypt.hash(geslo, 10);

    const user = await new User({ ime, email, geslo: hashed }).save();

    res.status(201).json({ id: user.get('id'), ime, email });

    await mailer.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Dobrodošli v DocuSafe!',
      html: `
        <p>Pozdravljeni, ${ime || ''}!</p>
        <p>Vaš račun v <strong>DocuSafe</strong> je bil uspešno ustvarjen.</p>
        <p>Hvala za zaupanje!</p>
      `,
    });

    console.log(`✉️ Registracijski e-mail poslan na ${email}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, geslo } = req.body;

  try {
    const user = await User.where({ email }).fetch({ require: false });
    if (!user) return res.status(401).json({ msg: 'Nepravilen e-mail' });

    const valid = await bcrypt.compare(geslo, user.get('geslo'));
    if (!valid) return res.status(401).json({ msg: 'Napačno geslo' });

    const token = jwt.sign(
      { id: user.get('id'), email, ime: user.get('ime') },
      SECRET,
      {
        expiresIn: '12h',
      }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.where({ id }).fetch({ require: true });
    await user.save(req.body, { patch: true });
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: 'Uporabnik ni najden' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.where({ id }).fetch({ require: true });
    await user.destroy();
    res.sendStatus(204);
  } catch (err) {
    res.status(404).json({ error: 'Uporabnik ni najden' });
  }
};
