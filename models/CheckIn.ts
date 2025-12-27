import mongoose, { Schema, type Document, type Model } from "mongoose"

export enum CheckInType {
  EMPLOYEE_UPDATE = "employee_update",
  CLIENT_FEEDBACK = "client_feedback",
}

export interface ICheckIn extends Document {
  project: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  type: CheckInType
  // Employee fields
  progress?: number // Percentage 0-100
  confidence?: number // 1-5 scale
  blockers?: string
  // Client fields
  satisfaction?: number // 1-5 scale
  communication?: number // 1-5 scale
  comments?: string
  createdAt: Date
  updatedAt: Date
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Please provide a project"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    type: {
      type: String,
      enum: Object.values(CheckInType),
      required: [true, "Please provide a check-in type"],
    },
    // Employee update fields
    progress: {
      type: Number,
      min: 0,
      max: 100,
    },
    confidence: {
      type: Number,
      min: 1,
      max: 5,
    },
    blockers: String,
    // Client feedback fields
    satisfaction: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: String,
  },
  {
    timestamps: true,
  },
)

const CheckIn: Model<ICheckIn> = mongoose.models.CheckIn || mongoose.model<ICheckIn>("CheckIn", CheckInSchema)

export default CheckIn
