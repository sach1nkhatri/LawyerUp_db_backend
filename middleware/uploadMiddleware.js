const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUploadDir = (file) => {
  const mime = file.mimetype;

  // 📄 PDF files
  if (mime === 'application/pdf') {
    if (file.fieldname === 'licenseFile') return 'uploads/lawyers/license'; // fixed
    return 'uploads/pdf';
  }
  
  if (mime.startsWith('image/')) {
    if (file.fieldname === 'profilePhoto') return 'uploads/lawyers/photo';
    return 'uploads/news';
  }
  

  // ❌ Fallback
  return 'uploads/misc';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadDir(file);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 🛡️ Allow images and PDFs only
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype.toLowerCase());
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image and PDF files are allowed'));
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
