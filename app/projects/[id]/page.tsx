import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { format } from "date-fns";

import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { HealthScoreDisplay } from "@/components/health-score-display";
import { ActivityTimeline } from "@/components/activity-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Calendar, Users, Building, Mail } from "lucide-react";
import { baseUrl } from "@/lib/utils";

/**
 * Fetch full project details with activity history
 */
async function getProjectDetails(id: string) {
  const cookieStore = await cookies();

  const response = await fetch(`${baseUrl}/api/projects/${id}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }

  return response.json();
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    // Ensure authenticated user
    const user = await getCurrentUser();
    if (!user) {
      redirect("/");
    }

    const { id } = await params;
    const { project, activities } = await getProjectDetails(id);

    // Generate avatar initials
    const getInitials = (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
      <div className="min-h-screen bg-muted/20">
        <Header user={{ name: user.name, role: user.role }} />

        <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Project header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant="outline"
                    className="uppercase tracking-widest text-[10px]"
                  >
                    Project ID: {project._id.slice(-6)}
                  </Badge>

                  <Badge
                    variant={
                      project.status === "on_track" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight">
                  {project.name}
                </h1>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>

            <HealthScoreDisplay
              score={project.healthScore}
              status={project.status}
              projectName={project.name}
            />
          </div>

          {/* Project information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-semibold">
                      {project.startDate
                        ? format(new Date(project.startDate), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Target Deadline
                    </p>
                    <p className="font-semibold">
                      {project.endDate
                        ? format(new Date(project.endDate), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Client Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Organization
                    </p>
                    <p className="font-semibold">
                      {project.client?.name || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="font-semibold text-sm">
                      {project.client?.email || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(project.employees) &&
                  project.employees.length > 0 ? (
                    project.employees.map((employee: any) => (
                      <div
                        key={employee._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate">
                            {employee.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">No team assigned</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity */}
          <section>
            <ActivityTimeline activities={activities} />
          </section>
        </main>
      </div>
    );
  } catch {
    redirect("/");
  }
}
