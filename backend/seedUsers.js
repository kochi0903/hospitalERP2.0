import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import User from "./models/User.js";

dotenv.config({ path: "./backend/.env" });

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Create Admin
    const adminEmail = "admin@hospital.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "Main Admin",
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "admin",
        active: true
      });
      console.log("Admin account created: admin@hospital.com / admin123");
    } else {
      console.log("Admin account already exists.");
    }

    // Create Accountant
    const accountantEmail = "accountant@hospital.com";
    const existingAccountant = await User.findOne({ email: accountantEmail });
    if (!existingAccountant) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("acc123", salt);
      await User.create({
        name: "Senior Accountant",
        email: accountantEmail,
        passwordHash: hashedPassword,
        role: "accountant",
        active: true
      });
      console.log("Accountant account created: accountant@hospital.com / acc123");
    } else {
      console.log("Accountant account already exists.");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
