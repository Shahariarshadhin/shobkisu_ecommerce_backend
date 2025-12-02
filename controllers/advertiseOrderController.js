const AdvertiseOrder = require('../models/AdvertiseOrder');
const AdvertiseContent = require('../models/AdvertiseContent');

const useDb = !!process.env.MONGODB_URI;
const ordersMemory = [];

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      contentId,
      contentTitle,
      contentSlug,
      name,
      phone,
      address,
      quantity,
      price,
      originalPrice,
      notes
    } = req.body;

    // Validation
    if (!contentId || !contentTitle || !name || !phone || !address || !quantity || !price) {
      return res.status(400).json({
        message: 'Required fields: contentId, contentTitle, name, phone, address, quantity, price'
      });
    }

    // Calculate totals
    const totalPrice = price * quantity;
    // Only calculate savings if originalPrice is greater than price
    const savings = (originalPrice && originalPrice > price) ? (originalPrice - price) * quantity : 0;

    if (useDb) {
      const order = await AdvertiseOrder.create({
        contentId,
        contentTitle,
        contentSlug: contentSlug || '',
        name,
        phone,
        address,
        quantity,
        price,
        originalPrice: originalPrice || 0,
        totalPrice,
        savings,
        notes: notes || '',
        status: 'pending',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid'
      });

      return res.status(201).json({
        message: 'Order created successfully',
        data: order
      });
    } else {
      const id = String(ordersMemory.length + 1);
      const newOrder = {
        id,
        contentId,
        contentTitle,
        contentSlug: contentSlug || '',
        name,
        phone,
        address,
        quantity,
        price,
        originalPrice: originalPrice || 0,
        totalPrice,
        savings,
        notes: notes || '',
        status: 'pending',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      ordersMemory.push(newOrder);
      
      return res.status(201).json({
        message: 'Order created successfully',
        data: newOrder
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, contentId, phone, sort = 'newest' } = req.query;

    if (useDb) {
      let query = {};
      
      if (status) query.status = status;
      if (contentId) query.contentId = contentId;
      if (phone) query.phone = phone;

      let sortOption = {};
      if (sort === 'newest') {
        sortOption = { createdAt: -1 };
      } else if (sort === 'oldest') {
        sortOption = { createdAt: 1 };
      }

      const orders = await AdvertiseOrder.find(query).sort(sortOption);
      
      return res.status(200).json({
        message: 'Orders retrieved successfully',
        count: orders.length,
        data: orders
      });
    } else {
      let filteredOrders = [...ordersMemory];
      
      if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
      }
      if (contentId) {
        filteredOrders = filteredOrders.filter(o => o.contentId === contentId);
      }
      if (phone) {
        filteredOrders = filteredOrders.filter(o => o.phone.includes(phone));
      }

      if (sort === 'oldest') {
        filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      return res.status(200).json({
        message: 'Orders retrieved successfully',
        count: filteredOrders.length,
        data: filteredOrders
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (useDb) {
      const order = await AdvertiseOrder.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(200).json({
        message: 'Order retrieved successfully',
        data: order
      });
    } else {
      const order = ordersMemory.find(o => o.id === id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(200).json({
        message: 'Order retrieved successfully',
        data: order
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    if (useDb) {
      const order = await AdvertiseOrder.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json({
        message: 'Order updated successfully',
        data: order
      });
    } else {
      const index = ordersMemory.findIndex(o => o.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Order not found' });
      }

      ordersMemory[index] = {
        ...ordersMemory[index],
        ...updateData,
        updatedAt: new Date()
      };

      return res.status(200).json({
        message: 'Order updated successfully',
        data: ordersMemory[index]
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (useDb) {
      const order = await AdvertiseOrder.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(200).json({
        message: 'Order deleted successfully'
      });
    } else {
      const index = ordersMemory.findIndex(o => o.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Order not found' });
      }
      ordersMemory.splice(index, 1);
      return res.status(200).json({
        message: 'Order deleted successfully'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting order',
      error: error.message
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    if (useDb) {
      const stats = await AdvertiseOrder.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]);

      const totalOrders = await AdvertiseOrder.countDocuments();
      const totalRevenue = await AdvertiseOrder.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      return res.status(200).json({
        message: 'Statistics retrieved successfully',
        data: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          byStatus: stats
        }
      });
    } else {
      const stats = {
        totalOrders: ordersMemory.length,
        totalRevenue: ordersMemory.reduce((sum, o) => sum + o.totalPrice, 0),
        byStatus: {}
      };

      ordersMemory.forEach(order => {
        if (!stats.byStatus[order.status]) {
          stats.byStatus[order.status] = { count: 0, totalRevenue: 0 };
        }
        stats.byStatus[order.status].count++;
        stats.byStatus[order.status].totalRevenue += order.totalPrice;
      });

      return res.status(200).json({
        message: 'Statistics retrieved successfully',
        data: stats
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};