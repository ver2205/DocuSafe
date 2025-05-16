exports.up = function (knex) {
  return knex.schema.createTable('opomniki', (table) => {
    table.increments('id').primary();

    table
      .integer('uporabnikId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('uporabniki')
      .onDelete('CASCADE');

    table
      .integer('dokumentId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('dokumenti')
      .onDelete('CASCADE');

    table.date('datum').notNullable();
    table.boolean('poslano').notNullable().defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('opomniki');
};
