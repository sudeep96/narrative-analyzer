const express = require('express');
const router = express.Router();
const { list, getOne } = require('../controllers/reportsController');

router.get('/', list);
router.get('/:id', getOne);

module.exports = router;