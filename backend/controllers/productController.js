const Product = require('../models/productModel');

// @desc    Fetch all products with pagination, search, and filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? { $text: { $search: req.query.keyword } }
      : {};

    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.isTrending === 'true') {
      filter.isTrending = true;
    }
    if (req.query.isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    const query = { ...keyword, ...filter };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(req.query.sort === 'priceAsc' ? { price: 1 } : req.query.sort === 'priceDesc' ? { price: -1 } : { createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize), count });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name, price, compareAtPrice, description, images, category, stock, sku, tags, isTrending, isBestSeller, isNewArrival
    } = req.body;

    const product = new Product({
      name, price, compareAtPrice, description, images, category, stock, sku, tags, isTrending, isBestSeller, isNewArrival
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
