const express = require('express')
const router = express.Router()
const Order = require('../models/Order')

const useDb = !!process.env.MONGO_URI
const ordersMemory = []

router.post('/', async (req, res) => {
  const { name, phone, address, items, total } = req.body
  if (!name || !phone || !address || !Array.isArray(items) || typeof total !== 'number') return res.status(400).json({ message: 'Invalid payload' })
  if (useDb) {
    const order = await Order.create({ name, phone, address, items, total })
    res.status(201).json({ id: order._id })
  } else {
    const id = String(ordersMemory.length + 1)
    ordersMemory.push({ id, name, phone, address, items, total })
    res.status(201).json({ id })
  }
})

module.exports = router
