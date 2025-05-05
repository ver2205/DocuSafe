const fs = require('fs');
const pdfParse = require('pdf-parse');
const Dokument = require('../models/Dokument');
const Opomnik = require('../models/Opomnik');

// Vsi dokumenti za prijavljenega uporabnika (z opcijskim filtriranjem)
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    let query = Dokument.where({ uporabnik_id: userId });

    if (req.query.kategorija) {
      query = query.query('where', 'kategorija', '=', req.query.kategorija);
    }

    const docs = await query.fetchAll();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Posamezen dokument
exports.getById = async (req, res) => {
  try {
    const doc = await Dokument.where({
      id: req.params.id,
      uporabnik_id: req.user.id,
    }).fetch({ require: false });

    if (!doc) return res.sendStatus(404);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const dokument = await Dokument.where({ id }).fetch({ require: true });

    // Preveri, če dokument pripada trenutnemu uporabniku
    if (dokument.get('uporabnik_id') !== req.user.id) {
      return res.status(403).json({ error: 'Dostop zavrnjen.' });
    }

    const buffer = dokument.get('vsebina_pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Dokument ni najden.' });
  }
};

// Ustvari dokument
exports.create = async (req, res) => {
  try {
    const doc = await new Dokument({
      ...req.body,
      uporabnik_id: req.user.id,
    }).save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Posodobi dokument
exports.update = async (req, res) => {
  try {
    const doc = await Dokument.where({
      id: req.params.id,
      uporabnik_id: req.user.id,
    }).fetch({ require: true });

    await doc.save(req.body, { patch: true });
    res.json(doc);
  } catch (err) {
    res.status(404).json({ error: 'Dokument ni najden ali ni tvoj' });
  }
};

// Izbriši dokument
exports.remove = async (req, res) => {
  try {
    const doc = await Dokument.where({
      id: req.params.id,
      uporabnik_id: req.user.id,
    }).fetch({ require: true });

    await doc.destroy();
    res.sendStatus(204);
  } catch (err) {
    res.status(404).json({ error: 'Dokument ni najden ali ni tvoj' });
  }
};

exports.uploadPdf = async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const tip = req.body.tip?.toLowerCase(); // "garancija" ali "račun"
    // Prepoznaj prvi datum
    const datumi = text.match(/\d{1,2}\.\d{1,2}\.\d{4}/g) || [];
    console.log(datumi);

    let predlaganDatum = null;

    if (tip === 'garancija' && datumi.length >= 2) {
      predlaganDatum = datumi[1]; // recimo drugi datum je končni rok
    } else if (tip === 'racun' && datumi.length >= 1) {
      predlaganDatum = datumi[0]; // prvi datum = nakup
    }

    console.log(pdfBuffer);
    const nov = await new Dokument({
      uporabnik_id: req.user.id, // preveri da v middleware dodajaš req.user
      tip,
      datum: predlaganDatum
        ? new Date(predlaganDatum.split('.').reverse().join('-'))
        : null,
      vsebina_pdf: pdfBuffer,
    }).save();
    console.log('Saved dokument:', nov.toJSON());

    if (nov.get('datum')) {
      const datumOpomnika = new Date(nov.get('datum'));
      datumOpomnika.setDate(datumOpomnika.getDate() - 1); // dan prej

      await new Opomnik({
        uporabnikId: req.user.id,
        dokumentId: nov.id,
        datum: datumOpomnika.toISOString().split('T')[0],
        poslano: false,
      }).save();
    }
    res.json({
      msg: 'Dokument in opomnik dodani',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Napaka pri obdelavi PDF-ja.' });
  }
};
