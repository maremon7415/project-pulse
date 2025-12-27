import Link from "next/link";
import {
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Activity,
  AlertTriangle,
  Building2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ProjectStatus } from "@/models/Project";

interface Employee {
  name: string;
  // image?: string; // add if available
}

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    healthScore: number;
    client: {
      name: string;
    };
    employees: Employee[];
    missingCheckIn?: boolean;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80)
      return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />;
    if (score >= 60)
      return <Activity className="h-3.5 w-3.5" aria-hidden="true" />;
    return <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />;
  };

  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ON_TRACK:
        return {
          variant: "default" as const,
          className: "bg-emerald-600 hover:bg-emerald-700",
        };
      case ProjectStatus.AT_RISK:
        return {
          variant: "secondary" as const,
          className: "text-amber-700 bg-amber-100 hover:bg-amber-200",
        };
      case ProjectStatus.CRITICAL:
        return { variant: "destructive" as const, className: "" };
      default:
        return {
          variant: "outline" as const,
          className: "text-muted-foreground",
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Link
      href={`/projects/${project._id}`}
      className="block group"
      aria-label={`View details for project ${project.name}`}
    >
      <Card
        className={`h-full transition-all duration-300 border-l-4 hover:shadow-md hover:-translate-y-1
          ${project.healthScore < 60 ? "border-red-600" : ""}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={statusConfig.variant}
                  className={`text-[10px] uppercase tracking-wider font-semibold ${statusConfig.className}`}
                >
                  {project.status.replace(/_/g, " ")}
                </Badge>

                {project.missingCheckIn && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-orange-200 text-orange-600 bg-orange-50 gap-1"
                    aria-label="Missing check-in alert"
                  >
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    Missing Check-in
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
                {project.name}
                <ArrowUpRight
                  className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </h3>
            </div>

            <div
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg border ${getHealthColor(
                project.healthScore
              )}`}
              aria-label={`Health score: ${project.healthScore} percent`}
              role="status"
            >
              <span className="text-xs font-bold flex items-center gap-1">
                {getHealthIcon(project.healthScore)}
                Health
              </span>
              <span className="text-lg font-black leading-none mt-0.5">
                {project.healthScore}%
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
            {project.description}
          </p>
        </CardContent>

        <Separator className="bg-border/50" />

        <CardFooter className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            <span
              className="font-medium truncate max-w-25"
              title={project.client.name}
            >
              {project.client.name}
            </span>
          </div>

          <div className="flex -space-x-2 overflow-hidden">
            {project.employees.slice(0, 3).map((employee) => (
              <Avatar
                key={employee.name} // Better than index if name unique
                className="inline-block h-7 w-7 border-2 border-background ring-1 ring-border"
                aria-label={`Employee: ${employee.name}`}
                title={employee.name}
              >
                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.employees.length > 3 && (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground ring-1 ring-border"
                aria-label={`${project.employees.length - 3} more employees`}
                title={`${project.employees.length - 3} more employees`}
              >
                +{project.employees.length - 3}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
