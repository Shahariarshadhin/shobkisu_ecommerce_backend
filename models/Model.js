const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  releaseYear: Number,
  specifications: Object,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Model', modelSchema);