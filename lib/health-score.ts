import { connectDB } from "./mongodb"
import Project, { ProjectStatus } from "@/models/Project"
import CheckIn, { CheckInType } from "@/models/CheckIn"
import Risk, { RiskSeverity, RiskStatus } from "@/models/Risk"

export async function calculateAndUpdateHealthScore(projectId: string) {
  await connectDB()

  // Get the most recent check-ins
  const recentEmployeeCheckIns = await CheckIn.find({
    project: projectId,
    type: CheckInType.EMPLOYEE_UPDATE,
  })
    .sort({ createdAt: -1 })
    .limit(5)

  const recentClientFeedback = await CheckIn.findOne({
    project: projectId,
    type: CheckInType.CLIENT_FEEDBACK,
  }).sort({ createdAt: -1 })

  // Get open high-severity risks
  const openHighRisks = await Risk.countDocuments({
    project: projectId,
    severity: RiskSeverity.HIGH,
    status: RiskStatus.OPEN,
  })

  // Calculate base score components
  let clientSatisfactionScore = 50 // Default if no feedback
  if (recentClientFeedback && recentClientFeedback.satisfaction) {
    clientSatisfactionScore = (recentClientFeedback.satisfaction / 5) * 100
  }

  let employeeConfidenceScore = 60 // Default if no updates
  if (recentEmployeeCheckIns.length > 0) {
    const avgConfidence =
      recentEmployeeCheckIns.reduce((sum, ci) => sum + (ci.confidence || 3), 0) / recentEmployeeCheckIns.length
    employeeConfidenceScore = (avgConfidence / 5) * 100
  }

  let scheduleProgressScore = 60 // Default if no progress
  if (recentEmployeeCheckIns.length > 0) {
    const latestProgress = recentEmployeeCheckIns[0].progress || 50
    scheduleProgressScore = latestProgress
  }

  // Calculate weighted base score
  const baseScore = clientSatisfactionScore * 0.4 + employeeConfidenceScore * 0.3 + scheduleProgressScore * 0.3

  // Apply risk penalties
  const riskPenalty = openHighRisks * 10
  const finalScore = Math.max(0, Math.min(100, baseScore - riskPenalty))

  // Determine status based on score
  let status: ProjectStatus
  if (finalScore >= 80) {
    status = ProjectStatus.ON_TRACK
  } else if (finalScore >= 60) {
    status = ProjectStatus.AT_RISK
  } else {
    status = ProjectStatus.CRITICAL
  }

  // Update project
  await Project.findByIdAndUpdate(projectId, {
    healthScore: Math.round(finalScore),
    status,
  })

  return {
    healthScore: Math.round(finalScore),
    status,
    breakdown: {
      clientSatisfaction: Math.round(clientSatisfactionScore),
      employeeConfidence: Math.round(employeeConfidenceScore),
      scheduleProgress: Math.round(scheduleProgressScore),
      openHighRisks,
      riskPenalty,
    },
  }
}
