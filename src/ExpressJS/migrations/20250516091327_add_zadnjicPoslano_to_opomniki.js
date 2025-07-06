// V novi migraciji
exports.up = function (knex) {
  return knex.schema.alterTable('opomniki', (table) => {
    table.date('zadnjicPoslano').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('opomniki', (table) => {
    table.dropColumn('zadnjicPoslano');
  });
};
