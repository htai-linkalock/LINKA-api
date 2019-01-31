/*
  TODO:
    1.  Allow for custom controllers that have more advanced functions and routes
*/
const helpers = require('util/helpers');

/**
 * Get task
 */
function GenericController(modelName, Model) {
  const {handle, handleErr} = helpers.handlers(modelName, modelName + 's')
    , id = helpers.id;

  return {
    modelName: modelName,

    get : function(req, res, next) {
      Model.findById(id(req)).exec()
        .then(user => handle(req, res, user) )
        .catch(err => handleErr(next, err, 'get('+id(req)+')') );
    },

    /**
     * Create new 
     */
    create : function(req, res, next) {
      const model = new Model(req.body);

      model.save()
        .then(savedModel => res.json(savedModel))
        .catch(err => handleErr(next, err, 'post()') );
    },

    /**
     * Update existing
     */
    update : function(req, res, next) {
      Model.findByIdAndUpdate(id(req), req.body, {new: true}).exec()
        .then(item => handle(req, res, item) )
        .catch(err => handleErr(next, err, 'put('+id(req)+')') );
    },

    /**
     * Get list
     */
    list : function(req, res, next) {
      const { limit = "0", skip = "0" } = req.query;
      Model.list({ limit, skip })
        .then(models => res.json(models))
        .catch(err => handleErr(next, err, 'getAll()') );
    },

    /**
     * Delete list
     */
    remove : function(req, res, next) {
      Model.findByIdAndRemove(id(req)).exec()
        .then(model => handle(req, res, model) )
        .catch(err => handleErr(next, err, 'put('+id(req)+')') );
    }

  }
}




module.exports = GenericController;
