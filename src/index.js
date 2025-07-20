// index.js (updated with CORS)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Added CORS
const priceRoutes = require('./routes/price');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());               // Enable CORS for all origins
app.use(express.json());       // Parse JSON request bodies

// ✅ Mount your price routes at /api
app.use('/api', priceRoutes);

// ✅ Optional root endpoint
app.get('/', (req, res) => {
  res.send('Historical Token Price Engine API is running');
});

// ✅ Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();
