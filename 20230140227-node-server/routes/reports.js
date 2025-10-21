const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { addUserData, isAdmin } = require('../middleware/permissionMiddleware');

// Gabungkan semua middleware dan handler ke dalam satu array
router.get('/daily', [addUserData, isAdmin, reportController.getDailyReport]);

// Expose a simple GET / route to return the daily report without requiring admin
// This helps testing the endpoint quickly. The more restricted /daily still
// enforces admin via middleware.
router.get('/', addUserData, reportController.getDailyReport);

module.exports = router;