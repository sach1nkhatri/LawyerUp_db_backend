const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  fullName: String,
  specialization: String,
  email: String,
  phone: String,
  state: String,
  city: String,
  address: String,
  qualification: String,
  profilePhoto: String,
  licenseFile: String,
  schedule: Object,
  status: {
    type: String,
    enum: ['pending', 'verified', 'listed', 'hold', 'rejected', 'disabled'],
    default: 'pending'
  },
  user: {                             // ✅ link to the logged-in user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', lawyerSchema);
