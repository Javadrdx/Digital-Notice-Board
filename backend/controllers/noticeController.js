const Notice = require("../models/Notice");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ================================
// CREATE NOTICE
// ================================
const createNotice = async (req, res) => {
    try {
        const { title, content, targetRole, expiryDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required",
            });
        }

        const notice = await Notice.create({
            title,
            content,
            targetRole: targetRole || "all",
            expiryDate: expiryDate || null,
            createdBy: req.user.id,

            // Save uploaded file information
            fileName: req.file ? req.file.filename : null,
            filePath: req.file ? `/uploads/${req.file.filename}` : null,
        });
        // CREATE NOTIFICATIONS
        const users = await User.find(
            targetRole && targetRole !== "all"
                ? { role: targetRole }
                : {}
        );

        const notifications = users.map((user) => ({
            user: user._id,
            message: `New notice: ${title}`,
            notice: notice._id,
            isRead: false,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json({
            message: "Notice created successfully",
            notice,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ================================
// GET ALL NOTICES
// ================================
const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({
            $and: [
                {
                    $or: [
                        { targetRole: "all" },
                        { targetRole: req.user.role },
                    ],
                },
                {
                    $or: [
                        { expiryDate: null },
                        { expiryDate: { $gt: new Date() } },
                    ],
                },
            ],
        })
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            notices,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ================================
// GET ONE NOTICE
// ================================
const getNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id)
            .populate("createdBy", "name email role");

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found",
            });
        }

        res.status(200).json({
            notice,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ================================
// UPDATE NOTICE
// ================================
const updateNotice = async (req, res) => {
    try {
        const {
            title,
            content,
            targetRole,
            expiryDate,
        } = req.body;

        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found",
            });
        }

        // Update only values that were provided
        if (title !== undefined) {
            notice.title = title;
        }

        if (content !== undefined) {
            notice.content = content;
        }

        if (targetRole !== undefined) {
            notice.targetRole = targetRole;
        }

        if (expiryDate !== undefined) {
            notice.expiryDate = expiryDate || null;
        }

        // Update uploaded file if a new file was selected
        if (req.file) {
            notice.fileName = req.file.filename;
            notice.filePath = `/uploads/${req.file.filename}`;
        }

        await notice.save();

        res.status(200).json({
            message: "Notice updated successfully",
            notice,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ================================
// DELETE NOTICE
// ================================
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found",
            });
        }

        res.status(200).json({
            message: "Notice deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ================================
// EXPORT
// ================================
module.exports = {
    createNotice,
    getNotices,
    getNotice,
    updateNotice,
    deleteNotice,
};