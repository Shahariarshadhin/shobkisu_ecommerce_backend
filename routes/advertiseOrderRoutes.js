const express = require('express');
const router = express.Router();
const orderController = require('../controllers/advertiseOrderController');

// Get order statistics
router.get('/stats', orderController.getOrderStats);

// Create new order
router.post('/', orderController.createOrder);

// Get all orders (supports query params: ?status=pending&contentId=123&phone=01234)
router.get('/', orderController.getAllOrders);

// Get single order by ID
router.get('/:id', orderController.getOrderById);

// Update order status
router.put('/:id', orderController.updateOrderStatus);

// Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;