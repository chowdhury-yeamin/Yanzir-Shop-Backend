const express = require('express');
const {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getAdminMetrics,
} = require('../controllers/orderController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public
router.post('/', createOrder);

// Admin protected
router.get('/', adminAuth, listOrders);
router.get('/metrics', adminAuth, getAdminMetrics);
router.get('/:id', adminAuth, getOrderById);
router.patch('/:id/status', adminAuth, updateOrderStatus);

module.exports = router;

