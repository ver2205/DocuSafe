exports.up = function (knex) {
  return knex.schema.table('dokumenti', function (table) {
    table.string('naslov').defaultTo('Neznan naslov');
    table.boolean('placano').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table('dokumenti', function (table) {
    table.dropColumn('naslov');
    table.dropColumn('placano');
  });
};
