const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.get('/notifications/:userId', getNotifications);
router.put('/notifications/:id/read', markAsRead);

module.exports = router;