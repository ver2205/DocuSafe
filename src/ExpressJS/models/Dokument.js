const { bookshelf } = require('../db');

const Dokument = bookshelf.model('Dokument', {
  tableName: 'dokumenti',

  uporabnik() {
    return this.belongsTo('Uporabnik', 'uporabnikId');
  },
  opomniki() {
    return this.hasMany('Opomnik', 'dokumentId');
  },
});

module.exports = Dokument;
