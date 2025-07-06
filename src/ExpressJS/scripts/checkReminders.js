const { knex } = require('../db');
const Opomnik = require('../models/Opomnik');
const webpush = require('web-push');
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});
console.log(' SMTP_HOST iz checkReminders:', process.env.SMTP_HOST);

const mailer = require('../config/email');

webpush.setVapidDetails(
  'mailto:veronijak05@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

(async () => {
  const danes = new Date();
  const danesISO = danes.toISOString().split('T')[0];

  const opomniki = await Opomnik.where('datum', '<=', danesISO).fetchAll({
    withRelated: ['dokument', 'dokument.uporabnik'],
  });

  for (const o of opomniki.models) {
    const dok = o.related('dokument');
    const user = dok.related('uporabnik');
    const rok = new Date(dok.get('datum'));
    const placano = dok.get('placano');
    const tip = o.get('tip');
    const zadnjicPoslano = o.get('zadnjicPoslano');
    const uporabnikId = dok.get('uporabnik_id');
    const email = user?.get('email');
    const naslov = dok.get('naslov');

    if (!rok || placano || zadnjicPoslano === danesISO) continue;

    // Nastavitve
    const nastavitve = await knex('nastavitve')
      .where('uporabnik_id', uporabnikId)
      .first();

    const dniPredRokom = nastavitve?.dni_pred_rok ?? 5;
    const posljiEmail = nastavitve?.posiljaj_email ?? true;
    const posljiPush = nastavitve?.posiljaj_push ?? true;

    const diff = Math.ceil((rok - danes) / (1000 * 60 * 60 * 24));
    const isRacun = tip === 'racun' && diff <= dniPredRokom;
    const isGarancija = tip === 'garancija' && diff <= dniPredRokom;

    if (!isRacun && !isGarancija) continue;

    console.log(` Pošiljanje opomnika za ${tip} #${dok.id}`);

    let delivered = false;

    // Pošlji PUSH če omogočeno
    if (posljiPush) {
      const subscriptions = await knex('push_subscriptions').where(
        'uporabnik_id',
        uporabnikId
      );

      for (const sub of subscriptions) {
        try {
          const keys =
            typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
          const payload = JSON.stringify({
            title:
              tip === 'racun' ? ' Opomnik za račun' : ' Garancija se izteka',
            body:
              tip === 'racun'
                ? `Dokument "${naslov}" je ${
                    diff < 0 ? `${-diff} dni po roku` : `čez ${diff} dni`
                  }.`
                : `Dokument "${naslov}" poteče čez ${diff} dni.`,
          });

          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys,
            },
            payload
          );
          console.log(` Push uspešno poslan na ${sub.endpoint}`);
          delivered = true;
        } catch (err) {
          console.error(' Neuspešno pošiljanje push:', err);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await knex('push_subscriptions')
              .where({ endpoint: sub.endpoint })
              .del();
          }
        }
      }
    }

    // mail ce je omogocen
    if (posljiEmail && email) {
      try {
        await mailer.sendMail({
          from: process.env.FROM_EMAIL || 'DocuSafe <noreply@docusafe.si>',
          to: email,
          subject: tip === 'racun' ? 'Opomnik za račun' : 'Opomnik: Garancija',
          text:
            tip === 'racun'
              ? `Dokument "${naslov}" je ${
                  diff < 0 ? `${-diff} dni po roku` : `čez ${diff} dni`
                }.`
              : `Dokument "${naslov}" poteče čez ${diff} dni.`,
          html: `
            <p>Spoštovani!</p>
            <p>Dokument <strong>${naslov}</strong> ${
            tip === 'racun'
              ? diff < 0
                ? `je <strong>${-diff} dni po roku</strong>`
                : `zapade <strong>čez ${diff} dni</strong>`
              : `poteče <strong>čez ${diff} dni</strong>`
          }.</p>
            <p>Prosimo, da pravočasno ukrepate.</p>
          `,
        });

        console.log(`✉️ E-mail poslan na ${email}`);
      } catch (err) {
        console.error(' Napaka pri pošiljanju e-pošte:', err);
      }
    }

    await o.save({ zadnjicPoslano: danesISO }, { patch: true });
  }

  process.exit();
})();
