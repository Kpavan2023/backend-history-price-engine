const Price = require("../models/Price");
require('dotenv').config();
const { fetchTokenPrice } = require("../utils/fetchTokenPrice");
const { interpolatePrice } = require("../utils/interpolate");
const { queue } = require("../workers/scheduler");

// GET /price?token=...&network=...&timestamp=...
const getTokenPriceController = async (req, res) => {
  const { token, network, timestamp } = req.query;

  if (!token || !network || !timestamp) {
    return res.status(400).json({ error: "token, network and timestamp required" });
  }

  const ts = parseInt(timestamp);
  if (isNaN(ts)) return res.status(400).json({ error: "Invalid timestamp" });

  try {
    // 1️⃣ Check exact cached price in DB
    const exact = await Price.findOne({ token: token.toLowerCase(), network, timestamp: ts });
    if (exact) {
      console.log(`Cache hit for ${token} at timestamp ${ts}`);
      return res.json({ token, network, timestamp: ts, price: exact.price, source: "cache" });
    }

    // 2️⃣ Try to interpolate price if exact not found
    try {
      const interpolatedData = await interpolatePrice(token.toLowerCase(), network, ts);
      if (interpolatedData && interpolatedData.price !== undefined) {
        console.log(`Interpolated price used for ${token} at timestamp ${ts}`);
        return res.json(interpolatedData);
      }
    } catch (interpErr) {
      console.warn("Interpolation failed:", interpErr.message);
    }

    // 3️⃣ Fetch live price as fallback
    const live = await fetchTokenPrice(token.toLowerCase(), ts, network);
    if (!live) return res.status(404).json({ error: "Unable to fetch token price." });

    try {
      await Price.create({
        token: token.toLowerCase(),
        network,
        price: live.price,
        timestamp: live.timestamp,
      });
      console.log(`Price saved to MongoDB for ${token} at timestamp ${live.timestamp}`);
    } catch (saveErr) {
      console.error("Error saving price to MongoDB:", saveErr.message);
    }

    return res.json({
      token: token.toLowerCase(),
      network,
      timestamp: live.timestamp,
      price: live.price,
      source: "alchemy",
    });

  } catch (err) {
    console.error("❌ Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /schedule
const schedulePriceFetchController = async (req, res) => {
  const { token, network, interval = 300, backfill = 12 } = req.body;

  if (!token || !network) {
    return res.status(400).json({ error: 'token and network are required' });
  }

  try {
    await queue.add('fetchPrices', {
      token: token.toLowerCase(),
      network,
      interval,
      backfill
    });

    return res.json({ message: 'Job scheduled successfully' });
  } catch (err) {
    console.error('Error scheduling job:', err.message);
    return res.status(500).json({ error: 'Failed to schedule job' });
  }
};

module.exports = {
  getTokenPriceController,
  schedulePriceFetchController,
};
