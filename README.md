# 🥻 Happy Sarees - Full-Stack E-Commerce Platform

A production-grade, full-stack e-commerce web application for **Happy Sarees** built with React, Vite, Node.js, Express.js, and Neon Cloud PostgreSQL.

---

## 🚀 Key Features

* **Authentication & Authorization**: User registration, login, profile management, and stateless JWT authorization.
* **Dynamic Product Catalog**: Kanchipuram Silk, Banarasi, Organza, Soft Silk sarees with multi-angle galleries, fabric filters, price sorting, and search.
* **Customer Reviews & Star Ratings**: Interactive review submissions with automatic overall rating recalculations.
* **Shopping Cart & Wishlist**: Persistent shopping cart bag and saved sarees wishlist across customer sessions.
* **Multi-Step Checkout**: Address selection, delivery options, UPI/COD payment methods, and live order placement with unique tracking numbers (`HS-XXXXX`).
* **Saved Addresses**: Address book management with default delivery address toggles.
* **Database Optimization**: Neon Cloud PostgreSQL with foreign key indexes for ultra-fast query execution.
* **Backend Security**: Helmet HTTP headers, Express Rate Limiting, CORS origin policies, and input payload size limits.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios 1.18 with request/response interceptors
- **Icons**: React Icons (FontAwesome, Feather, Remix Icons)
- **Styling**: Vanilla CSS Modules (`*.module.css`)

### Backend
- **Runtime**: Node.js v24
- **Framework**: Express.js
- **Database**: PostgreSQL on **Neon Cloud**
- **ORM / Driver**: `pg` (node-postgres) with connection pooling
- **Security & Auth**: JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `express-rate-limit`, `cors`

---

## 📁 Project Folder Structure

```
happy-sarees/
├── server/                   # Express.js REST API Backend
│   ├── middleware/           # Auth JWT Middleware
│   ├── routes/               # API Route Controllers
│   │   ├── addressRoutes.js  # User Addresses API
│   │   ├── authRoutes.js     # User Auth & Profile API
│   │   ├── cartRoutes.js     # Shopping Cart API
│   │   ├── orderRoutes.js    # Orders & Checkout API
│   │   ├── productRoutes.js  # Products & Filters API
│   │   ├── reviewRoutes.js   # Customer Reviews API
│   │   └── wishlistRoutes.js # Saved Wishlist API
│   ├── .env                  # Live Neon PostgreSQL & Port Config
│   ├── db.js                 # PostgreSQL Pool Connection
│   ├── schema.sql            # Table Schemas & Foreign Key Indexes
│   ├── seed.js               # Database Auto-Seeder
│   └── server.js             # Express App Entrypoint
├── src/                      # React Frontend Source
│   ├── account/              # My Account Tabs & Sub-pages
│   ├── assets/               # High-Resolution Saree Images
│   ├── cart/                 # Cart Items & Summary Components
│   ├── checkout/             # Multi-step Checkout Components
│   ├── components/           # Common Layout & UI Cards
│   ├── context/              # Auth & Global State Context
│   ├── data/                 # Mock Data & Static Content
│   ├── home/                 # Homepage Section Components
│   ├── pages/                # Page Views (Shop, ProductDetails, Cart, etc.)
│   ├── product/              # Product Gallery, Reviews & Tabs
│   ├── routes/               # App Router & Protected Routes
│   ├── services/             # Centralized Axios API Service Client
│   ├── shop/                 # Shop Grid, Filters & Quick View Modal
│   ├── wishlist/             # Wishlist Cards & Empty States
│   ├── App.jsx               # Main React Root Component
│   └── main.jsx              # Vite Entrypoint
├── package.json              # Frontend Dependencies
├── README.md                 # Project Documentation
└── vite.config.js            # Vite Bundler Settings
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5001
DATABASE_URL=postgresql://neondb_owner:npg_iSyjo9Nhp3sq@ep-aged-glitter-azao7tg5.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=happy_sarees_super_secret_jwt_key_2026_festive
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## ⚡ Installation & Local Setup

### 1. Clone & Install Dependencies

#### Frontend Dependencies:
```bash
npm install
```

#### Backend Dependencies:
```bash
cd server
npm install
```

---

### 2. Database Initialization & Seeding
Execute the seed script to create all 10 relational tables and indexes on Neon PostgreSQL:
```bash
cd server
npm run seed
```

---

### 3. Run Application

#### Start Express Backend API (Port 5001):
```bash
cd server
npm run dev
```

#### Start Vite React Frontend (Port 5173):
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔗 Main REST API Endpoints

| Resource | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new customer account |
| **Auth** | `POST` | `/api/auth/login` | Login and receive JWT token |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile |
| **Products** | `GET` | `/api/products` | Query products with filters & sorting |
| **Products** | `GET` | `/api/products/:id` | Fetch single product details |
| **Products** | `GET` | `/api/products/bestsellers` | Fetch top bestsellers |
| **Products** | `GET` | `/api/products/new-arrivals` | Fetch freshly loomed sarees |
| **Reviews** | `GET` | `/api/reviews/product/:id` | Fetch product customer reviews |
| **Reviews** | `POST` | `/api/reviews/product/:id` | Submit new customer review |
| **Addresses** | `GET` | `/api/addresses` | Fetch saved delivery addresses |
| **Addresses** | `POST` | `/api/addresses` | Save new delivery address |
| **Addresses** | `DELETE` | `/api/addresses/:id` | Delete saved address |
| **Cart** | `GET` | `/api/cart` | Fetch persistent cart items |
| **Cart** | `POST` | `/api/cart` | Add item to cart bag |
| **Cart** | `DELETE` | `/api/cart/:productId` | Remove item from cart |
| **Wishlist** | `GET` | `/api/wishlist` | Fetch saved wishlist sarees |
| **Wishlist** | `POST` | `/api/wishlist` | Add saree to wishlist |
| **Wishlist** | `DELETE` | `/api/wishlist/:productId` | Remove saree from wishlist |
| **Orders** | `POST` | `/api/orders` | Create new purchase order |
| **Orders** | `GET` | `/api/orders/my-orders` | Fetch customer order history |

---

## 🧪 Production Build Verification
To build the production bundle:
```bash
npm run build
```
Output:
```bash
vite v8.1.5 building client environment for production...
transforming...✓ 233 modules transformed.
rendering chunks...
dist/index.html                   0.46 kB
dist/assets/index-B1fVn3SQ.js   616.35 kB
✓ built in 1.07s
```

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify)
1. Deploy project root directory to Vercel/Netlify.
2. Set Environment Variable `VITE_API_URL` to your production API URL (e.g. `https://api.happysarees.com/api`).

### Backend (Render / Railway / AWS Elastic Beanstalk)
1. Deploy `server/` subfolder.
2. Set Environment Variables:
   - `PORT`
   - `DATABASE_URL` (Neon PostgreSQL Connection String)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://www.happysarees.com`

---

## 👤 Admin Test Credentials

- **Email**: `sumathi@happysarees.com`
- **Password**: `sumathi123`
