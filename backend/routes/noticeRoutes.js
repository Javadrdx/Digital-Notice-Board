const express = require("express");

const {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// CREATE NOTICE - ADMIN ONLY
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("file"),
  createNotice
);

// GET ALL NOTICES - LOGGED IN USERS
router.get(
  "/",
  protect,
  getNotices
);

// GET ONE NOTICE - LOGGED IN USERS
router.get(
  "/:id",
  protect,
  getNotice
);

// UPDATE NOTICE - ADMIN ONLY
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("file"),
  updateNotice
);

// DELETE NOTICE - ADMIN ONLY
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteNotice
);

module.exports = router;