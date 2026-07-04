const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const categories = require('./data/categories');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');
const Order = require('./models/orderModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const categoryMap = {
  electronics: 'Electronics',
  'fashion-men': 'Fashion Men',
  'fashion-women': 'Fashion Women',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books & Stationery',
  'health-beauty': 'Health & Beauty',
  sports: 'Sports & Fitness',
  gaming: 'Gaming',
};

const getCategory = (tags, createdCategories) => {
  for (const tag of tags) {
    for (const [slug, name] of Object.entries(categoryMap)) {
      const cat = createdCategories.find((c) => c.slug === slug);
      if (cat && tag === slug) return cat._id;
    }
  }
  // fallback: find by partial match
  if (tags.includes('electronics') || tags.includes('gaming')) {
    return createdCategories.find((c) => c.slug === (tags.includes('gaming') ? 'gaming' : 'electronics'))?._id;
  }
  if (tags.includes('fashion') && tags.includes('men')) {
    return createdCategories.find((c) => c.slug === 'fashion-men')?._id;
  }
  if (tags.includes('fashion') && tags.includes('women')) {
    return createdCategories.find((c) => c.slug === 'fashion-women')?._id;
  }
  if (tags.includes('home') || tags.includes('kitchen')) {
    return createdCategories.find((c) => c.slug === 'home-kitchen')?._id;
  }
  if (tags.includes('books') || tags.includes('stationery')) {
    return createdCategories.find((c) => c.slug === 'books')?._id;
  }
  if (tags.includes('beauty') || tags.includes('health') || tags.includes('grooming')) {
    return createdCategories.find((c) => c.slug === 'health-beauty')?._id;
  }
  if (tags.includes('sports') || tags.includes('fitness') || tags.includes('yoga')) {
    return createdCategories.find((c) => c.slug === 'sports')?._id;
  }
  return createdCategories[0]?._id;
};

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    // Create users with hashed passwords
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} users created`);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created`);

    // Map products to categories
    const mappedProducts = products.map((p) => ({
      ...p,
      category: getCategory(p.tags || [], createdCategories),
    }));

    await Product.insertMany(mappedProducts);
    console.log(`✅ ${mappedProducts.length} products created`);

    console.log('\n🚀 Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    console.log('🗑️ Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
