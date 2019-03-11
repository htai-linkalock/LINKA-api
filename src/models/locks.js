/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * User schema
 */
const LockSchema = new mongoose.Schema({
  name: {type: String, optional: true},
  userProfile_id:{type: Schema.Types.ObjectId, ref: 'userProfile'},
  user_name: {type: String, optional: true},
  user_email: {type: String, optional: true},
  serial_no: {type: String, optional: true},
  customer_id: {type: Schema.Types.ObjectId, ref: 'userProfile'},
  latitude: {type: Number, decimal: true, optional: true},
  longitude: {type: Number, decimal: true, optional: true},
  battery_percent: {type: Number, optional: true, decimal: true},
  is_locked: {type: Boolean, optional: false, optional: true, defaultValue: false},
  owner: { type: Schema.Types.ObjectId, ref:"user" },
  removed: {type: Boolean, optional: true, defaultValue: false, autoform: {omit: true}   },
  removedAt: {type: Date, optional: true, autoform: {omit: true}   },
  location:{ 
    "type" : {type: String, optional: true, defaultValue:"Point"},  
    "coordinates" : [Number] 
  }
}, {timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }});


/**
 * Statics
 */
LockSchema.statics = {
  /**
   * List users in ascending order of 'username'
   */
  list({ skip = "0", limit = "0" } = {}) {
    return this.find()
      .sort({ username: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
  }
};

module.exports = mongoose.model('lock', LockSchema);
