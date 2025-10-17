const express = require('express');
const { body, validationResult } = require('express-validator');
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product', 'title author price images rating category');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    res.json({ success: true, data: { wishlist } });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @desc    Add item to wishlist
 * @route   POST /api/wishlist/items
 * @access  Private
 */
router.post(
  '/items',
  [
    protect,
    body('productId').isMongoId().withMessage('Valid product ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { productId } = req.body;

      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or not available'
        });
      }

      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, items: [] });
      }

      const existingItem = wishlist.items.find(
        item => item.product.toString() === productId
      );
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }

      wishlist.items.push({ product: productId });
      await wishlist.save();
      await wishlist.populate('items.product', 'title author price images rating category');

      res.json({
        success: true,
        message: 'Item added to wishlist successfully',
        data: { wishlist }
      });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/wishlist/items/:productId
 * @access  Private
 */
router.delete('/items/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate('items.product', 'title author price images rating category');

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
router.delete('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();
    await wishlist.populate('items.product', 'title author price images rating category');

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/wishlist/check/:productId
 * @access  Private
 */
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const isInWishlist = wishlist
      ? wishlist.items.some(item => item.product.toString() === productId)
      : false;

    res.json({ success: true, data: { isInWishlist } });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @desc    Get wishlist count
 * @route   GET /api/wishlist/count
 * @access  Private
 */
router.get('/count', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const count = wishlist ? wishlist.items.length : 0;

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
