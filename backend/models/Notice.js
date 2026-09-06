const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetRole: {
      type: String,
      enum: ["all", "admin", "staff", "student"],
      default: "all",
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    // Uploaded file name
    fileName: {
      type: String,
      default: null,
    },

    // Uploaded file path
    filePath: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notice", noticeSchema);