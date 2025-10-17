require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const Product = require("./models/product");
const allbooks = require("./data");
const mongoose = require("mongoose");

const sendEmail = require("./utils/sendEmail");

const app = express();

// ================================
// CORS Config
// ================================
const devOrigins = [
  "http://localhost:3000",   // React dev server
  "http://127.0.0.1:5500",   // VS Code Live Server (127)
  "http://localhost:5500",   // VS Code Live Server (localhost)
  "null"                     // Allow file:// (origin = null)
];

const prodOrigins = [
  "https://yourfrontend.com",
  "https://yourdashboard.com"
];

const allowedOrigins =
  process.env.NODE_ENV === "production" ? prodOrigins : devOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ================================
// Base Test route
// ================================
app.get("/", (req, res) => {
  res.send("✅ API is running. Try /api/products or /api/auth/register");
});

// ✅ Email test route
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "yourpersonalemail@gmail.com", 
      "Test Email from BookSmart",
      "<h1>Hello ✅ Your email setup is working!</h1>"
    );
    res.send("✅ Test email sent. Check your inbox/spam.");
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    res.status(500).send("❌ Failed to send email: " + err.message);
  }
});

// ================================
// Routes
// ================================
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/seller", require("./routes/sellerRoutes"));
app.use("/api/seller", require("./routes/sellerRequestRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Insert / Refresh books on startup
// ================================
const insertInitialBooks = async () => {
  console.log("📥 insertInitialBooks() running...");
  try {
    await Product.collection.dropIndex("id_1").catch(() => {
      console.log("ℹ️ No id_1 index found, continuing...");
    });

    await Product.deleteMany({});
    console.log("🗑️ Old products deleted");

    const booksArray = [
      ...allbooks.fiction,
      ...allbooks["non-fiction"],
      ...allbooks.education,
    ];

    const booksToInsert = booksArray.map((book) => ({
      ...book,
      seller: new mongoose.Types.ObjectId("000000000000000000000000"),
      stock: book.stock || 10,
    }));

    await Product.insertMany(booksToInsert);
    console.log("✅ Books refreshed in MongoDB");
  } catch (err) {
    console.error("❌ Error inserting books:", err);
  }
};

// ================================
// Connect DB and Start Server
// ================================
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    insertInitialBooks();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🌍 Running in ${process.env.NODE_ENV || "development"} mode`);
    });
  })
  .catch((err) => console.error("❌ DB connection failed:", err));
