
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("event_times", function(table){
      table.increments();
      table.string("times");
      table.integer("event_id");
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("event_times");
  ])
};
