const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const PdfModel = require('../models/pdf'); // ✅ this was missing

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pdfPath = path.join(__dirname, '../uploads/pdf');
    if (!fs.existsSync(pdfPath)) fs.mkdirSync(pdfPath, { recursive: true });
    cb(null, pdfPath);
  },
});
const upload = multer({ storage });

// Upload PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  const { title } = req.body;
  const filePath = `/uploads/${req.file.filename}`;
  const pdfDoc = new PdfModel({ title, url: filePath });

  await pdfDoc.save();
  res.send({ message: 'Uploaded', pdf: pdfDoc });
});

// Get All PDFs
router.get('/', async (req, res) => {
  const pdfs = await PdfModel.find().sort({ uploadedAt: -1 });
  res.json(pdfs);
});

// Delete PDF (DB + File)
router.delete('/:id', async (req, res) => {
  try {
    const pdf = await PdfModel.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    const filePath = path.join(__dirname, '../..', pdf.url); // double check this line
    console.log('Deleting file:', filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await PdfModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete PDF', details: err.message });
  }
});

module.exports = router;
