require('dotenv').config();
const { Redis } = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // 🔥 Required for BullMQ
});

module.exports = redis;
