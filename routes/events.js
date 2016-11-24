"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  router.get("/new", (req, res) => {
    res.render("./events/new")
  })

  router.post("/", (req, res) => {
    const title = req.body.title;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const description = req.body.description;
    const date = req.body.date;
    knex("events")
      .insert([{title: title, date: date, description: description}])
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        knex.destroy();
      })

    knex("attendees")
      .insert([{first_name: firstName, last_name: lastName, email: email}])
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        knex.destroy();
      })
  })

  return router;
}
