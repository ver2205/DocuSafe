const knexPkg = require('knex');
const bookshelfPkg = require('bookshelf');
const knexConfig = require('./knexfile');

const knex = knexPkg(knexConfig.development);
const bookshelf = bookshelfPkg(knex);

// Log every SQL query
knex.on('query', (query) => {
  console.log('SQL →', query.sql, query.bindings);
});

module.exports = { knex, bookshelf };
