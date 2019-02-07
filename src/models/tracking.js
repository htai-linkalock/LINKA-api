/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Tracking schema
 */


const TrackingSchema = new mongoose.Schema({
  lock_serial_no: {type: String, optional: true },
  tracking_mode: {type: Number, optional: true },         //Tracking Mode
  iOT_reason: {type: String, optional: true },
  createdAt: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, autoform: {omit: true}  },
  modifiedAt: {type: Date, autoValue: function() { return new Date; }, autoform: {omit: true}  },
  lock_id: {type: String, optional: true },
  merchantlock: {type: String, optional: true},
  carrier: {type: String, optional: true},
  rssi: {type: Number, optional: true},
  rat: {type: Number, optional: true},              //Radio access technology
  tracking_status: {type: Number, optional: true},    //1 = tracking active, 0 = tracking ended
  tracking_start_date: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, autoform: {omit: true}  },
  tracking_end_date: { type: Date, optional: true },
  data_available: {type: Number, optional: true},
  gps_fixes : {type: Number, optional: true, defaultValue: 0},
}, { timestamps: true });


/**
 * Statics
 */
TrackingSchema.statics = {
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

module.exports = mongoose.model('tracking', TrackingSchema);
