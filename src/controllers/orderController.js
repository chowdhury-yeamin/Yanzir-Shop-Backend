const Order = require('../models/Order');
const Product = require('../models/Product');
const { success } = require('../utils/apiResponse');

const createOrder = async (req, res) => {
  const { items, customerName, phone, address, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error('Cart items are required');
    err.statusCode = 400;
    throw err;
  }

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap.get(String(item.productId));
    if (!product) {
      const err = new Error('One or more products not found');
      err.statusCode = 400;
      throw err;
    }

    if (product.stock < item.quantity) {
      const err = new Error(
        `Insufficient stock for product: ${product.name}`
      );
      err.statusCode = 400;
      throw err;
    }

    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  // Decrement stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  const order = await Order.create({
    items: orderItems,
    totalAmount,
    customerName,
    phone,
    address,
    notes,
  });

  return success(res, { order }, 'Order placed successfully', 201);
};

// Admin controllers
const listOrders = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [items, totalItems] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return success(
    res,
    {
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    },
    'Orders fetched successfully'
  );
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  return success(res, { order }, 'Order fetched successfully');
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  return success(res, { order }, 'Order status updated successfully');
};

const getAdminMetrics = async (req, res) => {
  const [totalProducts, totalOrders, revenueAgg, outOfStockCount, recentOrders] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

  const totalRevenue =
    revenueAgg && revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  return success(
    res,
    {
      totalProducts,
      totalOrders,
      totalRevenue,
      outOfStockCount,
      recentOrders,
    },
    'Admin metrics fetched successfully'
  );
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getAdminMetrics,
};

