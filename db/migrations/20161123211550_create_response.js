
exports.up = function(knex, Promise) {
  return knex.schema.createTable('response', function(table) {
    table.integer('response');
    table.integer('attendees_id');
    table.integer('event_times_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('response');
};
