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
    // const personGoing = Number(req.body.going);
    const time1 = Number(req.body.going1);
    // console.log(req.body)
    const time2 = Number(req.body.going2);
    const time3 = Number(req.body.going3);

    counter.time1 += time1;
    counter.time2 += time2;
    counter.time3 += time3;



    // console.log("events response body:", req.body.going)
    // knex('response')
    //   .insert( {response: personGoing} )
    //   .then(function(results) {
    //     console.log(results);
    //   })
    //   .catch(function(err) {
    //     console.log(err);
    //   })

    // knex('event_times')
    //   .insert( [{times: time1}, {times: time2}, {times: time3}] )
    //   .then(function(results) {
    //     console.log(results);
    //   })

    res.render('./events/response-page', counter);
  });

  return router;

};
