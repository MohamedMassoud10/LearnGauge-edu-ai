const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");

dotenv.config(); // لو عندك .env file

const DB =
  "mongodb+srv://reemsayed221:HF8YmX%40f%249RQc2i@cluster0.w0n2u.mongodb.net/LearnGauge?retryWrites=true&w=majority&appName=Cluster0"; // Use your correct URI

const connectDB = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");

    await createAdminUser(); // Call this only after DB is connected
  } catch (err) {
    console.error("Connection error:", err.message);
  }
};

const createAdminUser = async () => {
  try {
    const user = await User.create({
      name: "Mohamed Massoud",
      email: "admin@massoud.com",
      password: "111111",
      passwordConfirm: "111111",
    });

    console.log("Admin user created:", user);
  } catch (err) {
    console.error("Error creating user:", err.message);
  } finally {
    mongoose.disconnect();
  }
};

connectDB();
