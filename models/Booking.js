// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 👤 Client who booked the appointment
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 👨‍⚖️ Actual lawyer (validated by role === 'lawyer')
    required: true
  },
  lawyerList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer', // 📋 Public profile listing (for display on user side)
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // HH:mm
    required: true
  },
  duration: {
    type: Number,
    default: 1,
    min: 1
  },
  mode: {
    type: String,
    enum: ['online', 'live'],
    default: 'online'
  },
  description: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending'
  },
  reviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Booking', bookingSchema);
