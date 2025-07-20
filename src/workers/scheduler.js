require('dotenv').config();
const { Queue, Worker } = require('bullmq');
const redis = require('../utils/redis');
const { fetchTokenPrice } = require('../utils/fetchTokenPrice');
const Price = require('../models/Price');

const queue = new Queue('priceQueue', { connection: redis });

const worker = new Worker(
  'priceQueue',
  async (job) => {
    const { token, network, interval = 300, backfill = 12 } = job.data;

    if (!token || !network) {
      console.warn('⚠️ Missing token or network in job data, skipping...');
      return;
    }

    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < backfill; i++) {
      const timestamp = now - i * interval;
      const roundedTimestamp = timestamp - (timestamp % interval);

      try {
        const priceData = await fetchTokenPrice(token, roundedTimestamp, network);

        if (!priceData || priceData.price === null) {
          console.warn(`⚠️ Skipped: Price not found for ${roundedTimestamp} (${network} - ${token})`);
          continue;
        }

        const exists = await Price.findOne({
          token,
          network,
          timestamp: roundedTimestamp,
        });

        if (!exists) {
          await Price.create({
            token: priceData.token,
            network: priceData.network,
            price: priceData.price,
            timestamp: roundedTimestamp,
          });
          console.log(`📥 Saved: ${network} | ${token} | $${priceData.price} at ${roundedTimestamp}`);
        } else {
          console.log(`⚠️ Exists: Price already stored for ${network} | ${token} at ${roundedTimestamp}`);
        }
      } catch (err) {
        console.error(`❌ Error @ ${roundedTimestamp}: ${err.message}`);
      }
    }

    console.log(`✅ Completed job for token: ${token}, network: ${network}`);
    await job.updateProgress(100);
  },
  { connection: redis }
);

module.exports = { queue, worker };
