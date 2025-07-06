const { bookshelf } = require('../db');
const Dokument = require('./Dokument');
const Uporabnik = require('./Uporabnik');

const Opomnik = bookshelf.model('Opomnik', {
  tableName: 'opomniki',
  uporabnik() {
    return this.belongsTo(Uporabnik, 'uporabnikId');
  },
  dokument() {
    return this.belongsTo(Dokument, 'dokumentId');
  },
});

module.exports = Opomnik;
