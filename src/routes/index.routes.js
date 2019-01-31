/*
  TODO:
    1.  Allow for custom routes for each API that have more advanced functions and uses other controllers
*/
const express = require('express')
  , router = express.Router();
const fs = require('fs');

const GenericController = require('../controllers/generic.controller.js');

const models = ["user", "task", "activitys"];

models.forEach(item => {

})

/* Load up all the generic models */
const MODEL_DIR = '../models/';
var modelsDir = __dirname + '/' + MODEL_DIR;
console.log("MODELS: " + modelsDir);
function loadModels(dir) {
  fs
    .readdirSync(dir)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
    	const modelName = file.split(".")[0];

		const modelFile = MODEL_DIR + modelName;
		
		const model = require(modelFile);

		const controller = new GenericController(modelName, model);

		//router.use('/' + item, require('routes/' + item + '.routes'));

		router.route('/' + modelName)
		  .get(controller.list)
		  .post(controller.create);

		router.route('/' + modelName + '/:id')
		  .get(controller.get)
		  .put(controller.update)
		  .delete(controller.remove);

    });
}

loadModels(modelsDir);


module.exports = router;
