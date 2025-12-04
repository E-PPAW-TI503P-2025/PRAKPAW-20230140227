const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/check-in', 
    [authMiddleware, presensiController.upload.single('image')], 
    presensiController.checkIn
);

router.post('/checkout', authMiddleware, presensiController.checkOut);
router.get('/laporan', authMiddleware, presensiController.getLaporan);

module.exports = router;