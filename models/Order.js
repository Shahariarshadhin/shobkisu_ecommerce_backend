const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [{ id: String, title: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
}, { timestamps: true })

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema)
