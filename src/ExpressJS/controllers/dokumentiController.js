const fs = require('fs');
const pdfParse = require('pdf-parse');
const Dokument = require('../models/Dokument');
const Opomnik = require('../models/Opomnik');
const Nastavitve = require('../models/Nastavitve');

const Tesseract = require('tesseract.js');

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
  const { id } = req.params;

  try {
    // v eni transakciji:
    await knex.transaction(async (trx) => {
      await trx('opomniki').where({ dokumentId: id }).del();
      await trx('dokumenti').where({ id }).del();
    });

    res.json({ success: true });
  } catch (err) {
    console.error(' Napaka pri brisanju:', err);
    res.status(500).json({ error: 'Napaka strežnika' });
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

function extractNaslovIzSlike(text) {
  const lines = text
    .split(/\n|\r|\.|:/)
    .map((l) => l.trim())
    .filter(Boolean);

  let best = { line: '', score: 0 };

  lines.slice(0, 30).forEach((line, idx) => {
    const score = ocrLineScore(line, idx);
    if (score > best.score) best = { line, score };
  });

  if (best.score >= 3) return best.line;
  return lines[0] || 'Neznan dokument';
}

function ocrLineScore(line, idx) {
  let score = 0;

  if (/račun|invoice|položnica|obvestilo/i.test(line)) score += 3;
  if (/za\s+mesec|\d{1,2}\.\d{4}|\b\d{1,2}\.\d{1,2}\.\d{4}/.test(line))
    score += 2;
  if (/\d+[,.]\d{2}\s*€?/.test(line)) score += 2; // morebitna cena/znesek
  if (line.length >= 10 && line.length <= 60) score += 1;
  if (idx < 5) score += 1;
  if (/[A-Z]{4,}\s?[A-Z0-9]{3,}/.test(line)) score -= 2; // penaliziraj šum

  return score;
}

exports.uploadPdf = async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    let text = '';
    let data = {};
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(pdfBuffer);
      text = data.text;
    } else if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
      const result = await Tesseract.recognize(pdfBuffer, 'slk');
      text = result.data.text;
    } else {
      return res.status(400).json({ error: 'Nepodprta vrsta datoteke.' });
    }

    const naslov =
      mimetype === 'application/pdf'
        ? extractNaslov(text, data)
        : extractNaslovIzSlike(text);
    const tip = req.body.tip?.toLowerCase();
    const datumi = text.match(/\d{1,2}\.\d{1,2}\.\d{4}/g) || [];

    let predlaganDatum = null;

    if (datumi.length >= 1) {
      const prvi = datumi[0];
      const drugi = datumi.find((d) => d !== prvi); // najdi prvi različen
      if (drugi) predlaganDatum = drugi;
    } else if (datumi.length === 1) {
      predlaganDatum = datumi[0]; // fallback: samo en datum
    }

    const nov = await new Dokument({
      uporabnik_id: req.user.id,
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
      const rok = new Date(nov.get('datum'));
      const nastavitve = await Nastavitve.where({
        uporabnik_id: req.user.id,
      }).fetch({ require: false });

      const dniPred = nastavitve?.get('dni_pred_rok') ?? 5; // fallback: 5
      const datumOpomnika = new Date(rok);
      datumOpomnika.setDate(rok.getDate() - dniPred);

      await new Opomnik({
        uporabnikId: req.user.id,
        dokumentId: nov.id,
        datum: datumOpomnika.toISOString().split('T')[0],
        tip: nov.get('tip'),
        poslano: false,
        zadnjicPoslano: null,
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
