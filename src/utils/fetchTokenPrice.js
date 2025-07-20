const { getTokenMetadata } = require("./alchemy");
const { resolveCoinGeckoId, fetchTokenPriceCoinGecko } = require("./coingecko");

async function fetchTokenPrice(tokenAddress, blockTimestamp, network) {
  try {
    console.log(`🔍 Fetching metadata for ${tokenAddress} on ${network}...`);

    // Get metadata (name, symbol) using Alchemy
    const tokenMeta = await getTokenMetadata(tokenAddress, network);
    if (!tokenMeta || !tokenMeta.symbol) {
      console.warn("❌ Token metadata not found from Alchemy.");
      return null;
    }

    console.log(`✅ Token: ${tokenMeta.name || 'N/A'} (${tokenMeta.symbol})`);

    // Resolve CoinGecko ID for that token
    const coingeckoId = await resolveCoinGeckoId(tokenAddress, network);
    if (!coingeckoId) {
      console.warn("❌ CoinGecko ID not found.");
      return null;
    }

    console.log("🌐 Fetching price from CoinGecko...");
    const usdPrice = await fetchTokenPriceCoinGecko(coingeckoId);

    if (!usdPrice) {
      console.warn("❌ Price not found on CoinGecko.");
      return null;
    }

    // Round timestamp to nearest 5 minutes
    const roundedTimestamp = blockTimestamp - (blockTimestamp % 300);

    return {
      token: tokenAddress,
      symbol: tokenMeta.symbol,
      network,
      price: usdPrice,
      timestamp: roundedTimestamp,
    };
  } catch (err) {
    console.error("❌ fetchTokenPrice error:", err.message);
    return null;
  }
}

module.exports = { fetchTokenPrice };
