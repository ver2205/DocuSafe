// migrations/20250505_create_dokumenti.js
exports.up = function (knex) {
  return knex.schema.createTable('dokumenti', function (table) {
    table.increments('id').primary();
    table
      .integer('uporabnik_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('uporabniki')
      .onDelete('CASCADE');
    table.string('tip').notNullable(); // "račun" ali "garancija"
    table.date('datum').nullable();
    table.binary('vsebina_pdf').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('dokumenti');
};
