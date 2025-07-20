require('dotenv').config();
const express = require('express');
const router = express.Router();
const {
  getTokenPriceController,
  schedulePriceFetchController,
} = require('../controllers/priceController');

// GET /price?token=...&network=...&timestamp=...
// → Returns historical/interpolated/live token price
router.get('/price', getTokenPriceController);

// POST /schedule { token, network }
// → Schedules background job to fetch price data periodically
router.post('/schedule', schedulePriceFetchController);

module.exports = router;
