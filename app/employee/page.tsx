import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/models/User";
import { format } from "date-fns";

// UI Components
import { Header } from "@/components/header";
import { ProjectCard } from "@/components/project-card";
import { CheckInForm } from "@/components/checkin-form";
import { RiskForm } from "@/components/risk-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import { AlertCircle, Clock, Briefcase, Zap } from "lucide-react";

// Data & Utils
import { connectDB } from "@/lib/mongodb";
import Risk, { RiskStatus } from "@/models/Risk";
import { baseUrl } from "@/lib/utils";

type Project = {
  _id: string;
  name: string;
  status?: string;
  missingCheckIn?: boolean;
};

/**
 * Fetch projects assigned to the logged-in employee
 */
async function getProjects(): Promise<Project[]> {
  const cookieStore = await cookies();

  const res = await fetch(`${baseUrl}/api/projects`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  const json = await res.json();
  return Array.isArray(json.projects) ? json.projects : [];
}

/**
 * Count open risks created by the employee
 */
async function getOpenRisksCount(userId: string): Promise<number> {
  try {
    await connectDB();
    const count = await Risk.countDocuments({
      user: userId,
      status: RiskStatus.OPEN,
    });
    return Number(count) || 0;
  } catch {
    return 0;
  }
}

export default async function EmployeeDashboard() {
  try {
    // Role protection
    const user = await requireRole([UserRole.EMPLOYEE]);

    // Load dashboard data in parallel
    const [projects, openRisksCount] = await Promise.all([
      getProjects(),
      getOpenRisksCount(user._id.toString()),
    ]);

    // Projects that are missing weekly check-ins
    const pendingCheckIns = projects.filter((p) => p.missingCheckIn);

    // Prioritize project needing action
    const focusProject = pendingCheckIns[0] ?? projects[0] ?? null;

    return (
      <div className="min-h-screen bg-muted/20">
        <Header user={{ name: user.name, role: user.role }} />

        <main className="container max-w-7xl mx-auto px-4 py-8 space-y-10">
          {/* Dashboard Summary */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Workspace</h2>
                <p className="text-muted-foreground mt-1">
                  {format(new Date(), "EEEE, MMMM do")}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Assignments
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>

              <Card
                className={
                  pendingCheckIns.length > 0
                    ? "bg-amber-50/30 border-amber-200"
                    : ""
                }
              >
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Missing Updates
                  </CardTitle>
                  <Clock
                    className={`h-4 w-4 ${
                      pendingCheckIns.length > 0
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      pendingCheckIns.length > 0 ? "text-amber-600" : ""
                    }`}
                  >
                    {pendingCheckIns.length}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={
                  openRisksCount > 0 ? "bg-rose-50/30 border-rose-200" : ""
                }
              >
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Open Risks
                  </CardTitle>
                  <AlertCircle
                    className={`h-4 w-4 ${
                      openRisksCount > 0
                        ? "text-rose-600"
                        : "text-muted-foreground"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      openRisksCount > 0 ? "text-rose-600" : ""
                    }`}
                  >
                    {openRisksCount}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Project List */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">
              Your Projects
            </h3>

            {projects.length > 0 ? (
              <div
                className={
                  projects.length > 1
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col items-center w-full"
                }
              >
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed py-12 flex justify-center text-muted-foreground">
                No projects assigned.
              </Card>
            )}
          </section>

          {/* Quick Actions */}
          {focusProject && (
            <section className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold tracking-tight">
                  Quick Actions
                </h3>
                <Badge variant="outline" className="text-sm font-normal py-1">
                  Focus:
                  <span className="font-semibold ml-1">
                    {focusProject.name}
                  </span>
                </Badge>
              </div>

              {pendingCheckIns.includes(focusProject) && (
                <div className="bg-amber-50 text-amber-900 px-4 py-2 rounded-md text-sm flex items-center gap-2 border border-amber-200">
                  <Zap className="h-4 w-4" />
                  This project requires a weekly check-in.
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <CheckInForm
                    projectId={focusProject._id}
                    projectName={focusProject.name}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <RiskForm
                    projectId={focusProject._id}
                    projectName={focusProject.name}
                  />
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    );
  } catch {
    redirect("/");
  }
}
