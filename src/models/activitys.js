/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * User schema
 */
const ActivitysSchema = new mongoose.Schema({
  userProfile_id:{ type: Schema.Types.ObjectId, ref:"userProfile" },
  uuid: {type: String, optional: true},
  platform: {type: String, optional: true },
  os_version: {type: String, optional: true },
  fw_version: {type: String, optional: true },
  api_version: {type: String, optional: true },
  actuations: {type: Number, optional: true, defaultValue: 0},
  temperature: {type: Number, optional: true, defaultValue: -100},
  sleep_lock_sec: {type: Number, optional: true },
  sleep_unlock_sec: {type: Number, optional: true },
  user_name: {type: String, optional: true},
  user_email: {type: String, optional: true},
  customer_id:{type: String, optional:true},
  lock_id:{ type: Schema.Types.ObjectId, ref:"lock" },
  lock_serial_no_index: {type: String, optional: true },
  record_date: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, optional: true, autoform: {readonly: true} },
  linka_activity_status: {type: Number, optional: true, defaultValue: 0},
  batteryPercent: {type: Number, optional: true, defaultValue: 0},
  timestamp: {type: String, optional: true},
  timestamp_locked: {type: String, optional: true},
  msg_title: {type: String, optional: true, autoform: {readonly: true} },
  msg_desc: {type: String, optional: true, autoform: {readonly: true} },
  pac: {type: Number, optional: true, defaultValue: 0},
  latitude: {type: Number, decimal: true, optional: true, autoform: {readonly: true} },
  longitude: {type: Number, decimal: true, optional: true, autoform: {readonly: true} },
  location:{ 
    "type" : {type: String, optional: true, defaultValue:"Point"},  
    "coordinates" : [Number] 
  },
  owner: { type: Schema.Types.ObjectId, ref:"user" },
  removed: {type: Boolean, optional: true, defaultValue: false, autoform: {omit: true}   },
  removedAt: {type: Date, optional: true, autoform: {omit: true}   },
  iot: {type: Boolean, optional: true },
  iot_reason: {type: String, optional: true },
  uncertainty: {type: Number, optional: true},
  numSatellites: {type: Number, optional: true},
  direction: {type: Number, optional: true},
  speed: {type: Number, optional: true},
  tracking_id: { type: Schema.Types.ObjectId, ref:"tracking" },
}, {timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }});

function validateUsername(username) {
  // we just require the user name begins with a letter (only for demomstration purposes ...)
  var re = /^[A-Z,a-z].*$/;
  return re.test(username);
}

/**
 * Statics
 */
ActivitysSchema.statics = {
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

module.exports = mongoose.model('activitys', ActivitysSchema);
