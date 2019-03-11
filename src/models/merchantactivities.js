/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * User schema
 */
const MerchantActivitiesSchema = new mongoose.Schema({
  merchant_id:{type: Schema.Types.ObjectId, ref: 'merchant'},
  uuid: {type: String, optional: true},
  maintenance_uuid: {type: String, optional: true},  // Only used for LINKA GO Maintenance requests
  lock_serial_no: {type: String, optional: true },
  lock_number: {type: String, optional: true}, // For LINKA GO, Maintenance for now, should be all activities going forward TODO: Fix!
  platform: {type: String, optional: true },
  os_version: {type: String, optional: true },
  fw_version: {type: String, optional: true },
  api_version: {type: String, optional: true },
  pac: {type: Number, optional: true, defaultValue: 0},
  actuations: {type: Number, optional: true, defaultValue: 0},
  temperature: {type: Number, optional: true, defaultValue: -100},
  record_date: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, optional: true, autoform: {readonly: true} },
  linka_activity_status: {type: Number, optional: true, defaultValue: 0},
  battery_percent: {type: Number, optional: true, defaultValue: 0},
  timestamp: {type: String, optional: true},
  timestamp_locked: {type: String, optional: true},
  msg_desc: {type: String, optional: true, autoform: {readonly: true} },
  latitude: {type: Number, decimal: true, optional: true, autoform: {readonly: true} },
  longitude: {type: Number, decimal: true, optional: true, autoform: {readonly: true} },
  location:{ 
    "type" : {type: String, optional: true, defaultValue:"Point"},  
    "coordinates" : [Number] 
  },
  removed: {type: Boolean, optional: true, defaultValue: false, autoform: {omit: true}   },
  removedAt: {type: Date, optional: true, autoform: {omit: true} },
  iot: {type: Boolean, optional: true },
  iot_reason: {type: String, optional: true },
  uncertainty: {type: Number, optional: true},
  numSatellites: {type: Number, optional: true},
  direction: {type: Number, optional: true},
  speed: {type: Number, optional: true},
  tracking_id: {type: Schema.Types.ObjectId, ref: 'tracking'},
}, {timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }});


/**
 * Statics
 */
MerchantActivitiesSchema.statics = {
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

module.exports = mongoose.model('merchantactivities', MerchantActivitiesSchema);
