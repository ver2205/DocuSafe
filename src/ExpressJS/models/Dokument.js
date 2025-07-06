const { bookshelf } = require('../db');

const Dokument = bookshelf.model('Dokument', {
  tableName: 'dokumenti',

  uporabnik() {
    return this.belongsTo('Uporabnik', 'uporabnik_id');
  },
  opomniki() {
    return this.hasMany('Opomnik', 'dokument_id');
  },
});

module.exports = Dokument;
