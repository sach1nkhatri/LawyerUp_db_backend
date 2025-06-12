const Pdf = require('../models/pdf');
const path = require('path');

exports.uploadPdf = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;

    const newPdf = new Pdf({
      title,
      url: relativeUrl,
    });

    await newPdf.save();

    res.status(201).json({ message: 'PDF uploaded locally', pdf: newPdf });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
};

exports.getAllPdfs = async (req, res) => {
  try {
    const pdfs = await Pdf.find().sort({ uploadedAt: -1 });
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
};
