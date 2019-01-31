/* TODO: REMOVE at some point.  This was created by boilerplate project */
const User = require('models/user.model')
  , Task = require('models/task.model')
  , helpers = require('util/helpers');

const {handle, handleErr} = helpers.handlers('User', 'users')
  , id = helpers.id;

/**
 * Get user tasks
 */
function getUserTasks(req, res, next) {
  Task.findByUserId(id(req))
    .then(tasks => res.json(tasks) )
    .catch(err => handleErr(next, err, 'getUserTasks('+id(req)+')') );
}

module.exports = { get, create, update, list, remove, getUserTasks };
