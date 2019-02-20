/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * User schema
 */
const MerchantLockSchema = new mongoose.Schema({
  merchant_id: {type: String, optional: true},
  name: {type: String, optional: true},
  user_id: {type: String, optional: true},
  user_email: {type: String, optional: true},
  lock_battery_percent: {type: Number, optional: true, decimal: true},
  lock_serial_no: {type: String, optional: true},
  latitude: {type: Number, optional: true, decimal: true, defaultValue: 0},
  longitude: {type: Number, optional: true, decimal: true, defaultValue: 0},
  is_locked: {type: Boolean, optional: true, defaultValue: false},
  is_suspended: {type: Boolean, optional: true, defaultValue: false},
  is_key_registered: {type: Boolean, optional: true, defaultValue: false},
  is_key_revoked: {type: Boolean, optional: true, defaultValue: false},
  access_key_master: {type: String, optional: true, autoform: {readonly: true} },
  access_key_admin: {type: String, optional: true, autoform: {readonly: true} },
  access_key_user: {type: String, optional: true, autoform: {readonly: true} },
  access_key_master_2: {type: String, optional: true, autoform: {readonly: true} },
  access_key_admin_2: {type: String, optional: true, autoform: {readonly: true} },
  access_key_user_2: {type: String, optional: true, autoform: {readonly: true} },
  v2_access_key_admin: {type: String, optional: true, autoform: {readonly: true} },
  v2_access_key_user: {type: String, optional: true, autoform: {readonly: true} },
  v2_access_key_admin_2: {type: String, optional: true, autoform: {readonly: true} },
  v2_access_key_user_2: {type: String, optional: true, autoform: {readonly: true} },
  removed: {type: Boolean, optional: true, defaultValue: false  },
  removedAt: {type: Date, optional: true   },
   location:{ 
    "type" : {type: String, optional: true, defaultValue:"Point"},  
    "coordinates" : [Number] 
  },
  lock_number:{ type: Number, optional: true },
  qr_code:{ type: String, optional: true },
  subs_initial_rate: { type: Number, optional: true, decimal: false },  // Override for subscription initial rate should be expressed as the smallest currency available (i.e. 123 would be 123 yen, or 1.23 dollars)
  subs_initial_rate_formatted: { type: String, optional: true },  // Display value (formatted)
  subs_rate: { type: Number, optional: true, decimal: false },  // Override for subscription additional rate should be expressed as the smallest currency available (i.e. 123 would be 123 yen, or 1.23 dollars)
  subs_rate_formatted: { type: String, optional: true },  // Display value (formatted)
  payg_initial_rate: { type: Number, optional: true, decimal: false },  // Override for pay as you go initial rate should be expressed as the smallest currency available (i.e. 123 would be 123 yen, or 1.23 dollars)
  payg_initial_rate_formatted: { type: String, optional: true },  // Display value (formatted)
  payg_rate: { type: Number, optional: true, decimal: false },  // Override for pay as you go additional rate should be expressed as the smallest currency available (i.e. 123 would be 123 yen, or 1.23 dollars)
  payg_rate_formatted: { type: String, optional: true },  // Display value (formatted)
  rental_bitmask: { type: Number, optional: true },  // bit 1-> reserved, bit2 -> on rental, bit3->rental paused
  reservation_start_date: { type: Date, optional: true },
  rental_start_date: { type: Date, optional: true },
  rental_end_date: { type: Date, optional: true },
  rental_user_id: { type: String, optional: true },
  rental_id: { type: String, optional: true },
  maintenance_required: { type: Boolean, optional: true },
  maintenance_uuid: { type: String, optional: true },
  maintenance_status: { type: String, optional: true },
  maintenance_reason: { type: String, optional: true },
  maintenance_user_id: { type: String, optional: true },
  maintenance_date: { type: Date, optional: true }
},{timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }});


/**
 * Statics
 */
MerchantLockSchema.statics = {
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

module.exports = mongoose.model('merchantlocks', MerchantLockSchema);
