const axios = require('axios');

const ETHERSCAN_BASE_URLS = {
  ethereum: 'https://api.etherscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
};

async function getBlockNumberByTimestamp(timestamp, network) {
  const baseUrl = ETHERSCAN_BASE_URLS[network];
  if (!baseUrl) {
    throw new Error(`Unsupported network for Etherscan API: ${network}`);
  }

  const url = `${baseUrl}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.ETHERSCAN_API_KEY}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === '1') {
      return parseInt(response.data.result, 10);
    } else {
      throw new Error(`Etherscan API error: ${response.data.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch block number: ${error.message}`);
  }
}

module.exports = { getBlockNumberByTimestamp };
