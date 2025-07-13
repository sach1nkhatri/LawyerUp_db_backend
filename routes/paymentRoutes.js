const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware');


const paymentController = require('../controllers/paymentController');

// ⬆️ User uploads payment proof
router.post(
  '/',
  protect,
  upload.single('screenshot'),
  paymentController.submitManualPayment
);

// ✅ Admin routes — using only protect for now (add isAdmin later if needed)
router.patch('/:id/approve', protect, paymentController.approvePayment);
router.patch('/:id/reject', protect, paymentController.rejectPayment);
router.get('/', protect, paymentController.getAllPayments);
router.get('/user', protect, paymentController.getUserLatestPayment);

module.exports = router;
