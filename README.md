# ShopSphere India 🛍️

A full-stack premium Indian e-commerce platform built with the **MERN stack**.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | [https://shopsphere-india.vercel.app](https://shop-sphere-india.vercel.app/) |
| Backend API | [https://shopsphere-api.onrender.com](https://https://shopsphereindia.onrender.com) |

---

## ✨ Features

- **🛒 Full Shopping Cart** — Add, remove, update quantities, persistent across sessions
- **⚡ Buy Now** — Skip cart and go directly to checkout
- **💳 Multi-step Checkout** — Shipping → Payment (UPI/Card/NetBanking/COD) → Review → Order Confirmation
- **🔐 JWT Authentication** — Secure login/register with bcrypt hashed passwords
- **👤 User Dashboard** — View profile, update details, change password
- **⚙️ Admin Dashboard** — Revenue analytics (Recharts), manage products & orders
- **🗂️ 8 Categories** — Electronics, Fashion, Home & Kitchen, Books, Beauty, Sports, Gaming
- **🔍 Search & Filter** — Keyword search, category filter, sort by price/rating
- **🌓 Dark / Light Mode** — Persistent theme toggle
- **📱 Mobile Responsive** — Mobile-first design
- **✨ Framer Motion** — Animations throughout
- **🏷️ Product Badges** — Bestseller, New Arrival, Discount % badges

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3, Framer Motion |
| State | Redux Toolkit, RTK Query |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (httpOnly cookies), bcryptjs |
| UI Icons | Lucide React |
| Charts | Recharts |
| Notifications | React Hot Toast |

---

## 📁 Project Structure

```
ShopSphereIndia/
├── backend/
│   ├── config/        # DB connection
│   ├── controllers/   # Route handlers
│   ├── data/          # Seed data (users, products, categories)
│   ├── middleware/     # Auth, error handling
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routers
│   ├── utils/         # JWT token helper
│   ├── seeder.js      # Database seeder
│   └── server.js      # Entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # Navbar, Footer, ProductCard, Loaders
│       ├── pages/      # Home, Products, ProductDetails, Cart, Checkout, Login, Register, Profile
│       ├── pages/admin/# Admin Dashboard
│       └── redux/      # Store, slices (auth, cart, theme), RTK Query APIs
└── README.md
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ShopSphereIndia.git
cd ShopSphereIndia
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
```
```bash
npm run dev        # Start backend server
node seeder.js     # Seed database with 21 products
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Start at http://localhost:5173
```

---

## 🌐 Deployment

### Backend → Render
1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your Atlas URI>`
   - `JWT_SECRET=<your secret>`
   - `CLIENT_URL=<your Vercel URL>`

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Connect repo
2. Root Directory: `frontend`
3. Add Environment Variable:
   - `VITE_API_URL=https://your-render-service.onrender.com/api`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopsphere.com | password123 |
| User | john@example.com | password123 |

---

## 📜 License

MIT © 2024 Naman Upadhyay
