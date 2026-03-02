const config = require('../config');

const adminAuth = (req, res, next) => {
  const provided =
    req.headers['x-admin-password'] ||
    req.body?.adminPassword ||
    req.query?.adminPassword;

  if (!config.adminPassword) {
    return res.status(500).json({
      success: false,
      message: 'Admin password is not configured on the server.',
    });
  }

  if (!provided || provided !== config.adminPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password.',
    });
  }

  req.isAdmin = true;
  next();
};

module.exports = adminAuth;

