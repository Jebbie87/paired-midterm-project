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
      // THIS FUNCTION PUSHES DATA INTO EVENTS
      function(callback){
        return knex("events")
          .returning('id')
          .insert([{title: title, date: date, description: description, uniqueurl: uniqueURL}])
          .then(response => callback(null, response))
          .catch(callback)
      },
      // THIS FUNCTION PUSHES DATA INTO EVENT_TIMES TABLE
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
      // THIS FUNCTION PUSHES DATA INTO ATTENDEES TABLE
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
        // alert("Success!");
        // res.redirect("/");
        res.redirect(`/events/${uniqueURL}`);
      }
    });
  });

  const counter = {
        time1: 0,
        time2: 0,
        time3: 0,
        message: []
      };

    router.get('/:uniqueurl', (req, res) => {

      knex('attendees')
        .join('response', 'attendees.id', '=', 'response.attendees_id')
        .join('event_times', 'event_times.id', '=', 'response.event_times_id')
        .join('events', 'event_times.id', '=', 'events.id')
        .select()
        .as('table')
        .where('response.response', '1')
        .then(function(data) {
          data.forEach(function(user) {
            const slicedDate = user.date.toString().slice(0, 15)
            // slicedDate.slice(0, 15)
            counter.message.push(`${user.first_name} ${user.last_name} will be attending ${user.title} on ${slicedDate} at ${user.times}`);
          })
          // $('.user-responses')
        })
      res.status(200).render('./events/response-page', counter);
    });

    router.post('/uniqueurl', (req, res) => {
      const time1 = Number(req.body.going1);
      const time2 = Number(req.body.going2);
      const time3 = Number(req.body.going3);
      const userFirstName = req.body['first-name'];
      const userLastName = req.body['last-name'];
      const userEmail = req.body['user-email'];

      counter.time1 += time1;
      counter.time2 += time2;
      counter.time3 += time3;

      // inserting the attendee's first name, last name and email into the attendees table
      knex('attendees')
        .insert([ {first_name: userFirstName, last_name: userLastName, email: userEmail} ])
        .returning('id')
        .then(function(attendeesID) {
          let id = Number(attendeesID[0]);
          // inserting response and the attendee's id into the response table
          knex('response')
            .insert([ {response: time1, attendees_id: id}, {response: time2, attendees_id: id}, {response: time3, attendees_id: id} ])
            .then(function(results) {
              res.json(counter);
              // console.log(results);
            })
            .catch(function(err) {
              console.log(err);
            })
        })
        .catch(function(err) {
          console.log(err);
        })

      // res.redirect('/events/uniqueurl');
    });
  return router;
}
