const express = require('express');
const router = express.Router();
const advertiseContentController = require('../controllers/advertiseContentController');

// Search advertise contents (must be before /:id and /:slug routes)
router.get('/search', advertiseContentController.searchAdvertiseContents);

// Get active offers only
router.get('/active', advertiseContentController.getActiveOffers);

// Create new advertise content
router.post('/', advertiseContentController.createAdvertiseContent);

// Get all advertise contents (supports query params: ?status=active&sort=ending-soon)
router.get('/', advertiseContentController.getAllAdvertiseContents);

// Get by slug (must be before /:id to avoid conflicts)
router.get('/slug/:slug', advertiseContentController.getAdvertiseContentBySlug);

// Get single advertise content by ID
router.get('/:id', advertiseContentController.getAdvertiseContentById);

// Update advertise content
router.put('/:id', advertiseContentController.updateAdvertiseContent);

// Delete advertise content
router.delete('/:id', advertiseContentController.deleteAdvertiseContent);

module.exports = router;