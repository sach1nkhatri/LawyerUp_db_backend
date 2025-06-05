const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// 🔍 GET: Fetch a lawyer by email or phone
router.get('/by-user', async (req, res) => {
  try {
    const { email, contactNumber } = req.query;
    if (!email && !contactNumber) {
      return res.status(400).json({ message: 'Email or contactNumber is required' });
    }

    const lawyer = await Lawyer.findOne({
      $or: [
        email ? { email } : {},
        contactNumber ? { phone: contactNumber } : {},
      ],
    });

    if (!lawyer) {
      return res.status(404).json({ message: 'No lawyer application found.' });
    }

    res.status(200).json(lawyer);
  } catch (err) {
    console.error('Error in GET /by-user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✍️ POST: Create new lawyer application
router.post('/', auth, async (req, res) => {
  try {
    const newLawyer = new Lawyer({
      ...req.body,
      user: req.user._id,      // ✅ Link to user
      status: 'pending',       // ✅ Required for status panel
    });

    await newLawyer.save();
    res.status(201).json(newLawyer);
  } catch (err) {
    console.error('Error in POST /api/lawyers:', err);
    res.status(500).json({ message: 'Failed to create lawyer profile' });
  }
});

// 🛠 PUT: Update lawyer by ID
// 🛠 PUT: Update lawyer by ID (supports nested arrays + safety)
router.put('/:id', async (req, res) => {
  try {
    const updateFields = {
      ...req.body,
      education: Array.isArray(req.body.education) ? req.body.education : [],
      workExperience: Array.isArray(req.body.workExperience) ? req.body.workExperience : [],
    };

    const updated = await Lawyer.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating lawyer:', err);
    res.status(500).json({ message: 'Failed to update lawyer' });
  }
});


// ❌ DELETE: Remove lawyer by ID
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Lawyer.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    res.json({ message: 'Lawyer deleted successfully' });
  } catch (err) {
    console.error('Error deleting lawyer:', err);
    res.status(500).json({ message: 'Failed to delete lawyer' });
  }
});

// ✅ GET: All lawyers (for admin)
router.get('/', async (req, res) => {
  try {
    const lawyers = await Lawyer.find();
    res.status(200).json(lawyers);
  } catch (err) {
    console.error('Error fetching all lawyers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PATCH: Update lawyer status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedLawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    res.json({ message: `Status updated to ${status}`, data: updatedLawyer });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 GET: Current user's lawyer profile
router.get('/me', auth, async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ user: req.user._id })
      .populate('user', 'fullName email contactNumber');

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    res.status(200).json(lawyer);
  } catch (err) {
    console.error('Error fetching current lawyer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
