import mongoose from "mongoose";
import Admin from "../model/AdminModel";
import connectDb from "../connection";

const initAdmin = async () => {
  try {
    await connectDb();

    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const admin = await Admin.create({
      username: "admin",
      password: "admin123",
    });

    console.log("Admin user created successfully:");
    console.log("Username: admin");
    console.log("Password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

initAdmin();

