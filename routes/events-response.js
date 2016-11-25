// server side

'use strict';

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

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
};
