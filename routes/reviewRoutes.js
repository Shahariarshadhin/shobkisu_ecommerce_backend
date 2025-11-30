const express = require('express')
const router = express.Router()
const Review = require('../models/Review')

const useDb = !!process.env.MONGO_URI
const reviewsMemory = []

router.get('/:productId', async (req, res) => {
  const { productId } = req.params
  if (useDb) {
    const reviews = await Review.find({ productId })
    res.json(reviews)
  } else {
    res.json(reviewsMemory.filter(r => r.productId === productId))
  }
})

router.post('/:productId', async (req, res) => {
  const { productId } = req.params
  const { name, rating, comment } = req.body
  if (!name || !rating || !comment) return res.status(400).json({ message: 'Invalid payload' })
  if (useDb) {
    const review = await Review.create({ productId, name, rating, comment })
    res.status(201).json({ id: review._id })
  } else {
    const id = String(reviewsMemory.length + 1)
    reviewsMemory.push({ id, productId, name, rating, comment })
    res.status(201).json({ id })
  }
})

module.exports = router
