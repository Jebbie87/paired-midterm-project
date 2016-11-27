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

let counter = {
  counter1: 0,
  counter2: 0,
  counter3: 0,
  message: []
};

module.exports = (knex) => {

const newUserReponse = function() {
    waterfall([
    // THIS WILL GET THE TABLE OF THE CURRENT EVENT
    function(callback) {
      return knex('events')
        .select()
        .where('events.uniqueurl', req.body.hiddenURL)
        .then((response) => callback(null, response))
        .catch(callback)
    },
    // THIS WILL INSERT THE ATTENDEE INFORMATION AND SEND ATTENDEE ID DOWN TO THE NEXT FUNCTION
    function(eventsData, callback) {
      return knex('attendees')
        .insert([ {first_name: userFirstName, last_name: userLastName, email: userEmail} ])
        .returning('id')
        .then((response) => callback(null, [response, eventsData]))
        .catch(callback)
    },
    // THIS WILL INSERT THE CURRENT EVENTS INFORMATION AND SEND THE EVENT ID AND ATTENDEE ID DOWN TO THE NEXT FUNCTION
    function(attendeeID, callback){
      const eventData = attendeeID[1][0];
      return knex('events')
        .insert([ {title: eventData.title,
          date: eventData.date.toString().slice(0, 15),
          description: eventData.description,
          uniqueurl: eventData.uniqueurl,
          attendees_id: attendeeID[0][0]}
        ])
        .returning('id')
        .then((response) => callback(null, [response, attendeeID[0]]))
        .catch(callback)
    },
    // THIS WILL JOIN THE EVENT TIMES TABLE AND THE EVENTS TABLE JUST TO GET THE TIMES OF THE EVENTS
    // ALSO SENDS THE ATTENDEE ID AND EVENT ID DOWN TO THE NEXT FUNCTION
    function(eventTimesJoiningEvents, callback){
      return knex('event_times')
        .join('events', 'events.id', '=', 'event_times.event_id')
        .select('times')
        .then((response) => callback(null, [response, eventTimesJoiningEvents]))
        .catch(callback)
    },
    // THIS WILL INSERT THE TIME AND THE EVENT ID INTO THE EVENT TIMES TABLE
    // ALSO SENDS THE ATTENDEE ID AND THE EVENT TIMES ID DOWN TO THE NEXT FUNCTION
    function(timesIntoEventTimes, callback){
      const eventsID = timesIntoEventTimes[1][0][0];
      const eventTimes = timesIntoEventTimes[0];
      return knex('event_times')
        .insert([ {times: eventTimes[0].times, event_id: eventsID},
          {times: eventTimes[1].times, event_id: eventsID},
          {times: eventTimes[2].times, event_id: eventsID}
        ])
        .returning('id')
        .then((response) => callback(null, [response, timesIntoEventTimes[1][1][0]] ))
        .catch(callback)
    },
    // THIS WILL INSERT THE USER RESPONSE AND REFERENCE THE EVENT TIMES ID AND ATTENDEE ID
    function(userResponse, callback){
      const eventTimesID = userResponse[0];
      return knex('response')
        .insert([ {response: going1, attendees_id: userResponse[1], event_times_id: eventTimesID[0]},
          {response: going2, attendees_id: userResponse[1], event_times_id: eventTimesID[1]},
          {response: going3, attendees_id: userResponse[1], event_times_id: eventTimesID[1]}
        ])
        .then((response) => callback(null, "done"))
    }
  ],
  function(err, result){
    if (err){
      console.log("Failed to insert to waterfall!");
    } else {
      console.log("Successful insert into waterfall!");
    }
  })
}

/********************** THIS IS THE GET AND POST REQUEST TO MAKING THE NEW EVENT ********************/
/********************** ANDREW'S WORK *******************/

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
        return knex("event_times")
          .returning("id")
          .insert([{
            times: time1,
            event_id: event_data[0][0]
          }, {
            times: time2,
            event_id: event_data[0][0]
          }, {
            times: time3,
            event_id: event_data[0][0]
          }])
          .then(response => callback(null, [response, event_data[1]]))
          .catch(callback)
      },
      function(eventTimesData, callback){
        return knex("response")
          .insert([{
            response: 1,
            attendees_id: eventTimesData[1][0],
            event_times_id: eventTimesData[0][0]
          }, {
            response: 1,
            attendees_id: eventTimesData[1][0],
            event_times_id: eventTimesData[0][1]
          }, {
            response: 1,
            attendees_id: eventTimesData[1][0],
            event_times_id: eventTimesData[0][2]
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

/********************** THE GET AND POST REQUEST TO THE UNIQUE URL ***********************/
/********************** JEFFREY'S WORK **********************/
  // THIS IS THE GET REQUEST TO THE UNIQUE URL
  router.get('/:uniqueurl', (req, res) => {
    let uniqueURL = req.params.uniqueurl;
    let templateVar = {
      counter1: counter.counter1,
      counter2: counter.counter2,
      counter3: counter.counter3,
      message: [],
      uniqueurl: uniqueURL
    };
    // console.log(templateVar)
    knex('attendees')
      .join('response', 'attendees.id', '=', 'response.attendees_id')
      .join('event_times', 'event_times.id', '=', 'response.event_times_id')
      .join('events', 'event_times.id', '=', 'events.id')
      .select()
      .where('response.response', '1')
      .then(function(data) {
        // console.log('datea: ', data)
        data.forEach(function(user) {
          const slicedDate = user.date.toString().slice(0, 15);
          templateVar.message.push(`${user.first_name} ${user.last_name} will be attending ${user.title} on ${slicedDate} at ${user.times}`);
        })
      })


    knex('events')
      .join('event_times', 'event_times.id', '=', 'events.id')
      .returning('id')
      .where('events.uniqueurl', uniqueURL)
      .select()
      .then(function(id){
        // console.log("events id: ", id)
        templateVar.eventTitle = id[0].title;
        templateVar.eventDate = id[0].date.toString().slice(0, 15);
        knex('event_times')
          .select('times')
          .where('event_times.event_id', id[0].id)
          .then(function(data) {
            let counter = 0;
            data.forEach(function(time) {
              counter++;
              templateVar[`pageTime${counter}`] = time.times
            });
            res.render('./events/response-page', templateVar);
          })
      })
  });

  // THIS IS THE POST REQUEST TO THE UNIQUE URL
  router.post('/', (req, res) => {
    const going1 = Number(req.body.going1);
    const going2 = Number(req.body.going2);
    const going3 = Number(req.body.going3);
    const userFirstName = req.body['first-name'];
    const userLastName = req.body['last-name'];
    const userEmail = req.body['user-email'];

    counter.counter1 += going1;
    counter.counter2 += going2;
    counter.counter3 += going3;

    waterfall([
    // THIS WILL GET THE TABLE OF THE CURRENT EVENT
    function(callback) {
      return knex('events')
        .select()
        .where('events.uniqueurl', req.body.hiddenURL)
        .then((response) => callback(null, response))
        .catch(callback)
    },
    // THIS WILL INSERT THE ATTENDEE INFORMATION AND SEND ATTENDEE ID DOWN TO THE NEXT FUNCTION
    function(eventsData, callback) {
      return knex('attendees')
        .insert([ {first_name: userFirstName, last_name: userLastName, email: userEmail} ])
        .returning('id')
        .then((response) => callback(null, [response, eventsData]))
        .catch(callback)
    },
    // THIS WILL INSERT THE CURRENT EVENTS INFORMATION AND SEND THE EVENT ID AND ATTENDEE ID DOWN TO THE NEXT FUNCTION
    function(attendeeID, callback){
      const eventData = attendeeID[1][0];
      return knex('events')
        .insert([ {title: eventData.title,
          date: eventData.date.toString().slice(0, 15),
          description: eventData.description,
          uniqueurl: eventData.uniqueurl,
          attendees_id: attendeeID[0][0]}
        ])
        .returning('id')
        .then((response) => callback(null, [response, attendeeID[0]]))
        .catch(callback)
    },
    // THIS WILL JOIN THE EVENT TIMES TABLE AND THE EVENTS TABLE JUST TO GET THE TIMES OF THE EVENTS
    // ALSO SENDS THE ATTENDEE ID AND EVENT ID DOWN TO THE NEXT FUNCTION
    function(eventTimesJoiningEvents, callback){
      return knex('event_times')
        .join('events', 'events.id', '=', 'event_times.event_id')
        .select('times')
        .then((response) => callback(null, [response, eventTimesJoiningEvents]))
        .catch(callback)
    },
    // THIS WILL INSERT THE TIME AND THE EVENT ID INTO THE EVENT TIMES TABLE
    // ALSO SENDS THE ATTENDEE ID AND THE EVENT TIMES ID DOWN TO THE NEXT FUNCTION
    function(timesIntoEventTimes, callback){
      const eventsID = timesIntoEventTimes[1][0][0];
      const eventTimes = timesIntoEventTimes[0];
      return knex('event_times')
        .insert([ {times: eventTimes[0].times, event_id: eventsID},
          {times: eventTimes[1].times, event_id: eventsID},
          {times: eventTimes[2].times, event_id: eventsID}
        ])
        .returning('id')
        .then((response) => callback(null, [response, timesIntoEventTimes[1][1][0]] ))
        .catch(callback)
    },
    // THIS WILL INSERT THE USER RESPONSE AND REFERENCE THE EVENT TIMES ID AND ATTENDEE ID
    function(userResponse, callback){
      const eventTimesID = userResponse[0];
      return knex('response')
        .insert([ {response: going1, attendees_id: userResponse[1], event_times_id: eventTimesID[0]},
          {response: going2, attendees_id: userResponse[1], event_times_id: eventTimesID[1]},
          {response: going3, attendees_id: userResponse[1], event_times_id: eventTimesID[1]}
        ])
        .then((response) => callback(null, "done"))
    }
  ],
  function(err, result){
    if (err){
      console.log("Failed to insert to waterfall!");
    } else {
      console.log("Successful insert into waterfall!");
    }
  })

  res.redirect(`/`);
  });
  return router;
}
