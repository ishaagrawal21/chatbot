import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chatbot";
    const connect = await mongoose.connect(mongoUri);
    console.log("DB Connected");
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDb;

