"use strict";

const express = require('express');
const router  = express.Router();
const waterfall = require('async-waterfall');

module.exports = (knex) => {

  router.get("/new", (req, res) => {
    res.render("./events/new")
  })

  router.post("/new", (req, res) => {
    const title = req.body.title;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const description = req.body.description;
    const date = req.body.date;
    const time1 = req.body.time1;
    const time2 = req.body.time2;
    const time3 = req.body.time3;

    waterfall([
      function(callback){
        return knex("events")
          .returning('id')
          .insert([{title: title, date: date, description: description}])
          .then(response => callback(null, response))
          .catch(callback)
      },
      function(event_data, callback){
        return knex("event_times")
          .insert([{
            times: time1,
            event_id: event_data[0]
          }, {
            times: time2,
            event_id: event_data[0]
          }, {
            times: time3,
            event_id: event_data[0]
          }])
          .then(response => callback(null, response))
          .catch(callback)
      },
      function(response, callback){
        return knex("attendees")
          .insert([{first_name: firstName, last_name: lastName, email: email}])
          .then(response => callback(null, 'done'));
      }
    ],
    function (err, result) {
      if(err){
        return console.log("Failed to waterfall", err);
      } else {
        console.log("Successfull insertion.");
        res.redirect("/");
      }
    });
  });

  return router;
}
