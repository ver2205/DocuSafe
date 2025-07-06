exports.up = function (knex) {
  return knex.schema.createTable('uporabniki', (table) => {
    table.increments('id').primary();
    table.string('ime');
    table.string('email').unique();
    table.string('geslo');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('uporabniki');
};
