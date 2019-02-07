/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * RentalLock schema
 */
const RentalLockSchema = new mongoose.Schema({
  starting_location:{ type: [Number], optional: true },
  ending_location:{ type: [Number], optional: true },
  start_date: { type: Date, optional: true },
  end_date: { type: Date, optional: true },
  initial_end_date: { type: Date, optional: true },
  initial_ending_location:{ type: [Number], optional: true },
  merchantlock: {type: String, optional: true},
  merchantlock_serial_no: {type: String, optional: true},
  merchantlock_lock_number: {type: String, optional: true},
});

/**
 * Rental schema
 */
const RentalSchema = new mongoose.Schema({
  merchant_id: {type: String, optional: true},
  reservation_start_date: { type: Date, optional: true },
  reservation_canceled: {type: Boolean, optional: true, defaultValue: false },
  start_date: { type: Date, optional: true }, //deprecated
  end_date: { type: Date, optional: true }, //deprecated
  advance_reservation_start_date: { type: Date, optional: true }, // If we're on an advance reservation, note the start and end times
  advance_reservation_end_date: { type: Date, optional: true }, // If we're on an advance reservation, note the start and end times
  user_id: { type: String, optional: true },
  user_profile_id: { type: String, optional: true },
  name: {type: String, optional: true},
  user_email: {type: String, optional: true},
  merchantlock: {type: String, optional: true}, //deprecated
  merchantlock_serial_no: {type: String, optional: true}, //deprecated
  merchantlock_lock_number: {type: String, optional: true}, //deprecated
  initial_rate: { type: Number, optional: true, decimal: true },  // Initial Fee, if any
  initial_rate_formatted: { type: String, optional: true },  // Display value (formatted)
  initial_duration: { type: Number, optional: true, decimal: false }, // Initial Fee duration, should be increments of 15 minutes
  rate: { type: Number, optional: true, decimal: true },  // Ongoing rate
  rate_formatted: { type: String, optional: true },  // Display value (formatted)
  duration: { type: Number, optional: true, decimal: false },  // Ongoing rate duration, should be increments of 15 minutes
  plan_type: {type: String, optional: true},  // Lets us know if this was 1. payg (Pay As You Go), 2. subs (Subscription), or advr (Advance Reservation)
  total_fare: { type: Number, optional: true, decimal: true },  // Total amount charged to user at end of rental
  total_fare_formatted: { type: String, optional: true },  // Display value (formatted)
  fare_canceled: { type: Boolean, optional: true, defaultValue: false },
  needs_attention: { type: Boolean, optional: true, defaultValue: false }, // If there is a payment issue manual intervention might be necessary
  starting_location:{ type: [Number], optional: true }, //deprecated
  ending_location:{ type: [Number], optional: true }, //deprecated
  route: {type: Object, blackbox:true, optional:true}, // SimpleSchema is broken, inserts all coordinates as 'null' unless we use blackbox - This is the GPS route
  payment_stripe: {type: Object, blackbox:true, optional:true}, // Keep this a black box because we'll be storing various stripe api responses here
  createdAt: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, autoform: {omit: true}  },
  modifiedAt: {type: Date, autoValue: function() { return new Date; }, autoform: {omit: true}  },
  locks:{ type: [RentalLockSchema], optional: true },
  rental_ended: { type: Boolean, optional: true, defaultValue: false },
  prepay: { type: Boolean, optional: true, defaultValue: false }, // If we are prepay using account balance

}, { timestamps: true });


/**
 * Statics
 */
RentalSchema.statics = {
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

module.exports = mongoose.model('rental', RentalSchema);
