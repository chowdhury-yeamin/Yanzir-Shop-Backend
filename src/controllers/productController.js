const Product = require('../models/Product');
const { success } = require('../utils/apiResponse');

const buildProductQuery = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isFeatured) {
    filter.isFeatured = query.isFeatured === 'true';
  }

  if (query.isBestSeller) {
    filter.isBestSeller = query.isBestSeller === 'true';
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  return filter;
};

const getSortOption = (sort) => {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
};

const listProducts = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const filter = buildProductQuery(req.query);
  const sort = getSortOption(req.query.sort);

  const [items, totalItems] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
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
    'Products fetched successfully'
  );
};

const getProductByIdOrSlug = async (req, res) => {
  const { idOrSlug } = req.params;

  const product =
    (await Product.findOne({ slug: idOrSlug })) ||
    (await Product.findById(idOrSlug));

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return success(res, { product }, 'Product fetched successfully');
};

// Admin controllers
const createProduct = async (req, res) => {
  const payload = req.body;
  const product = await Product.create(payload);
  return success(res, { product }, 'Product created successfully', 201);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const product = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return success(res, { product }, 'Product updated successfully');
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return success(res, null, 'Product deleted successfully');
};

const updateProductStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    { stock },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return success(res, { product }, 'Product stock updated successfully');
};

module.exports = {
  listProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
};

