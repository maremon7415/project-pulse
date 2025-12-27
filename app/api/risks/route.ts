import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import Risk from "@/models/Risk"
import { calculateAndUpdateHealthScore } from "@/lib/health-score"
import { UserRole } from "@/models/User"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    await connectDB()

    const query: any = {}

    if (projectId) {
      query.project = projectId
    }

    if (user.role === UserRole.EMPLOYEE) {
      // Employees see risks for their projects
      query.user = user._id
    }

    const risks = await Risk.find(query).populate("user", "name").sort({ createdAt: -1 })

    return NextResponse.json({ risks })
  } catch (error) {
    console.error("Get risks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== UserRole.EMPLOYEE && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    await connectDB()

    const risk = await Risk.create({
      ...body,
      user: user._id,
    })

    // Recalculate health score
    await calculateAndUpdateHealthScore(body.project)

    return NextResponse.json({ risk })
  } catch (error) {
    console.error("Create risk error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
