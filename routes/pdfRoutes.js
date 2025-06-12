const express = require('express');
const multer = require('multer');
const router = express.Router();
const PdfModel = require('../models/Pdf');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('pdf'), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!file) return res.status(400).send('No file uploaded');

  // Assume you're storing on a file server / AWS S3 / SharePoint equivalent
  const downloadUrl = await uploadToStorage(file); // write this function

  const pdfDoc = new PdfModel({ title, url: downloadUrl });
  await pdfDoc.save();

  res.send({ message: 'Uploaded', pdf: pdfDoc });
});

module.exports = router;
