const Nastavitve = require('../models/Nastavitve');

exports.getForUser = async (req, res) => {
  try {
    const obstojece = await Nastavitve.where({
      uporabnik_id: req.user.id,
    }).fetch({ require: false });
    res.json(obstojece ? obstojece.toJSON() : null);
  } catch (err) {
    console.error('Napaka pri pridobivanju nastavitev:', err);
    res.status(500).json({ error: 'Napaka strežnika' });
  }
};

exports.saveForUser = async (req, res) => {
  const { dni_pred_rok, posiljaj_email, posiljaj_push } = req.body;

  try {
    const obstojece = await Nastavitve.where({
      uporabnik_id: req.user.id,
    }).fetch({ require: false });

    if (obstojece) {
      await obstojece.save(
        { dni_pred_rok, posiljaj_email, posiljaj_push },
        { patch: true }
      );
    } else {
      await Nastavitve.forge({
        uporabnik_id: req.user.id,
        dni_pred_rok,
        posiljaj_email,
        posiljaj_push,
      }).save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Napaka pri shranjevanju nastavitev:', err);
    res.status(500).json({ error: 'Napaka strežnika' });
  }
};
