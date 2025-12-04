const mongoose = require('mongoose');

const deviceConditionSchema = new mongoose.Schema({
  condition: { type: String, required: true, unique: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DeviceCondition', deviceConditionSchema);