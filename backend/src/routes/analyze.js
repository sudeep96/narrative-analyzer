const express = require('express');
const router = express.Router();
const { single, compare } = require('../controllers/analyzeController');

router.post('/single', single);
router.post('/compare', compare);

module.exports = router;