exports.up = function (knex) {
  return knex.schema.createTable('nastavitve', function (table) {
    table.increments('id').primary();
    table
      .integer('uporabnik_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('uporabniki')
      .onDelete('CASCADE');
    table.integer('dni_pred_rok').defaultTo(5);
    table.boolean('posiljaj_email').defaultTo(true);
    table.boolean('posiljaj_push').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('nastavitve');
};
