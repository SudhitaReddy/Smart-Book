# 📚 Smart Book - Multi-Vendor Book E-Commerce Platform

## 🧾 Overview
**Smart Book** is a **full-stack multi-vendor e-commerce web application** designed specifically for the **book industry**.  
It allows multiple sellers to **register, manage, and sell books online**, while customers can **browse, search, and purchase** books seamlessly.

The project is built using **Node.js, Express.js, MongoDB** for the backend and **HTML, CSS, JavaScript** for the frontend.  
It includes features such as **email verification, JWT authentication, cron jobs, and admin/seller dashboards**.

---

## 🚀 Features

### 👤 User Features
- Register, login, and manage profiles (with email verification).
- Browse and search books by categories, author, or title.
- Add books to cart or wishlist.
- Place and track orders.
- Receive order confirmation via email.

### 🧑‍💼 Seller Features
- Register and verify account via email.
- Add, edit, and delete books.
- Manage inventory and orders.
- View dashboard with sales analytics.

### 🛠️ Admin Features
- Manage all users, sellers, and products.
- Approve or remove sellers.
- Monitor total sales and order reports.
- Handle system-level operations and analytics.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript BootStrap|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | JWT (JSON Web Token), Bcrypt for password hashing |
| **Email Services** | Nodemailer, Cron Jobs for scheduling |
| **Deployment** | Render MongoDB Atlas |

---

## 🧩 System Architecture
Frontend (HTML, CSS, JS)
↓
Express.js Server (Node.js)
↓
MongoDB Database

APIs handle the communication between frontend and backend:
- `/api/users` → Registration, login, verification  
- `/api/products` → CRUD operations for books  
- `/api/orders` → Checkout, order tracking  
- `/api/admin` → Admin management & reports  

---

## 📬 Email Verification & Cron Jobs

- On registration, users receive a **verification email**.
- **Node-Cron** runs scheduled tasks such as:
  - Cleaning up unverified accounts.
  - Sending order confirmations and updates.
  - Sending cart reminder emails.

---

## 🔒 Authentication & Security

- **JWT Tokens** for user authentication.
- **Role-based Access Control (RBAC)** for customers, sellers, and admin.
- **Encrypted Passwords** using Bcrypt.
- **Input validation** and error handling middleware.

---

## 🧠 Database Collections (Sample)

| Collection | Description |
|-------------|-------------|
| `users` | Stores buyer, seller, and admin data |
| `products` | Stores book details (title, author, price, category) |
| `orders` | Stores order and payment information |
| `categories` | Stores book categories |
| `reviews` | Stores user feedback and ratings |

---

smart-book/
│
├── frontend/
│   ├── index.html
│   ├── seller-dashboard.html
│   ├── admin-dashboard.html
│   ├── cart.html
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   └── categoryModel.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   │   ├── sendEmail.js
│   │   └── cronJobs.js
│   └── package.json
│
└── README.md






