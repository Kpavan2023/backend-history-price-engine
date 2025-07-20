const axios = require("axios");
require("dotenv").config();

const COINGECKO_API_URL = process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3";

// Dynamically resolve CoinGecko ID using contract address + network
async function resolveCoinGeckoId(tokenAddress, network) {
  try {
    const platform = network === "ethereum" ? "ethereum" : network;
    const url = `${COINGECKO_API_URL}/coins/${platform}/contract/${tokenAddress}`;
    const response = await axios.get(url);
    return response.data.id;
  } catch (err) {
    console.error(`❌ Unable to resolve CoinGecko ID for ${tokenAddress} on ${network}:`, err.response?.data?.error || err.message);
    return null;
  }
}

// Fetch USD price using resolved CoinGecko ID
async function fetchTokenPriceCoinGecko(coingeckoId) {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: coingeckoId,
        vs_currencies: "usd",
      },
    });
    return response.data[coingeckoId]?.usd || null;
  } catch (err) {
    console.error("CoinGecko fetch error:", err.message);
    return null;
  }
}

module.exports = { resolveCoinGeckoId, fetchTokenPriceCoinGecko };
