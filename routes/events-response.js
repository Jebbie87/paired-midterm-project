'use strict';

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  router.get('/uniqueurl', (req, res) => {
    res.render('./events/response-page');
  });

  router.post('/uniqueurl', (req, res) => {

  })

  return router;

};
