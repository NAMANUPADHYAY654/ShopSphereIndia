const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const test = async () => {
  const user = await User.findOne({ email: 'admin@shopsphere.com' });
  console.log("User:", user ? user.email : "Not found");
  if (user) {
    const isMatch = await bcrypt.compare('password123', user.password);
    console.log("Password match:", isMatch);
    console.log("Hashed password in DB:", user.password);
  }
  process.exit();
};

test();
