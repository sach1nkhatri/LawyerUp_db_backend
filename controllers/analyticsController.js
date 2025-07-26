const Booking = require('../models/Booking');
const User = require('../models/User');
const ManualPayment = require('../models/ManualPayment');

const emitAnalytics = async (io) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await ManualPayment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    io.emit('analytics:update', {
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error('Analytics Emit Error:', err);
  }
};

module.exports = { emitAnalytics };
