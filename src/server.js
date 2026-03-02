require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Basic security and parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: false,
  })
);
app.use(express.json());

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Yanzir API is running',
    env: config.env,
  });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Fallback handlers
app.use(notFound);
app.use(errorHandler);


module.exports = app;