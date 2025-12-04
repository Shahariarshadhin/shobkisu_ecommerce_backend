const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hexCode: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Color', colorSchema);