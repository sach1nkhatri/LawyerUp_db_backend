const Lawyer = require('../models/Lawyer');

// CREATE Lawyer with base64 image + pdf
exports.createLawyer = async (req, res) => {
  try {
    const {
      fullName,
      specialization,
      email,
      phone,
      state,
      city,
      address,
      qualification,
      schedule,
      profilePhoto,   // base64 string
      licenseFile     // base64 string
    } = req.body;

    const newLawyer = new Lawyer({
      fullName,
      specialization,
      email,
      phone,
      state,
      city,
      address,
      qualification,
      schedule: typeof schedule === 'string' ? JSON.parse(schedule) : schedule,
      profilePhoto,
      licenseFile,
    });

    await newLawyer.save();
    res.status(201).json({ message: 'Application submitted', lawyer: newLawyer });
  } catch (error) {
    console.error('Error creating lawyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET Lawyer by ID
exports.getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) return res.status(404).json({ message: 'Not found' });
    res.json(lawyer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lawyer' });
  }
};

// PUT: Update entire lawyer profile
exports.updateLawyer = async (req, res) => {
  try {
    const updated = await Lawyer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed' });
  }
};

// PATCH: Update status (e.g. to "hold")
exports.updateStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const allowedByAdmin = ['pending', 'verified', 'hold', 'disabled'];
      const allowedByUser = ['hold'];
  
      const isAdmin = req.user?.role === 'admin'; // You can attach role during auth
      const allowedStatuses = isAdmin ? allowedByAdmin : allowedByUser;
  
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ message: 'Not authorized to set this status' });
      }
  
      const updated = await Lawyer.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
  
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: 'Status update failed' });
    }
  };
  

// DELETE: Remove lawyer profile
exports.deleteLawyer = async (req, res) => {
  try {
    const deleted = await Lawyer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Lawyer profile deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.getAllLawyers = async (req, res) => {
    try {
      const lawyers = await Lawyer.find();
      res.json(lawyers);
    } catch (error) {
      console.error("Failed to fetch lawyers:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };