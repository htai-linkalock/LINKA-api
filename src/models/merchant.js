/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * User schema
 */
const MerchantSchema = new mongoose.Schema({
  name: {type: String, optional: true},
  friendly_name: {type: String, optional: true},
  linka_go : {type: Boolean, optional: true },
  rate_plan: {type: Array, optional:true, blackbox: true},
  /*"rate_plan.$":{type: Object, optional:true, blackbox: true}, */
  payments : {type : Boolean, optional: true },
  payments_configuration: {type: String, optional: true},
  payments_stripe_connect: {type: String, optional: true},
  reservation_duration: {type: Number, optional: true}, // Default is 10 minutes, but they can override - ad hoc reservation, not advance
  domain_name: {type: String, optional: true},
  domain_name_restriction: {type: String, optional: true}, // If bike share limits users to a particular domain name
  email_address_exclusion: {type: String, optional: true}, // Used in conjunction with domain_name_restriction, allows certain email addresses to be excluded from the domain name (i.e. contractors)
  email_address_restriction: {type: String, optional: true}, // Allow the bike share to restrict access to reserve/rent to a list of email addresses
  from_email: {type: String, optional: true},
  support_email: {type: String, optional: true},
  logo: {type: String, optional: true},
  icon: {type: String, optional: true},
  hex_code_1: {type: String, optional: true},
  hex_code_2: {type: String, optional: true},
  eula: {type: String, optional: true}, // End User License Agreement
  currency: {type: String, optional: true},
  hold_amount: {type: Number, optional: true, decimal: false},
  location:{ type: [Number], optional: true }, // 'home' location of merchant, used in finding bike share and zooming in on fleetview
  api_key: {type: String, optional: true},
  secret_key: {type: String, optional: true},
  access_token: {type: String, optional: true},
  access_token_expireAt: {type: Date, optional: true},
  user_access_token: {type: String, optional: true},  // Lower privilege level for LINKA GO
  access_count: {type: Number, optional: true, defaultValue: 0},
  lock_cap: {type: Number, optional: true},
  is_suspended: {type: Boolean, optional: true, defaultValue: false},
  multiple_bikes: {type: Boolean, optional: true, defaultValue: false},
  webhook: {type: String, optional: true},            //Webhook for merchant API
  createdAt: {type: Date, autoValue: function() { return INUPSERT(this, new Date); }, autoform: {omit: true}  },
  modifiedAt: {type: Date, autoValue: function() { return new Date; }, autoform: {omit: true}  },
  removed: {type: Boolean, optional: true, defaultValue: false, autoform: {omit: true}   },
  removedAt: {type: Date, optional: true, autoform: {omit: true}   }

}, { timestamps: true });


/**
 * Statics
 */
MerchantSchema.statics = {
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

module.exports = mongoose.model('merchant', MerchantSchema);
