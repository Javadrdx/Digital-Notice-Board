require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const newPassword = "password123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { email: "javad@example.com" },
      { $set: { password: hashedPassword } }
    );

    console.log("Password reset successfully!");
    console.log("Users updated:", result.modifiedCount);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

resetPassword();