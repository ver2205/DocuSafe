const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Uporabnik');
const SECRET = 'verkrismeg';

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

    const hashed = await bcrypt.hash(geslo, 10);
    const user = await new User({ ime, email, geslo: hashed }).save();

    res.status(201).json({ id: user.get('id'), ime, email });
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

    const token = jwt.sign({ id: user.get('id'), email }, SECRET, {
      expiresIn: '1h',
    });
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
