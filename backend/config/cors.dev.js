
// config/cors.dev.js
module.exports = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5500", // ✅ VS Code Live Server
      "http://127.0.0.1:5500", // sometimes Live Server uses this
      "http://localhost:3000", // React dev server (if you use it)
    ];

    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
};
