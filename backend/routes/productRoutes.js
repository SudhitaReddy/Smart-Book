const express = require('express');
const Product = require('../models/product');
const router = express.Router();

// ==============================
// Insert Sample Products
// ==============================
router.post('/add-sample', async (req, res) => {
  try {
    const sampleProducts = [
      {
        title: 'JavaScript Essentials',
        author: 'John Doe',
        description: 'Learn JS from scratch',
        price: 499,
        originalPrice: 599,
        stock: 10,
        category: 'education',
        seller: '64f8b6c1a2c5f2b9e7d0abcd', // replace with real User _id
        images: [
          { url: 'images/js-book.jpg', alt: 'JS Book Cover', isPrimary: true }
        ]
      },
      {
        title: 'Mystery Novel',
        author: 'Jane Smith',
        description: 'A thrilling mystery story',
        price: 299,
        stock: 5,
        category: 'fiction',
        seller: '64f8b6c1a2c5f2b9e7d0abcd', // replace with real User _id
        images: [
          { url: 'images/mystery-book.jpg', alt: 'Mystery Book Cover', isPrimary: true }
        ]
      }
    ];

    const result = await Product.insertMany(sampleProducts);
    res.json({ success: true, message: 'Sample products inserted', data: result });
  } catch (err) {
    console.error('❌ Error inserting sample products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================
// Get All Products (with optional category filter)
// ==============================
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const products = await Product.find(filter).populate('seller', 'businessName');
    res.json({ success: true, data: { products } });
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================
// Get Single Product by ID
// ==============================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'businessName');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: { product } });
  } catch (err) {
    console.error('❌ Error fetching product by ID:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
