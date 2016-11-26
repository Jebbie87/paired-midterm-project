
exports.up = function(knex, Promise) {
    return knex.schema.createTable("event_times", function(table){
      table.increments();
      table.string("times");
      table.integer("event_id").unsigned();
      table.foreign("event_id").references("events.id");
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable("event_times")
};
