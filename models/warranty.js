const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  duration: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Warranty', warrantySchema);