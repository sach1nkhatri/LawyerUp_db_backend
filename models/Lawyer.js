const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const lawyerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  specialization: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  state: String,
  city: String,
  address: String,
  qualification: String,
  profilePhoto: String, // store filename or cloud URL
  licenseFile: String,  // store filename or cloud URL
  status: {
    type: String,
    enum: ['pending', 'verified', 'hold', 'disabled'],
    default: 'pending'
  },  
  schedule: {
    type: Map,
    of: [timeSlotSchema],
    default: {},
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Lawyer', lawyerSchema);
