exports.up = function (knex) {
  return knex.schema.createTable('push_subscriptions', (table) => {
    table.increments('id').primary();
    table
      .integer('uporabnik_id')
      .references('id')
      .inTable('uporabniki')
      .onDelete('CASCADE');
    table.text('endpoint').notNullable();
    table.jsonb('keys').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('push_subscriptions');
};
