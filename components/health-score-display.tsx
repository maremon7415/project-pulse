import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/models/Project";

interface HealthScoreDisplayProps {
  score: number;
  status: ProjectStatus;
  projectName: string;
}

export function HealthScoreDisplay({
  score,
  status,
  projectName,
}: HealthScoreDisplayProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-500 stroke-emerald-500";
    if (s >= 60) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-500";
  };

  const colorClasses = getColor(score);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let statusText = "";
  let descriptionText = "";

  if (score >= 80) {
    statusText = "Excellent Condition";
    descriptionText = "Project is meeting all KPIs and deadlines.";
  } else if (score >= 60) {
    statusText = "Needs Attention";
    descriptionText = "Minor blockers are affecting velocity.";
  } else {
    statusText = "Critical State";
    descriptionText = "Immediate intervention required to get back on track.";
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Health Score</CardTitle>
        <Badge
          variant={status === ProjectStatus.ON_TRACK ? "default" : "secondary"}
        >
          {status.replace("_", " ")}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        {/* Circular Progress Gauge */}
        <div className="relative h-24 w-24 flex items-center justify-center">
          <svg
            className="h-full w-full -rotate-90 transform"
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Health score is ${score} out of 100`}
          >
            <circle
              className="text-muted/20 stroke-current"
              strokeWidth="10"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className={`${colorClasses} transition-all duration-1000 ease-out`}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className={`absolute flex flex-col items-center`}>
            <span
              className={`text-2xl font-bold ${colorClasses.split(" ")[0]}`}
            >
              {score}
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <p className="font-medium text-foreground">{statusText}</p>
          <p className="text-sm text-muted-foreground max-w-50">
            {descriptionText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
