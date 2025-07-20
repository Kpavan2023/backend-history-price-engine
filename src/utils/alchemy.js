const { Alchemy, Network } = require("alchemy-sdk");
require("dotenv").config();

function getAlchemyInstance(networkName) {
  const settings = {
    apiKey: process.env[`ALCHEMY_${networkName.toUpperCase()}_API_KEY`],
    network:
      networkName === "ethereum"
        ? Network.ETH_MAINNET
        : networkName === "polygon"
        ? Network.MATIC_MAINNET
        : (() => {
            throw new Error(`Unsupported network: ${networkName}`);
          })(),
  };

  return new Alchemy(settings);
}

async function getTokenMetadata(tokenAddress, network) {
  const alchemy = getAlchemyInstance(network);
  try {
    return await alchemy.core.getTokenMetadata(tokenAddress);
  } catch (err) {
    console.error("Alchemy getTokenMetadata error:", err.message);
    return null;
  }
}

module.exports = { getTokenMetadata };
