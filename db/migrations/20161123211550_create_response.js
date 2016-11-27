
exports.up = function(knex, Promise) {
  return knex.schema.createTable('response', function(table) {
    table.integer('response');
    table.integer('attendees_id').unsigned();
    table.foreign('attendees_id').references('attendees.id');
    table.integer('event_times_id').unsigned();
    table.foreign('event_times_id').references('event_times.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('response');
};
