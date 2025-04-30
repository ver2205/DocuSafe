exports.up = function (knex) {
  return knex.schema.createTable('dokumenti', (table) => {
    table.increments('id').primary();
    table
      .integer('uporabnikId')
      .references('id')
      .inTable('uporabniki')
      .onDelete('CASCADE');
    table.string('naslov');
    table.date('datum');
    table.date('rok');
    table.string('kategorija');
    table.boolean('placano');
    table.string('tip');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('dokumenti');
};
