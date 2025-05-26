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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [
    {
      user: { type: String, required: true },
      comment: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });


module.exports = mongoose.model('Lawyer', lawyerSchema);
