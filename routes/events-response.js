// server side

'use strict';

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

const counter = {
      time1: 0,
      time2: 0,
      time3: 0
    }

  router.get('/uniqueurl', (req, res) => {
    res.status(200).render('./events/response-page', counter);
  });

  router.post('/:uniqueurl', (req, res) => {
    const time1 = Number(req.body.going1);
    const time2 = Number(req.body.going2);
    const time3 = Number(req.body.going3);
    const userFirstName = req.body['first-name'];
    const userLastName = req.body['last-name'];
    const userEmail = req.body['user-email'];

    counter.time1 += time1;
    counter.time2 += time2;
    counter.time3 += time3;

    knex('attendees')
      .insert([ {first_name: userFirstName, last_name: userLastName, email: userEmail} ])
      .returning('id')
      .then(function(attendeesId) {
        let id = Number(attendeesId[0]);

        knex('response')
          .insert([ {response: time1, attendees_id: id}, {response: time2, attendees_id: id}, {response: time3, attendees_id: id} ])
          .then(function(results) {
            console.log(results);
          })
          .catch(function(err) {
            console.log(err);
          })
      })
      .catch(function(err) {
        console.log(err)
      })

    // knex('event_times')
    //   .insert( [{times: time1}, {times: time2}, {times: time3}] )
    //   .then(function(results) {
    //     console.log(results);
    //   })

    res.render('./events/response-page', counter);
  });

  return router;

};
