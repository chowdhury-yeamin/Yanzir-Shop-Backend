const express = require('express');
const {
  listProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public
router.get('/', listProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Admin protected
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);
router.patch('/:id/stock', adminAuth, updateProductStock);

module.exports = router;

