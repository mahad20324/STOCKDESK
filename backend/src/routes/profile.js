const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

router.use(authenticate);
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
