const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { handleScan } = require('../controllers/scanController');

// POST /scan  (protected)
router.post('/scan', authenticateToken, handleScan);

module.exports = router;
