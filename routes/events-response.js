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

const checkUser = function(result) {
    if (result.length >= 1) {
     return true;
   }
 }

 const checkCorrectURL = function(result) {
   if (result.length >= 1) {
    return true;
  }
}

module.exports = (knex) => {

  router.get('/:uniqueurl', (req, res) => {
    let uniqueURL = req.params.uniqueurl;
    let templateVar = {
      message: [],
      uniqueurl: uniqueURL
    };

  knex('attendees')
    .join('response', 'attendees.id', '=', 'response.attendees_id')
    .join('event_times', 'event_times.id', '=', 'response.event_times_id')
    .join('events', 'event_times.id', '=', 'events.id')
    .select()
    // .where('event_times.id', 'response.event_times_id')
    // .where('events.uniqueurl', uniqueURL)
    // .andWhere('response.response', '1')
    .then(function(data) {
      // console.log(data)
      // console.log("data: ", data)
      // data.forEach(function(user) {
      //   console.log("user: ", user)
      //   let slicedDate = user.date.toString().slice(0, 15);
      //   templateVar.message.push(`${user.first_name} ${user.last_name} will be attending ${user.title} on ${slicedDate} at ${user.times}`);
      // })
    })

  knex('response')
    .join('events', 'events.attendees_id', '=', 'response.attendees_id')
    .join('attendees', 'attendees.id', '=', 'events.attendees_id')
    .join('event_times', 'event_times.id', '=', 'response.event_times_id')
    .select()
    .where('events.uniqueurl', uniqueURL)
    .then(function(displayAllUserResponse) {
      displayAllUserResponse.forEach(function(userResponse) {
        let firstName = userResponse.first_name;
        let lastName = userResponse.last_name;
        let eventTitle = userResponse.title;
        let eventDate = userResponse.date.toString().slice(0, 15);
        let eventTimes = userResponse.times;

        if (userResponse.response === 1){
          templateVar.message.push(`${firstName} ${lastName} for ${eventTimes}`);
        } else {
          templateVar.message.push(`${firstName} ${lastName} cannot make it for ${eventTimes}`);
        }
      })

      // knex('response')
      //   .join('events', 'events.attendees_id')
    })



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
            templateVar[`pageTime${counter}`] = time.times
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
        .where({first_name: userFirstName, last_name: userLastName, email: userEmail})
        .then ((data) => {
            const id = data[0].id
            if (!checkUser(data)) {
              // throw new Error("User not found")
          }
          return id
        })
       .then((attendeeID) => {
         console.log("THIS IS THE ATTENDEE ID", attendeeID);
         knex("attendees")
        //  .join("events", "attendees.id", "=", "events.attendees_id")
        .fullOuterJoin("response", "attendees.id", "=", "response.attendees_id")
         .fullOuterJoin("event_times", "response.event_times_id", "=", "event_times.event_id")
         .select()
         .where("attendees.id", attendeeID)
         .then ((attendeeData) => {
            console.log("THIS IS THE DATA AFTER ALL OF THE JOINS", attendeeData);
            console.log("THIS IS THE DATA AFTER ALL OF THE JOINS 1", attendeeData[0]);
            console.log("THIS IS THE DATA AFTER ALL OF THE JOINS 2", attendeeData[0].times);
            console.log("THIS IS THE DATA AFTER ALL OF THE JOINS 3", attendeeData[0].event_id);

            return attendeeData;
         })
        //  .then((attendeeData) => {
        //    console.log("THIS IS THE DATA AFTER ALL OF THE JOINS 4", attendeeData);
        //    knex("event_times")
        //    .select()
        //    .where({times: attendeeData[0].times, event_id: attendeeData[0].event_id})
        //    .then ((data) => {
        //      console.log("THIS IS THE DATA BEFORE UPDATE", data)
        //       return data;
        //    })
        //  })
         .then((data) => {
           console.log("THIS IS DATA FOR UPDATE", data)
            knex("response")
            .where({attendees_id: data[0].id, event_times_id: data[0]["event_times_id"]})
            .update({response: going1})
            .then(function(whatIsThis) {
              return whatIsThis;
           })
         })
      })

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
  })
  });
  return router;
};
