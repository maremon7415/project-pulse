import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/models/User";
import { Header } from "@/components/header";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  TimerReset,
} from "lucide-react";
import { baseUrl } from "@/lib/utils";

/* Fetch all projects with user cookies */
async function getProjects() {
  const cookieStore = await cookies();

  const response = await fetch(`${baseUrl}/api/projects`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();
  return data.projects;
}

export default async function AdminDashboard() {
  try {
    /* Allow access only to admin users */
    const user = await requireRole([UserRole.ADMIN]);

    /* Load all projects */
    const projects = await getProjects();

    /* Group projects by status */
    const onTrackProjects = projects.filter(
      (p: any) => p.status === "On Track"
    );
    const atRiskProjects = projects.filter((p: any) => p.status === "At Risk");
    const criticalProjects = projects.filter(
      (p: any) => p.status === "Critical"
    );

    /* Projects missing recent check-ins */
    const missingCheckIns = projects.filter((p: any) => p.missingCheckIn);

    return (
      <div className="min-h-screen bg-muted/40">
        {/* Top navigation header */}
        <Header user={{ name: user.name, role: user.role }} />

        <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Page title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard Overview
              </h2>
              <p className="text-muted-foreground mt-1">
                Monitor project health, identify risks, and track team progress.
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active monitoring
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Track</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {onTrackProjects.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Healthy projects
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {atRiskProjects.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {criticalProjects.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate action
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts requiring attention */}
          {(missingCheckIns.length > 0 || criticalProjects.length > 0) && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Attention Required
              </h3>

              <div className="grid gap-6">
                {/* Missing check-ins */}
                {missingCheckIns.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-900">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <TimerReset className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-base text-amber-900 dark:text-amber-500">
                          Missing Recent Check-Ins
                        </CardTitle>
                      </div>
                      <p className="text-sm text-amber-700/80 dark:text-amber-400">
                        These projects haven't had a check-in within the last 7
                        days.
                      </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {missingCheckIns.map((project: any) => (
                        <ProjectCard key={project._id} project={project} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Critical projects */}
                {criticalProjects.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-destructive uppercase tracking-wider">
                        Critical Status
                      </span>
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                        {criticalProjects.length} Projects
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {criticalProjects.map((project: any) => (
                        <ProjectCard key={project._id} project={project} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-border/60 my-6" />

          {/* Project lists by status */}
          <div className="space-y-8">
            {atRiskProjects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="text-lg font-semibold">At Risk Projects</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {atRiskProjects.map((project: any) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {onTrackProjects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="text-lg font-semibold">On Track</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onTrackProjects.map((project: any) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    /* Fallback redirect on auth or fetch failure */
    redirect("/");
  }
}
