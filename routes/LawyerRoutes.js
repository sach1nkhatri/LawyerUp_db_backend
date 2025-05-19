const express = require('express');
const router = express.Router();
const {
  createLawyer,
  getLawyerById,
  getAllLawyers,
  updateLawyer,
  updateStatus,
  deleteLawyer,
} = require('../controllers/lawyerController');

router.post('/', createLawyer);
router.get('/:id', getLawyerById);
router.put('/:id', updateLawyer);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteLawyer);
router.get('/', getAllLawyers); 

module.exports = router;
