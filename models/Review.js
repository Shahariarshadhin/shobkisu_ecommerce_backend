const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema)
