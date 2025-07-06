const { bookshelf } = require('../db');

const Nastavitve = bookshelf.model('Nastavitve', {
  tableName: 'nastavitve',
  uporabnik() {
    return this.belongsTo('Uporabnik', 'uporabnik_id');
  },
});

module.exports = Nastavitve;
