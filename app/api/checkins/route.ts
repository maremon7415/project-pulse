import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import CheckIn from "@/models/CheckIn"
import { calculateAndUpdateHealthScore } from "@/lib/health-score"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    await connectDB()

    const checkIn = await CheckIn.create({
      ...body,
      user: user._id,
    })

    // Recalculate health score
    await calculateAndUpdateHealthScore(body.project)

    return NextResponse.json({ checkIn })
  } catch (error) {
    console.error("Create check-in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
