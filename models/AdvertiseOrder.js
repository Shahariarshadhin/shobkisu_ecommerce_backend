const mongoose = require('mongoose')

const AdvertiseOrderSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  quantity: { type: Number, required: true },
}, { timestamps: true })

module.exports = mongoose.models.AdvertiseOrder || mongoose.model('AdvertiseOrder', AdvertiseOrderSchema)
