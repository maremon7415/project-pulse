import mongoose, { Schema, type Document, type Model } from "mongoose"

export enum ProjectStatus {
  ON_TRACK = "On Track",
  AT_RISK = "At Risk",
  CRITICAL = "Critical",
  COMPLETED = "Completed",
}

export interface IProject extends Document {
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: ProjectStatus
  healthScore: number
  client: mongoose.Types.ObjectId
  employees: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Please provide a project name"],
    },
    description: {
      type: String,
      required: [true, "Please provide a project description"],
    },
    startDate: {
      type: Date,
      required: [true, "Please provide a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide an end date"],
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ON_TRACK,
    },
    healthScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a client"],
    },
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)

export default Project
