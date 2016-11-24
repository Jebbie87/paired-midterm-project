
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("events", function(table){
      table.increments();
      table.string("title");
      table.date("date");
      table.string("description")
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("events")
  ])
};
