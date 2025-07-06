const { bookshelf } = require('../db');

const Uporabnik = bookshelf.model('Uporabnik', {
  tableName: 'uporabniki',
  dokumenti() {
    return this.hasMany('Dokument', 'uporabnikId');
  },
});

module.exports = Uporabnik;
