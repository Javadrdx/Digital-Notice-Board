const express = require("express");

const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get my notifications
router.get("/", protect, getMyNotifications);

// Mark notification as read
router.put("/:id/read", protect, markAsRead);

module.exports = router;