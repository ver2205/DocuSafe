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
const months =
  'januar|februar|marec|april|maj|junij|julij|avgust|september|oktober|november|december';

function lineScore(line, idx) {
  let score = 0;

  if (/račun|invoice/i.test(line)) score += 4;
  if (new RegExp(`(${months}|\\d{1,2}\\/\\d{4})`, 'i').test(line)) score += 3;
  if (/št\.?|#\s*\d+/i.test(line)) score += 3;
  if (/\d+[,.]\d{2}\s*€?/.test(line)) score += 2; // znesek
  if (line.length >= 10 && line.length <= 80) score += 1;
  if (idx < 10) score += 1; // visoko v dokumentu
  //penaliziraj vrstico, ki izgleda kot šum/QR koda
  if (/[A-Z]{3,}\s?[A-Z0-9]{3,}/.test(line)) score -= 2;
  return score;
}

function extractNaslov(text, meta = {}) {
  //  PDF metapodatki
  if (meta?.info?.Title) return meta.info.Title.trim();

  // preberi vrstice in točkuj
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  let best = { line: '', score: 0 };

  lines.slice(0, 20).forEach((line, idx) => {
    const s = lineScore(line, idx);
    if (s > best.score) best = { line, score: s };
  });

  // če je dosežen prag >=4, vrni
  if (best.score >= 4) return best.line;

  // fallback – druga vrstica (če obstaja)
  if (lines.length > 1) return lines[1];

  //  zadnji fallback
  return 'Neznan dokument';
}

exports.uploadPdf = async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    const text = data.text;
    const naslov = extractNaslov(data.text, data);

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
      placano: false,
      naslov,
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
