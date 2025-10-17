// config/cors.prod.js
module.exports = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://booksmartnav.com",        // ✅ Customer site
      "https://admin.booksmartnav.com",  // ✅ Admin dashboard
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
};
