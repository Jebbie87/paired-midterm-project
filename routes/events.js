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

    // const uniqueURL =

    return knex("events")
      .insert([{title: title, date: date, description: description}])
      .returning("id")
      .then((response) => {
        return knex("event_times")
            .insert([{times: time1, times: time2, times: time3, event_id: response[0]}])
          .then(() => {
            console.log("Events Success!");
            // res.redirect("/uniqueURL")
          })
          .catch((err) => {
            console.log(err);
      })
      .then(() => {
        console.log("Success!");
      })
      .catch((err) => {
        console.log(err);
      })

    knex("attendees")
      .insert([{first_name: firstName, last_name: lastName, email: email}])
      .then(() => {
        console.log("Attendees Success!");
        // res.redirect("/uniqueURL")
      })
      .catch((err) => {
        console.log(err);
      })
      // .finally(() => {
      //   knex.destroy();
      // })
    })
    res.redirect("/");
  })
  return router;
}
