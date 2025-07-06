const PushSubscription = require('../models/PushSubscription');
const { knex } = require('../db');

exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    const userId = req.user.id;

    // Prepreči podvajanje
    // Pobriši vse stare subscriptione tega uporabnika
    await knex('push_subscriptions').where({ uporabnik_id: userId }).del();

    // Shrani novo
    await knex('push_subscriptions').insert({
      uporabnik_id: userId,
      endpoint,
      keys: JSON.stringify(keys),
    });

    res.status(201).json({ msg: 'Subscription saved' });
  } catch (err) {
    console.error('Napaka pri push subscribe:', err);
    res.status(500).json({ error: 'Napaka pri shranjevanju subscriptiona' });
  }
};
