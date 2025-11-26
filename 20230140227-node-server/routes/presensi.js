const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/checkin', authMiddleware, presensiController.checkIn);
router.post('/checkout', authMiddleware, presensiController.checkOut);
router.get('/laporan', authMiddleware, presensiController.getLaporan);

module.exports = router;