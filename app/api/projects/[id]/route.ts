import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import Project from "@/models/Project"
import CheckIn from "@/models/CheckIn"
import Risk from "@/models/Risk"
import { UserRole } from "@/models/User"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await connectDB()

    const project = await Project.findById(id).populate("client", "name email").populate("employees", "name email")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check access permissions
    if (user.role === UserRole.CLIENT && project.client._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (
      user.role === UserRole.EMPLOYEE &&
      !project.employees.some((emp: any) => emp._id.toString() === user._id.toString())
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get activity timeline
    const checkIns = await CheckIn.find({ project: id }).populate("user", "name role").sort({ createdAt: -1 })

    const risks = await Risk.find({ project: id }).populate("user", "name").sort({ createdAt: -1 })

    // Combine and sort by date
    const activities = [
      ...checkIns.map((ci) => ({
        type: "checkin",
        data: ci,
        createdAt: ci.createdAt,
      })),
      ...risks.map((risk) => ({
        type: "risk",
        data: risk,
        createdAt: risk.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      project: project.toObject(),
      activities,
    })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
