// at top
const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer');

// this route allows status check by email or phone
router.get('/by-user', async (req, res) => {
  try {
    const { email, contactNumber } = req.query;

    if (!email && !contactNumber) {
      return res.status(400).json({ message: 'Email or contactNumber is required' });
    }

    const filter = {};
    if (email) filter.email = email;
    if (contactNumber) filter.phone = contactNumber;

    const lawyer = await Lawyer.findOne(filter);

    if (!lawyer) {
      return res.status(404).json({ message: 'No lawyer application found.' });
    }

    res.status(200).json(lawyer);
  } catch (err) {
    console.error('Error in GET /by-user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// if you want, add your POST directly here too
router.post('/', async (req, res) => {
  try {
    const { email, phone, schedule } = req.body;

    const existing = await Lawyer.findOne({
      $or: [{ email }, { phone }]
    });

    if (existing) {
      return res.status(400).json({ message: 'User has already applied.' });
    }

    const newLawyer = new Lawyer({
      ...req.body,
      schedule: typeof schedule === 'string' ? JSON.parse(schedule) : schedule,
    });

    await newLawyer.save();
    res.status(201).json({ message: 'Application submitted', lawyer: newLawyer });
  } catch (error) {
    console.error('Error creating lawyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
