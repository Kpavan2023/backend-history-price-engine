const Price = require("../models/Price");

async function interpolatePrice(token, network, targetTime) {
  const before = await Price.findOne({
    token: token.toLowerCase(),
    network,
    timestamp: { $lt: targetTime },
  }).sort({ timestamp: -1 });

  const after = await Price.findOne({
    token: token.toLowerCase(),
    network,
    timestamp: { $gt: targetTime },
  }).sort({ timestamp: 1 });

  if (!before || !after) {
    throw new Error("Insufficient data to interpolate.");
  }

  const t1 = before.timestamp;
  const p1 = before.price;
  const t2 = after.timestamp;
  const p2 = after.price;

  if (t1 === t2) {
    // If timestamps are the same, just return that price (no interpolation needed)
    return {
      token,
      network,
      timestamp: targetTime,
      price: p1,
      source: "interpolated",
    };
  }

  // Calculate linear interpolation
  const ratio = (targetTime - t1) / (t2 - t1);
  const interpolatedPrice = p1 + (p2 - p1) * ratio;

  return {
    token,
    network,
    timestamp: targetTime,
    price: interpolatedPrice,
    source: "interpolated",
  };
}

module.exports = { interpolatePrice };
