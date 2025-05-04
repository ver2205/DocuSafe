const Opomnik = require('../models/Opomnik');

exports.getAll = async (req, res) => {
  try {
    const opomniki = await Opomnik.where({ uporabnikId: req.user.id }).fetchAll(
      { withRelated: ['dokument'] }
    );
    res.json(opomniki);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Napaka pri pridobivanju opomnikov.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { dokumentId, datum } = req.body;

    const opomnik = await new Opomnik({
      uporabnikId: req.user.id,
      dokumentId,
      datum,
      poslano: false,
    }).save();

    res.status(201).json({ msg: 'Opomnik uspešno dodan.', opomnik });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Napaka pri dodajanju opomnika.' });
  }
};

exports.markAsSent = async (req, res) => {
  try {
    const opomnik = await Opomnik.where({
      id: req.params.id,
      uporabnikId: req.user.id,
    }).fetch({ require: true });
    await opomnik.save({ poslano: true }, { patch: true });

    res.json({ msg: 'Opomnik označen kot poslan.', opomnik });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Napaka pri označevanju opomnika kot poslanega.' });
  }
};
