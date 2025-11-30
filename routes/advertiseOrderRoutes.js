const express = require('express')
const router = express.Router()
const advertiseOrderController = require('../controllers/advertiseOrderController')

router.post('/', advertiseOrderController.createAdvertiseOrder)

module.exports = router