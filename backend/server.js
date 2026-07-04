const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS — allow localhost in dev, Vercel URL in prod
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.CLIENT_URL, // Set this to your Vercel URL in Render env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
connectDB();

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/chat', require('./routes/chatbotRoutes'));
app.use('/api/sellers', require('./routes/sellerRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'ShopSphere India API is running ✅', version: '1.0.0' });
});

// Error handling middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
