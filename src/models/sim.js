/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

const DataRemainingSchema = new mongoose.Schema({
  date: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, autoform: {omit: true}  },
  bytes: {type: Number, optional: false }
});

/**
 * SIM schema
 */
const SimSchema = new mongoose.Schema({
  lock_serial_no: {type: String, optional: true },
  state: {type: String, optional: true},        //The "state" (eg TestProductive)
  product: {type: String, optional: true},      //The "offer" (eg LINKA Pro 1)
  country: {type: String, optional: true},      //The country (eg US)
  module: {type: String, optional: true},      //The "module type" (eg SARA R4 CAT1)
  imsi: {type: String, optional: true},
  iccid: {type: String, optional: true},
  imei: {type: String, optional: true},
  data: {type: [DataRemainingSchema], optional: true},
  activation_date: { type: Date, optional: true },    //Meant for Prepaid to track when the SIM data plan will expire
  createdAt: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, autoform: {omit: true}  },
  modifiedAt: {type: Date, autoValue: function() { return new Date; }, autoform: {omit: true}  }
}, { timestamps: true });


/**
 * Statics
 */
SimSchema.statics = {
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

module.exports = mongoose.model('sim', SimSchema);
