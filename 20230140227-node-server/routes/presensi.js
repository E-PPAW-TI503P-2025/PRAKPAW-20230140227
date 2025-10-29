const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const presensiController = require('../controllers/presensiController');

const updateValidationRules = [
  body('checkIn')
    .optional() 
    .isISO8601() 
    .withMessage('Format tanggal checkIn tidak valid, gunakan ISO8601'),
  
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal checkOut tidak valid, gunakan ISO8601')
];

router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);
router.delete('/delete/:id', presensiController.DeletePresensi);


router.put('/:id', updateValidationRules, 
  presensiController.UpdatePresensi
);

router.get('/', presensiController.FindAll);

module.exports = router;