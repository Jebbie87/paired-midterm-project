"use strict";

const express = require('express');
const router  = express.Router();

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
    const date1 = req.body.date1;
    const date2 = req.body.date2;
    const date3 = req.body.date3;

    // const uniqueURL =

    knex("events")
      .insert([{title: title, date: date, description: description}])
      .then(() => {
        knex("attendees")
          .insert([{first_name: firstName, last_name: lastName, email: email}])
          .then(() => {
            console.log("Success brah!");
            // res.redirect("/uniqueURL")
          })
          .catch((err) => {
            console.log(err);
          })
          // .finally(() => {
          //   knex.destroy();
          // })
      })
      .then(() => {
        console.log("Success brah!");
        // res.redirect("/uniqueURL")
      })
      .catch((err) => {
        console.log(err);
      })
      // .finally(() => {
      //   knex.destroy();
      // })
      res.redirect("/");
  })
  return router;
}
