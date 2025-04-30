const { bookshelf } = require('../db');

const Opomnik = bookshelf.model('Opomnik', {
  tableName: 'opomniki',
  uporabnik() {
    return this.belongsTo('Uporabnik', 'uporabnikId');
  },
  dokument() {
    return this.belongsTo('Dokument', 'dokumentId');
  },
});

module.exports = Opomnik;
