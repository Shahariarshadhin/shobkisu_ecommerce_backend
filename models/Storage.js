const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
  ram: { type: String, required: true },
  rom: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Storage', storageSchema);
