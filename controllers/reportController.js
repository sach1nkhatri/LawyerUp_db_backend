const Report = require('../models/Report');

exports.submitReport = async (req, res) => {
    console.log('Incoming report body:', req.body); // 🔍 Log incoming data
  
    const { user, message } = req.body;
  
    if (!user || !message) {
      return res.status(400).json({ error: 'Missing user or message.' });
    }
  
    try {
      const report = new Report({ user, message });
      await report.save();
      res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
      console.error('Report save error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};