/*
  This was ported from the LINKA repo.  Was able to get this API to run
    curl -X GET http://localhost:3000/api/activitys?limit=10
*/
const mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * User schema
 */
const userProfileSchema = new mongoose.Schema({
  membership_type: {type: String, optional: true, autoform: {omit: true} , defaultValue: 'NORMAL'  },
  picture: {type: String, optional: true, autoform: {afFieldInput: {type: 'fileUpload', collection: 'Images'}}},
  name: {type: String, optional: true},
  email: {type: String, optional: true},
  email_verification: {type: String, optional: true},
  email_verified: {type: Boolean, optional: true, defaultValue: false, autoform: {omit: true}   },
  tel: {type: String, optional: true},
  language: {type: String, optional: true},
  seen_walkthrough: {type: Boolean, optional: true},
  first_name: {type: String, optional: true},
  last_name: {type: String, optional: true},
  payment_stripe: {type: Object, blackbox:true, optional:true}, // see payment_stripe.js for schema
  current_rate_plan: {type:Array , blackbox:true,optional:true},
  "current_rate_plan.$": {type:Object , blackbox:true,optional:true},
  promotions:{type:Array , blackbox:true,optional:true},
  "promotions.$":{type:Object , blackbox:true,optional:true},
  owner: {type: String, autoValue: function() { return INUPSERT(this, this.userId || self.userId) }, autoform: {omit: true} },
  removed: {type: Boolean, optional: true, defaultValue: false, autoform: {omit: true}   },
  removedAt: {type: Date, optional: true, autoform: {omit: true}   },
}, {timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }});


/**
 * Statics
 */
userProfileSchema.statics = {
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

module.exports = mongoose.model('userProfile', userProfileSchema);
