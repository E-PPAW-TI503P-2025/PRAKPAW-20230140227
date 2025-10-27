const express = require('express');
const router = express.Router();
    
const presensiController = require('../controllers/presensiController'); 

router.post('/check-in', presensiController.CheckIn);

router.post('/check-out', presensiController.CheckOut);

module.exports = router;