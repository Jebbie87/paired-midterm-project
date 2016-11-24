"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  router.get("/new", (req, res) => {
    res.render("./events/new")
  })

  router.post("/", (req, res) => {
    const title = req.body.title;
    const name = req.body.name;
    const email = req.body.email;
    const description = req.body.description;
    knex("create_events")
      .insert([{name: title}])

    knex()

  })

  // router.get("/", (req, res) => {
  //   knex
  //     .select("*")
  //     .from("users")
  //     .then((results) => {
  //       res.json(results);
  //   });
  // });

  return router;
}
