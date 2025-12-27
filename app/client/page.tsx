import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/models/User";
import { format } from "date-fns";

import { Header } from "@/components/header";
import { ProjectCard } from "@/components/project-card";
import { ClientFeedbackForm } from "@/components/client-feedback-form";
import { HealthScoreDisplay } from "@/components/health-score-display";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { baseUrl } from "@/lib/utils";

/* Fetch projects using authenticated cookies */
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

export default async function ClientDashboard() {
  try {
    /* Restrict access to client users */
    const user = await requireRole([UserRole.CLIENT]);

    /* Load assigned projects */
    const projects = await getProjects();

    /* Dashboard metrics */
    const totalProjects = projects.length;
    const avgHealthScore =
      totalProjects > 0
        ? Math.round(
            projects.reduce((sum: number, p: any) => sum + p.healthScore, 0) /
              totalProjects
          )
        : 0;

    const activeProjects = projects.filter(
      (p: any) => p.status === "on_track" || p.status === "at_risk"
    ).length;

    return (
      <div className="min-h-screen bg-muted/20">
        {/* Page header */}
        <Header user={{ name: user.name, role: user.role }} />

        <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Overview section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {activeProjects} currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Health
                </CardTitle>
                <TrendingUp
                  className={`h-4 w-4 ${
                    avgHealthScore >= 80 ? "text-emerald-500" : "text-amber-500"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgHealthScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all active workflows
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Pending Actions
                </CardTitle>
                <Badge variant="secondary" className="bg-background">
                  New
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">1</div>
                <p className="text-xs text-primary/80">
                  Weekly check-in required
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project list */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight">
                  Active Projects
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  {projects.map((project: any) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </div>

              {/* Client actions */}
              <div className="space-y-6">
                <div className="sticky top-24">
                  <h3 className="text-xl font-semibold tracking-tight mb-4">
                    Action Items
                  </h3>

                  <ClientFeedbackForm
                    projectId={projects[0]._id}
                    projectName={projects[0].name}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No projects found</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  You don't have any active projects assigned yet.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  } catch (error) {
    /* Fallback redirect */
    console.error("Dashboard Error:", error);
    redirect("/");
  }
}
