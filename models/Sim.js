const mongoose = require('mongoose');

const simSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Sim', simSchema);