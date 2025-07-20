// src/models/Price.js
require('dotenv').config();
const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  token: { type: String, required: true },          // token address
  network: { type: String, required: true },        // network (ethereum/polygon)
  price: { type: Number, required: true },          // price in USD
  timestamp: { type: Number, required: true },      // UNIX timestamp (seconds)
}, {
  timestamps: true,
});

priceSchema.index({ token: 1, network: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);
