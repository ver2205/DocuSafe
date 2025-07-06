const { bookshelf } = require('../db');

const PushSubscription = bookshelf.model('PushSubscription', {
  tableName: 'push_subscriptions',
  user() {
    return this.belongsTo('Uporabnik', 'uporabnik_id');
  },
});

module.exports = PushSubscription;
