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
    const date = req.body.date;

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
  //   knex("attendees")
  //     .insert([{first_name: firstName, last_name: lastName, email: email}])
  //     .then(() => {
  //       console.log("Success brah!");
  //       // res.redirect("/uniqueURL")
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => {
  //       knex.destroy();
  //     })
  // })
