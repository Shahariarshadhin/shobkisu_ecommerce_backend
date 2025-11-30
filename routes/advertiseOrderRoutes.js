const express = require('express')
const router = express.Router()
const AdvertiseOrder = require('../models/AdvertiseOrder')

const useDb = !!process.env.MONGO_URI
const advertiseOrdersMemory = []

router.post('/', async (req, res) => {
  const { productId, name, phone, address, quantity } = req.body
  if (!productId || !name || !phone || !address || !quantity) return res.status(400).json({ message: 'Invalid payload' })
  if (useDb) {
    const order = await AdvertiseOrder.create({ productId, name, phone, address, quantity })
    res.status(201).json({ id: order._id })
  } else {
    const id = String(advertiseOrdersMemory.length + 1)
    advertiseOrdersMemory.push({ id, productId, name, phone, address, quantity })
    res.status(201).json({ id })
  }
})

module.exports = router
