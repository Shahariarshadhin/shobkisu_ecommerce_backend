const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  shortDescription: String,
  details: String,
  faq: [{ q: String, a: String }],
  features: [String],
  technicalDetails: {},
}, { timestamps: true })

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema)
