exports.up = function (knex) {
  return knex.schema.alterTable('opomniki', function (table) {
    table.string('tip').defaultTo('racun');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('opomniki', function (table) {
    table.dropColumn('tip');
  });
};
