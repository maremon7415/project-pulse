"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Activity, Info } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Props received from parent
interface CheckInFormProps {
  projectId: string;
  projectName: string;
}

export function CheckInForm({ projectId, projectName }: CheckInFormProps) {
  const router = useRouter();

  // Form state
  const [progress, setProgress] = useState([50]); // Slider expects an array
  const [confidence, setConfidence] = useState(3);
  const [blockers, setBlockers] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Submit weekly check-in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send check-in data to API
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectId,
          type: "employee_update",
          progress: progress[0],
          confidence,
          blockers,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      // Show success state and refresh data
      setIsSuccess(true);
      router.refresh();

      // Reset form after short delay
      setTimeout(() => {
        setIsSuccess(false);
        setProgress([progress[0]]); // Keep current progress
        setBlockers("");
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      {/* Header */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Weekly Update
        </CardTitle>
        <CardDescription>Log your progress for {projectName}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success message */}
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="font-bold">Update Posted!</h3>
          </div>
        ) : (
          /* Main form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Progress slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Completion Status</Label>
                <span className="text-2xl font-bold text-primary">
                  {progress[0]}%
                </span>
              </div>

              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="cursor-pointer"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started</span>
                <span>Halfway</span>
                <span>Done</span>
              </div>
            </div>

            {/* 2. Confidence level */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Confidence Level</Label>

                {/* Tooltip explanation */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      How confident are you that we will meet the deadline?
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setConfidence(level)}
                    className={`
                      flex-1 py-2 rounded-md text-sm font-medium transition-all border
                      ${
                        confidence === level
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background hover:bg-muted text-muted-foreground border-border"
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* 3. Blockers input */}
            <div className="space-y-2">
              <Label htmlFor="blockers">Blockers / Risks</Label>
              <Textarea
                id="blockers"
                placeholder="Is anything slowing you down?"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="resize-none min-h-20"
              />
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Posting..." : "Post Update"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
