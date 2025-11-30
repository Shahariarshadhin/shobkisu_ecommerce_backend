const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const advertiseOrderRoutes = require('./routes/advertiseOrderRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

const app = express()
app.use(cors())
app.use(express.json())

const { MONGO_URI } = process.env
if (MONGO_URI) {
  mongoose.connect(MONGO_URI).then(() => console.log('Mongo connected')).catch(err => console.error(err))
}

app.get('/', (req, res) => res.json({ ok: true }))
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/advertise-orders', advertiseOrderRoutes)
app.use('/api/reviews', reviewRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on ${PORT}`))
