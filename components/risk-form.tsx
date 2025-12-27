"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RiskFormProps {
  projectId: string;
  projectName: string;
}

export function RiskForm({ projectId, projectName }: RiskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [mitigation, setMitigation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation before submit
    if (!title.trim() || !mitigation.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectId,
          title,
          severity,
          mitigation,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to log risk.");
      }

      router.refresh();

      // Reset form
      setTitle("");
      setSeverity("Medium");
      setMitigation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-rose-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-500">
          <ShieldAlert className="h-5 w-5" />
          Log New Risk
        </CardTitle>
        <CardDescription>
          Identify potential threats to {projectName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Risk Title</Label>
            <Input
              id="title"
              placeholder="e.g., Third-party API outage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              aria-invalid={!!error && !title.trim()}
              aria-describedby="title-error"
            />
            {error && !title.trim() && (
              <p id="title-error" className="text-xs text-red-600 mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Severity Level</Label>
            <RadioGroup
              value={severity}
              onValueChange={setSeverity}
              className="grid grid-cols-3 gap-4"
            >
              <Label
                htmlFor="low"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer ${
                  severity === "Low"
                    ? "border-emerald-500 bg-emerald-50/50"
                    : ""
                }`}
              >
                <RadioGroupItem value="Low" id="low" className="sr-only" />
                <CheckCircle2
                  className={`mb-2 h-6 w-6 ${
                    severity === "Low"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Low</span>
              </Label>

              <Label
                htmlFor="medium"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  severity === "Medium" ? "border-amber-500 bg-amber-50/50" : ""
                }`}
              >
                <RadioGroupItem
                  value="Medium"
                  id="medium"
                  className="sr-only"
                />
                <AlertTriangle
                  className={`mb-2 h-6 w-6 ${
                    severity === "Medium"
                      ? "text-amber-600"
                      : "text-muted-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Medium</span>
              </Label>

              <Label
                htmlFor="high"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  severity === "High" ? "border-rose-500 bg-rose-50/50" : ""
                }`}
              >
                <RadioGroupItem value="High" id="high" className="sr-only" />
                <ShieldAlert
                  className={`mb-2 h-6 w-6 ${
                    severity === "High"
                      ? "text-rose-600"
                      : "text-muted-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">High</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mitigation">Mitigation Strategy</Label>
            <Textarea
              id="mitigation"
              placeholder="How do we fix or avoid this?"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              required
              disabled={loading}
              aria-invalid={!!error && !mitigation.trim()}
              aria-describedby="mitigation-error"
            />
            {error && !mitigation.trim() && (
              <p id="mitigation-error" className="text-xs text-red-600 mt-1">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={loading}
            aria-live="polite"
          >
            {loading ? "Logging Risk..." : "Create Risk Log"}
          </Button>

          {/* Show generic error if any */}
          {error && title.trim() && mitigation.trim() && (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
