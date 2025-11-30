const AdvertiseOrder = require('../models/AdvertiseOrder')

const useDb = !!process.env.MONGODB_URI
const advertiseOrdersMemory = []

exports.createAdvertiseOrder = async (req, res) => {
  try {
    const { productId, name, phone, address, quantity } = req.body
    
    if (!productId || !name || !phone || !address || !quantity) {
      return res.status(400).json({ message: 'Invalid payload' })
    }
    
    if (useDb) {
      const order = await AdvertiseOrder.create({ 
        productId, 
        name, 
        phone, 
        address, 
        quantity 
      })
      return res.status(201).json({ id: order._id })
    } else {
      const id = String(advertiseOrdersMemory.length + 1)
      advertiseOrdersMemory.push({ 
        id, 
        productId, 
        name, 
        phone, 
        address, 
        quantity 
      })
      return res.status(201).json({ id })
    }
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error creating advertise order', 
      error: error.message 
    })
  }
}