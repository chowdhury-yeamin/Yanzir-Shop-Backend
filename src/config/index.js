require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/yanzir_store',
  adminPassword: process.env.ADMIN_PASSWORD,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

if (!config.adminPassword) {
  console.warn('⚠️ ADMIN_PASSWORD is not set. Admin routes will be unprotected until it is configured.');
}

module.exports = config;

