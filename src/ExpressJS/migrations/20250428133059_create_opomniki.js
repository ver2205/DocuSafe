exports.up = function (knex) {
  return knex.schema.createTable('opomniki', (table) => {
    table.increments('id').primary();
    table
      .integer('uporabnikId')
      .references('id')
      .inTable('uporabniki')
      .onDelete('CASCADE');
    table
      .integer('dokumentId')
      .references('id')
      .inTable('dokumenti')
      .onDelete('CASCADE');
    table.date('datum');
    table.boolean('poslano').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('opomniki');
};
