/* TODO: REMOVE at some point.  This was created by boilerplate project */
const express = require('express')
  , router = express.Router()
  , userCtrl = require('controllers/user.controller');

router.route('/:id/tasks')
  .get(userCtrl.getUserTasks);

module.exports = router;
