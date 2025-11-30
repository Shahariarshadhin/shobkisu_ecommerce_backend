const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

const useDb = !!process.env.MONGO_URI
const sampleProducts = [
  {
    id: '1',
    title: 'Wireless Headphones X100',
    price: 99.99,
    shortDescription: 'Comfort fit, 30h battery, noise reduction.',
    details: 'Over-ear wireless headphones with balanced sound and lightweight design.',
    faq: [
      { q: 'Does it support Bluetooth 5.3?', a: 'Yes' },
      { q: 'Can I use while charging?', a: 'Yes' },
    ],
    features: [
      'Hybrid noise reduction',
      '30 hours battery life',
      'Fast charging via USB‑C',
    ],
    technicalDetails: { drivers: '40mm', bluetooth: '5.3', weight: '240g' },
  },
  {
    id: '2',
    title: 'Smartwatch S20',
    price: 129.0,
    shortDescription: 'Heart rate, GPS, waterproof 5ATM.',
    details: 'Fitness smartwatch with AMOLED display and multi‑day battery.',
    faq: [
      { q: 'Works with iOS and Android?', a: 'Yes' },
      { q: 'Battery life?', a: 'Up to 7 days' },
    ],
    features: ['AMOLED display', 'GPS + GLONASS', 'Sleep tracking'],
    technicalDetails: { chipset: 'Dual‑core', sensors: 'HRM, SpO2, GPS', waterResistance: '5ATM' },
  },
]

router.get('/', async (req, res) => {
  if (useDb) {
    const products = await Product.find({})
    res.json(products)
  } else {
    res.json(sampleProducts)
  }
})

router.get('/:id', async (req, res) => {
  if (useDb) {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Not found' })
    res.json(product)
  } else {
    const product = sampleProducts.find(p => p.id === req.params.id)
    if (!product) return res.status(404).json({ message: 'Not found' })
    res.json(product)
  }
})

module.exports = router
