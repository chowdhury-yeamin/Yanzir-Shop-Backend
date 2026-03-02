const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = ['Shirt', 'T-Shirt', 'Panjabi', 'Accessories'];

function normalizeCategory(input) {
  const raw = (input ?? '').toString().trim();
  if (!raw) return raw;

  const lower = raw.toLowerCase();

  if (/(^|[\s_-])panjabi($|[\s_-])/.test(lower) || lower.includes('panjabi')) return 'Panjabi';
  if (lower.includes('t-shirt') || lower.includes('tshirt') || lower.includes('t shirts') || lower.includes('t-shirts')) return 'T-Shirt';
  if (lower.includes('access')) return 'Accessories';

  // Keep after T-Shirt mapping so "t-shirt" doesn't become "Shirt".
  if (lower.includes('shirt')) return 'Shirt';

  return raw;
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      set: normalizeCategory,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema, 'products');

