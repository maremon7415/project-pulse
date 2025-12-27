import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import Project from "@/models/Project"
import CheckIn from "@/models/CheckIn"
import { UserRole } from "@/models/User"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let projects

    if (user.role === UserRole.ADMIN) {
      // Admin sees all projects
      projects = await Project.find({})
        .populate("client", "name email")
        .populate("employees", "name email")
        .sort({ healthScore: 1 }) // Sort by health score ascending (critical first)
    } else if (user.role === UserRole.EMPLOYEE) {
      // Employee sees assigned projects
      projects = await Project.find({ employees: user._id })
        .populate("client", "name email")
        .populate("employees", "name email")
        .sort({ healthScore: 1 })
    } else if (user.role === UserRole.CLIENT) {
      // Client sees their projects
      projects = await Project.find({ client: user._id })
        .populate("client", "name email")
        .populate("employees", "name email")
        .sort({ healthScore: 1 })
    }

    // Check for missing check-ins (no check-in in the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const projectsWithMissingCheckIns = await Promise.all(
      projects!.map(async (project) => {
        const recentCheckIn = await CheckIn.findOne({
          project: project._id,
          createdAt: { $gte: sevenDaysAgo },
        })

        return {
          ...project.toObject(),
          missingCheckIn: !recentCheckIn,
        }
      }),
    )

    return NextResponse.json({ projects: projectsWithMissingCheckIns })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
