const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true }); // ✅ enable automatic createdAt + updatedA

module.exports = mongoose.model('Report', reportSchema);

