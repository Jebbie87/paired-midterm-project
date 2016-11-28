// server side

'use strict';

const express = require('express');
const router  = express.Router();
const waterfall = require('async-waterfall');
let counter = {
  counter1: 0,
  counter2: 0,
  counter3: 0,
  message: []
};

module.exports = (knex) => {

  router.get('/:uniqueurl', (req, res) => {
    let uniqueURL = req.params.uniqueurl;
    let templateVar = {
      message: [],
      uniqueurl: uniqueURL
    };

//gets times
  knex('response')
    .join('events', 'events.attendees_id', '=', 'response.attendees_id')
    .join('attendees', 'attendees.id', '=', 'events.attendees_id')
    .join('event_times', 'event_times.id', '=', 'response.event_times_id')
    .select()
    .where('events.uniqueurl', uniqueURL)
    .then(function(displayAllUserResponse) {
      let userResponseTime = {};
      displayAllUserResponse.forEach(function(userResponse) {
        let firstName = userResponse.first_name;
        let lastName = userResponse.last_name;
        let eventTitle = userResponse.title;
        let eventDate = userResponse.date.toString().slice(0, 15);
        let eventTimes = userResponse.times;
        let attendeeID = userResponse.attendees_id;
        let response = userResponse.response;

        if(!userResponseTime[attendeeID]) {
          userResponseTime[attendeeID] = {};
        }
        if (!userResponseTime[attendeeID][response]) {
          userResponseTime[attendeeID][response] = [];
        }
        userResponseTime[attendeeID][response].push(eventTimes);
      })
      return userResponseTime;
    }) // closes knex('response') .then
    .then(function(userTimes) {
      // makes message
      knex('events')
      .join('attendees', 'events.attendees_id', '=', 'attendees.id')
      .select()
      .then(function(users) {

        users.forEach(function(user) {
          let message = '';
          if (!userTimes[user.id]['0']){
            message = `${user.first_name} ${user.last_name} will be making it to this event!`;
          } else if (!userTimes[user.id]['1']) {
            message = `${user.first_name} ${user.last_name} will NOT be making it to this event!`;
          } else {
            message += `${user.first_name} ${user.last_name} can make it to`;
            if (userTimes[user.id]['1']) {
              userTimes[user.id]['1'].forEach(function(goingTimes){
                message += ` ${goingTimes},`;
              })
            }
            message = `${message.substring(0, message.length - 1)} and cannot make it to`;
            if (userTimes[user.id]['0']){
              userTimes[user.id]['0'].forEach(function(notGoingTimes) {
                message += ` ${notGoingTimes},`;
              })
            }
            message = `${message.substring(0, message.length - 1)}.`;
          }
          templateVar.message.push(message);
        }) // closes users.forEach
      }) // closes the knex('events') .then
    }) // closes .then(function(userTimes))


  knex('events')
    .join('event_times', 'event_times.id', '=', 'events.id')
    .returning('id')
    .where('events.uniqueurl', uniqueURL)
    .select()
    .then(function(id){
      templateVar.description = id[0].description;
      templateVar.eventTitle = id[0].title;
      templateVar.eventDate = id[0].date.toString().slice(0, 15);
      knex('event_times')
        .select('times')
        .where('event_times.event_id', id[0].id)
        .then(function(data) {
          let counter = 0;
          data.forEach(function(time) {
            counter++;
            templateVar[`pageTime${counter}`] = time.times;
          });
          res.render('./events/response-page', templateVar);
        })
    })

  });

  // THIS IS THE POST REQUEST TO THE UNIQUE URL
  router.post('/:uniqueurl', (req, res) => {
    const going1 = Number(req.body.going1);
    const going2 = Number(req.body.going2);
    const going3 = Number(req.body.going3);
    const userFirstName = req.body["first-name"];
    const userLastName = req.body["last-name"];
    const userEmail = req.body["user-email"];

    knex("attendees")
      .select()
      .where({first_name: userFirstName,
        last_name: userLastName,
        email: userEmail
      }) // closes attendees where
      .then(function(attendeeID) {

        if (attendeeID.length >= 1){
        knex('events')
          .join('attendees', 'events.attendees_id', '=', attendeeID[0].id)
          .select('events.id')
          .where('events.uniqueurl', req.body.hiddenURL)
          .then(function(eventID) {
              knex('event_times')
                .select('id')
                .where('event_times.event_id', eventID[0].id)
                .then(function(allEventTimesID){
                  let counter = 0;
                  allEventTimesID.forEach(function(timeID){
                    counter++;
                    knex('response')
                      .update('response', Number(req.body[`going${counter}`]))
                      .where('attendees_id', attendeeID[0].id)
                      .andWhere('event_times_id', timeID.id)
                      .then(function(result){
                        console.log('Successfully updated person');
                      })
                  })// this closes the allEventTimesID.forEach
                  res.redirect(`/events/${req.params.uniqueurl}`);
                }) // this is the .then(function(allEventTimesID))
          })// this closes the function(eventID)
        } else {

          waterfall([
          // THIS WILL GET THE TABLE OF THE CURRENT EVENT
          function(callback) {
            return knex('events')
              .select()
              .where('events.uniqueurl', req.params.uniqueurl)
              .then((response) => callback(null, response))
              .catch(callback)
          },
          // THIS WILL INSERT THE ATTENDEE INFORMATION AND SEND ATTENDEE ID DOWN TO THE NEXT FUNCTION
          function(eventsData, callback) {
            return knex('attendees')
              .insert([{
                first_name: userFirstName,
                last_name: userLastName,
                email: userEmail
              }])
              .returning('id')
              .then((response) => callback(null, [response, eventsData]))
              .catch(callback)
          },
          // THIS WILL INSERT THE CURRENT EVENTS INFORMATION AND SEND THE EVENT ID AND ATTENDEE ID DOWN TO THE NEXT FUNCTION
          function(attendeeID, callback){
            const eventData = attendeeID[1][0];
            return knex('events')
              .insert([{
                title: eventData.title,
                date: eventData.date.toString().slice(0, 15),
                description: eventData.description,
                uniqueurl: eventData.uniqueurl,
                attendees_id: attendeeID[0][0]
              }])
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
            const eventTimes = timesIntoEventTimes[0];
            const eventsID   = timesIntoEventTimes[1][0][0];
            const attendeeID = timesIntoEventTimes[1][1][0];
            return knex('event_times')
              .insert([
                {times: eventTimes[0].times, event_id: eventsID},
                {times: eventTimes[1].times, event_id: eventsID},
                {times: eventTimes[2].times, event_id: eventsID}
              ])
              .returning('id')
              .then((response) => callback(null, [response, attendeeID]))
              .catch(callback)
          },
          // THIS WILL INSERT THE USER RESPONSE AND REFERENCE THE EVENT TIMES ID AND ATTENDEE ID
          function(userResponse, callback){
            const eventTimesID = userResponse[0];
            const attendeeID = userResponse[1];
            return knex('response')
              .insert([
                {response: going1, attendees_id: attendeeID, event_times_id: eventTimesID[0]},
                {response: going2, attendees_id: attendeeID, event_times_id: eventTimesID[1]},
                {response: going3, attendees_id: attendeeID, event_times_id: eventTimesID[2]}
              ])
              .then((response) => callback(null, "done"))
          }
        ],
        function(err, result){
          if (err){
            console.log("Failed to insert to waterfall!");
          } else {
            console.log("Successful insert into waterfall!");
            res.redirect(`/events/${req.params.uniqueurl}`);
          }
        }) // this closes the waterfall
      } // closes the if statement
    }) // closes the very top then call
  }); // this closes the router.post

  return router;
};
