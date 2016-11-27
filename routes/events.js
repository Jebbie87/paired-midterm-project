"use strict";

const express = require('express');
const router  = express.Router();
const waterfall = require('async-waterfall');

const generateUniqueURL = function() {
  const alphaNumeric = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let uniqueURL = '';

  for (var i = 0; i < 20; i++) {
    const randomNum = Math.floor((Math.random() * 63));
    uniqueURL += alphaNumeric.charAt(randomNum);
  };
  return uniqueURL;
};

module.exports = (knex) => {

/********************** THIS IS THE GET AND POST REQUEST TO MAKING THE NEW EVENT ********************/

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
    const uniqueURL = generateUniqueURL();

    waterfall([
      //This function inserts data into the attendees table and returns the id.
      function(callback){
        return knex("attendees")
          .returning("id")
          .insert([{first_name: firstName, last_name: lastName, email: email}])
          .then(response => callback(null, response))
          .catch(callback)
      },
      //This function inserts data into the events table and returns the id.
      function(attendees_data, callback){
        return knex("events")
          .returning("id")
          .insert([{title: title, date: date, description: description, uniqueurl: uniqueURL, attendees_id: attendees_data[0]}])
          .then(response => callback(null, [response, attendees_data]))
          .catch(callback)
      },
      //This function inserts data into the event_times table.
      function(event_data, callback){
        const eventID = event_data[0][0];
        return knex("event_times")
          .returning("id")
          .insert([{
            times: time1,
            event_id: eventID
          }, {
            times: time2,
            event_id: eventID
          }, {
            times: time3,
            event_id: eventID
          }])
          .then(response => callback(null, [response, event_data[1]]))
          .catch(callback)
      },
      //This updates the database with the responses.
      function(eventTimesData, callback){
        const attendeeID = eventTimesData[1][0];
        const eventTimesID = eventTimesData[0];
        return knex("response")
          .insert([{
            response: 1,
            attendees_id: attendeeID,
            event_times_id: eventTimesID[0]
          }, {
            response: 1,
            attendees_id: attendeeID,
            event_times_id: eventTimesID[1]
          }, {
            response: 1,
            attendees_id: attendeeID,
            event_times_id: eventTimesID[2]
          }])
          .then(response => callback(null, "done"))
      },
    ],
    function (err, result) {
      if(err){
        return console.log("Failed to waterfall", err);
      } else {
        console.log("Successfull insertion.");
        res.status(200).redirect(`/events/${uniqueURL}`);
      }
    });
  });

  return router;
}
