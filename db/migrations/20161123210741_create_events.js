
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("events", function(table){
      table.increments();
      table.string("name");
      table.date("date");
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("events")
  ])
};
