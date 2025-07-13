const Payment = require('../models/payment');
const path = require('path');

// Create new payment
exports.submitManualPayment = async (req, res) => {
  try {
    const { plan, amount, method, duration } = req.body;
    const userId = req.user._id;
    const filePath = req.file?.path;

    if (!filePath) return res.status(400).json({ error: 'Screenshot is required' });

    const days = {
      daily: 1,
      weekly: 7,
      monthly: 30
    }[duration.toLowerCase()] || 30;

    const validUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const payment = await Payment.create({
      user: userId,
      plan,
      amount,
      method,
      screenshot: filePath.replace(/\\/g, '/'),
      validUntil
    });

    res.status(201).json({ message: 'Payment submitted', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin approval
exports.approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment approved', payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve payment' });
  }
};

// Admin rejection
exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment rejected', payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject payment' });
  }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'fullName email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
exports.getUserLatestPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: 'No payment found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user payment' });
  }
};
