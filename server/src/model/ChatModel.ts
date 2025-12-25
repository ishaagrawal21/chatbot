import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  sessionId: string;
  userIp?: string;
  userAgent?: string;
  status: "active" | "closed";
  aiEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userIp: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    aiEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);

