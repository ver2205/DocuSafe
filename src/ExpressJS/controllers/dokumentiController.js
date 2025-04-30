const fs = require('fs');
const pdfParse = require('pdf-parse');
const Dokument = require('../models/Dokument');

// Vsi dokumenti za prijavljenega uporabnika (z opcijskim filtriranjem)
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    let query = Dokument.where({ uporabnikId: userId });

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
      uporabnikId: req.user.id,
    }).fetch({ require: false });

    if (!doc) return res.sendStatus(404);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ustvari dokument
exports.create = async (req, res) => {
  try {
    const doc = await new Dokument({
      ...req.body,
      uporabnikId: req.user.id,
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
      uporabnikId: req.user.id,
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
      uporabnikId: req.user.id,
    }).fetch({ require: true });

    await doc.destroy();
    res.sendStatus(204);
  } catch (err) {
    res.status(404).json({ error: 'Dokument ni najden ali ni tvoj' });
  }
};

exports.uploadPdf = async (req, res) => {
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const tip = req.body.tip?.toLowerCase(); // "garancija" ali "račun"

    // Prepoznaj prvi datum
    const datumi = text.match(/\d{2}\.\d{2}\.\d{4}/g) || [];
    let predlaganDatum = null;

    if (tip === 'garancija' && datumi.length >= 2) {
      predlaganDatum = datumi[1]; // recimo drugi datum je končni rok
    } else if (tip === 'račun' && datumi.length >= 1) {
      predlaganDatum = datumi[0]; // prvi datum = nakup
    }

    const izdelek = text.includes('Prenosnik') ? 'Prenosnik' : 'Neznano';

    res.json({
      izdelek,
      predlaganDatum,
      analiza: 'Prepoznan datum je predlog. Uporabnik lahko spremeni.',
      vsebina: text.slice(0, 500) + '...', // za preview
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Napaka pri obdelavi PDF-ja.' });
  }
};
