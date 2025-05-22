const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');
const { generateAvailableSlots } = require('../utils/slotUtils');

// 📌 Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// 📌 Get all bookings for a user with populated lawyer data
// GET /api/bookings/user/:userId
exports.getBookingsByUser = async (req, res) => {
    try {
      const bookings = await Booking.find({ user: req.params.userId })
        .populate('user', 'fullName email contactNumber role') // 👤 Client info
        .populate('lawyer', 'fullName email contactNumber  specialization qualification profilePhoto role') // 👨‍⚖️ Lawyer info
        .populate('lawyerList', 'specialization qualification contact phone rate profilePhoto schedule'); // 📋 Lawyer listing (user-facing card)
  
      res.json(bookings);
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      res.status(500).json({ message: 'Failed to fetch user bookings' });
    }
  };
  
  
  
  
  

// 📌 Get all bookings for a lawyer with populated user data
exports.getBookingsByLawyer = async (req, res) => {
    try {
      const bookings = await Booking.find({ lawyer: req.params.lawyerId })
        .populate('user', 'fullName email contactNumber')
        .populate('lawyer', 'fullName email phone specialization qualification address profilePhoto');
      res.json(bookings);
    } catch (error) {
      console.error('Failed to fetch lawyer bookings:', error);
      res.status(500).json({ message: 'Failed to fetch lawyer bookings' });
    }
  };
  

// 📌 Generate available time slots for booking
exports.getAvailableSlots = async (req, res) => {
  try {
    const { lawyerId, date, duration } = req.query;

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });

    const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const availability = lawyer.schedule[weekday] || [];

    const existingBookings = await Booking.find({ lawyer: lawyerId, date });

    const slots = generateAvailableSlots(availability, existingBookings, parseInt(duration));
    res.json(slots);
  } catch (err) {
    console.error("Slot generation failed:", err);
    res.status(500).json({ message: 'Failed to generate available slots' });
  }
};

// 📌 Update booking status (approve, complete, cancel)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update booking status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// 📌 Update the meeting link
exports.updateMeetingLink = async (req, res) => {
  try {
    const { meetingLink } = req.body;
    const updated = await Booking.findByIdAndUpdate(req.params.id, { meetingLink }, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update meeting link:', error);
    res.status(500).json({ message: 'Failed to update link' });
  }
};
// ❌ Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
      await Booking.findByIdAndDelete(req.params.id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
      console.error('Delete failed:', err);
      res.status(500).json({ message: 'Failed to delete booking' });
    }
  };
  