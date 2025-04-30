const knex = require('knex');
const bookshelf = require('bookshelf');
const knexConfig = require('./knexfile');

const knexInstance = knex(knexConfig.development);
const bookshelfInstance = bookshelf(knexInstance);

module.exports = {
  knex: knexInstance,
  bookshelf: bookshelfInstance,
};
