import { format, formatDistanceToNow } from "date-fns";
import {
  GitCommitHorizontal,
  AlertOctagon,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

/* ---------- Types ---------- */

type EmployeeUpdate = {
  type: "employee_update";
  user: { name: string; id?: string };
  progress: number;
  confidence: number;
  blockers?: string | null;
};

type ClientFeedback = {
  type: "client_feedback";
  user: { name: string; id?: string };
  satisfaction: number;
  communication: number;
  comments?: string;
};

type RiskData = {
  title: string;
  mitigation: string;
  severity: "Low" | "Medium" | "High";
  reporter: { name: string; id?: string };
};

type Activity =
  | {
      type: "checkin";
      data: EmployeeUpdate | ClientFeedback;
      createdAt: string | Date;
    }
  | {
      type: "risk";
      data: RiskData;
      createdAt: string | Date;
    };

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  // Avatar initials helper
  const getInitials = (name?: string) =>
    (name || "U")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // Relative + exact timestamp
  const timeLabel = (date: string | Date) => {
    const d = new Date(date);
    return `${formatDistanceToNow(d, { addSuffix: true })} • ${format(
      d,
      "MMM d, h:mm a"
    )}`;
  };

  // Tone based on progress & confidence
  const getEmployeeTone = (progress: number, confidence: number) => {
    let bg = "bg-emerald-50/40 border-emerald-100";
    if (progress < 40) bg = "bg-red-50/40 border-red-100";
    else if (progress < 75) bg = "bg-amber-50/40 border-amber-100";

    let text = "text-emerald-800";
    if (confidence <= 2) text = "text-red-800";
    else if (confidence === 3) text = "text-amber-800";

    return { bg, text };
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommitHorizontal className="h-5 w-5 text-muted-foreground" />
          Project History
        </CardTitle>
        <CardDescription>
          Real-time feed of updates, risks, and feedback.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative px-6">
        {activities.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-60"
            role="status"
            aria-live="polite"
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div className="relative space-y-8">
            {/* Timeline line */}
            <div
              className="absolute left-4.75 top-2 bottom-2 w-0.5 bg-border/60 -z-10"
              aria-hidden="true"
            />

            {activities.map((activity, index) => {
              const createdAt = activity.createdAt;

              const actorName =
                ("user" in activity.data && activity.data.user?.name) ||
                ("reporter" in activity.data && activity.data.reporter?.name) ||
                "Unknown";

              return (
                <div key={index} className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-none">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-background ring-1 ring-border ${
                        activity.type === "risk"
                          ? "bg-red-50 text-red-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                      aria-hidden="true"
                    >
                      {activity.type === "risk" ? (
                        <AlertOctagon className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 pt-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-muted-foreground/10">
                            {getInitials(actorName)}
                          </AvatarFallback>
                        </Avatar>

                        <span className="text-sm font-medium">{actorName}</span>

                        <span className="text-sm text-muted-foreground">
                          {activity.type === "risk"
                            ? "logged a risk"
                            : (activity.data as any).type === "employee_update"
                            ? "posted an update"
                            : "shared client feedback"}
                        </span>
                      </div>

                      <time
                        className="text-xs text-muted-foreground whitespace-nowrap"
                        title={format(
                          new Date(createdAt),
                          "yyyy-MM-dd HH:mm:ss"
                        )}
                      >
                        {timeLabel(createdAt)}
                      </time>
                    </div>

                    {/* Activity body */}
                    <div
                      className={`rounded-lg border p-3 text-sm shadow-sm ${
                        activity.type === "risk"
                          ? "bg-red-50/30 border-red-100"
                          : "bg-muted/30 border-border"
                      }`}
                      role="article"
                    >
                      {/* Employee update */}
                      {activity.type === "checkin" &&
                        (activity.data as EmployeeUpdate).type ===
                          "employee_update" &&
                        (() => {
                          const d = activity.data as EmployeeUpdate;
                          const { bg, text } = getEmployeeTone(
                            d.progress,
                            d.confidence
                          );

                          return (
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp
                                    className={`h-3.5 w-3.5 ${
                                      d.progress >= 75
                                        ? "text-emerald-600"
                                        : d.progress >= 40
                                        ? "text-amber-600"
                                        : "text-red-600"
                                    }`}
                                  />
                                  <span className="font-semibold">
                                    {d.progress}% Progress
                                  </span>
                                </div>

                                <Separator
                                  orientation="vertical"
                                  className="h-3"
                                />

                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">
                                    Confidence:
                                  </span>
                                  <span className="font-semibold">
                                    {d.confidence}/5
                                  </span>
                                </div>
                              </div>

                              {d.blockers && (
                                <div
                                  className={`p-2 rounded text-xs flex gap-2 border ${bg}`}
                                >
                                  <ShieldAlert
                                    className={`h-3.5 w-3.5 ${text}`}
                                  />
                                  <span className={`${text} wrap-break-word`}>
                                    {d.blockers}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      {/* Client feedback */}
                      {activity.type === "checkin" &&
                        (activity.data as ClientFeedback).type ===
                          "client_feedback" && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Badge
                                variant="outline"
                                className="bg-background"
                              >
                                Satisfaction:{" "}
                                {(activity.data as ClientFeedback).satisfaction}
                                /5
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-background"
                              >
                                Comm:{" "}
                                {
                                  (activity.data as ClientFeedback)
                                    .communication
                                }
                                /5
                              </Badge>
                            </div>

                            {(activity.data as ClientFeedback).comments && (
                              <p className="italic text-muted-foreground">
                                "{(activity.data as ClientFeedback).comments}"
                              </p>
                            )}
                          </div>
                        )}

                      {/* Risk */}
                      {activity.type === "risk" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {(activity.data as RiskData).title}
                            </span>
                            <Badge
                              variant={
                                (activity.data as RiskData).severity === "High"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {(activity.data as RiskData).severity}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            Mitigation: {(activity.data as RiskData).mitigation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
