
exports.up = function(knex, Promise) {
  return knex.schema.createTable("events", function(table){
    table.increments();
    table.string("title");
    table.date("date");
    table.string("description");
    table.string("uniqueurl");
    table.integer("attendees_id").unsigned();
    table.foreign("attendees_id").references("attendees.id");
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("events")
};
