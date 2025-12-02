const mongoose = require('mongoose');

const AdvertiseOrderSchema = new mongoose.Schema({
  // Content reference (changed from productId to contentId)
  contentId: { type: String, required: true },
  contentTitle: { type: String, required: true },
  contentSlug: { type: String },
  
  // Customer details
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  
  // Order details
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  savings: { type: Number, default: 0, min: 0 },
  
  // Order status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Payment
  paymentMethod: { 
    type: String, 
    enum: ['cash_on_delivery', 'bkash', 'nagad', 'bank'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  
  // Additional notes
  notes: { type: String, default: '' },
  
}, { timestamps: true });

// Indexes for better query performance
AdvertiseOrderSchema.index({ contentId: 1 });
AdvertiseOrderSchema.index({ phone: 1 });
AdvertiseOrderSchema.index({ status: 1 });
AdvertiseOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AdvertiseOrder || mongoose.model('AdvertiseOrder', AdvertiseOrderSchema);