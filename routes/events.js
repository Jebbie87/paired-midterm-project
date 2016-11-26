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
const checkUser = function(result) {
  if (result.length > 1) {
    return true;
  }
}
// const verifyUser = function (firstName, lastName, email, db) {
//   let areTheyRegistered = false;
//   db.forEach(function() {
//     if (firstName === attendeesDB[0].first_name && lastName === attendeesDB[0].last_name && email === attendeesDB[0].email)
//         areTheyRegistered = true;
//   })
//   return areTheyRegistered;
// };

let counter = {
  counter1: 0,
  counter2: 0,
  counter3: 0,
  message: []
};

module.exports = (knex) => {

<<<<<<< HEAD
  router.get("/login", (req, res) => {
    res.status(200).render("./events/login")
  })

  router.post("/login", (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    knex("attendees")
      .select()
      .where({first_name: firstName, last_name: lastName, email: email})
      .then (function(data) {
          if (!checkUser(data)) {
            throw new Error("User not found")
          }
          return data
        })
        .then((user) => {
          knec("events")// join grab event data        })

          return url;
          console.log("Successful login");
          res.redirect("/uniqueURL");
      })
      .catch(function(err) {
        res.status(401).send(err.message);
      })
    // if (verifyUser(firstName, lastName, email, data) {
    //   res.redirect("/");
    // } else {
    //   res.status(401).send("Check to see if your email and password are correct.");
    // };
  });
/********************** THIS IS THE GET AND POST REQUEST TO MAKING THE NEW EVENT ********************/
/********************** ANDREW'S WORK *******************/
  router.get("/new", (req, res) => {
    res.status(200).render("./events/new")
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
          .then(response => callback(null, response))
          .catch(callback)
      },
      //This function inserts data into the event_times table.
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
          .then(response => callback(null, "done"))
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
        res.status(200).redirect(`/events/${uniqueURL}`);
      }
    });
  });

  const counter = {
    time1: 0,
    time2: 0,
    time3: 0,
    message: []
  };

  router.get("/:uniqueurl", (req, res) => {
    knex("attendees")
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

  router.post("/:uniqueurl", (req, res) => {
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
    knex("attendees")
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
    console.log(templateVar)
    knex('attendees')
      .join('response', 'attendees.id', '=', 'response.attendees_id')
      .join('event_times', 'event_times.id', '=', 'response.event_times_id')
      .join('events', 'event_times.id', '=', 'events.id')
      .select()
      .where('response.response', '1')
      .then(function(data) {
        console.log('datea: ', data)
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
            res.status(200).render('./events/response-page', templateVar);
          })
      })
  });

  // THIS IS THE POST REQUEST TO THE UNIQUE URL
  router.post('/', (req, res) => {
    const time1 = Number(req.body.going1);
    const time2 = Number(req.body.going2);
    const time3 = Number(req.body.going3);
    const userFirstName = req.body['first-name'];
    const userLastName = req.body['last-name'];
    const userEmail = req.body['user-email'];

    counter.counter1 += time1;
    counter.counter2 += time2;
    counter.counter3 += time3;

    // inserting the attendee's first name, last name and email into the attendees table
    knex('attendees')
      .insert([ {first_name: userFirstName, last_name: userLastName, email: userEmail} ])
      .returning('id')
      .then(function(attendeesID) {
        console.log(attendeesID)
        let id = Number(attendeesID[0]);

        // inserting response and the attendee's id into the response table
        knex('response')
          .insert([ {response: time1, attendees_id: id},
            {response: time2, attendees_id: id},
            {response: time3, attendees_id: id}
          ])
          .then(function(results) {
            res.json(counter);
          })
          .catch(function(err) {
            console.log(err);
          })
      })
      .catch(function(err) {
        console.log(err);
      })
    res.redirect(`/events/${req.body.hiddenURL}`);
  });
  return router;
}
