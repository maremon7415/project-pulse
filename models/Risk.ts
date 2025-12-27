import mongoose, { Schema, type Document, type Model } from "mongoose"

export enum RiskSeverity {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum RiskStatus {
  OPEN = "Open",
  RESOLVED = "Resolved",
}

export interface IRisk extends Document {
  project: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  title: string
  severity: RiskSeverity
  mitigation: string
  status: RiskStatus
  createdAt: Date
  updatedAt: Date
}

const RiskSchema = new Schema<IRisk>(
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
    title: {
      type: String,
      required: [true, "Please provide a risk title"],
    },
    severity: {
      type: String,
      enum: Object.values(RiskSeverity),
      default: RiskSeverity.MEDIUM,
    },
    mitigation: {
      type: String,
      required: [true, "Please provide a mitigation plan"],
    },
    status: {
      type: String,
      enum: Object.values(RiskStatus),
      default: RiskStatus.OPEN,
    },
  },
  {
    timestamps: true,
  },
)

const Risk: Model<IRisk> = mongoose.models.Risk || mongoose.model<IRisk>("Risk", RiskSchema)

export default Risk
