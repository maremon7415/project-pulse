"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, MessageSquareHeart } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ----------------------------- */
/* Helper: Star Rating Component */
/* ----------------------------- */

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function StarRating({ value, onChange, label }: StarRatingProps) {
  // Tracks star hover state for preview
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="space-y-2">
      {/* Rating label */}
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>

      {/* Stars */}
      <div className="flex gap-1" onMouseLeave={() => setHoverValue(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hoverValue || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Hover feedback text */}
      <p className="text-xs text-muted-foreground h-4">
        {hoverValue === 1 && "Very Poor"}
        {hoverValue === 2 && "Poor"}
        {hoverValue === 3 && "Average"}
        {hoverValue === 4 && "Good"}
        {hoverValue === 5 && "Excellent"}
      </p>
    </div>
  );
}

/* ----------------------------- */
/* Main Client Feedback Form     */
/* ----------------------------- */

interface ClientFeedbackFormProps {
  projectId: string;
  projectName: string;
}

export function ClientFeedbackForm({
  projectId,
  projectName,
}: ClientFeedbackFormProps) {
  const router = useRouter();

  // Ratings (start at 0 to force user selection)
  const [satisfaction, setSatisfaction] = useState(0);
  const [communication, setCommunication] = useState(0);

  // Optional text feedback
  const [comments, setComments] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Submit feedback to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require both ratings
    if (satisfaction === 0 || communication === 0) {
      alert("Please provide a rating for both categories.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectId,
          type: "client_feedback",
          satisfaction,
          communication,
          comments,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      // Show success state and refresh data
      setIsSuccess(true);
      router.refresh();

      // Reset form after delay
      setTimeout(() => {
        setIsSuccess(false);
        setSatisfaction(0);
        setCommunication(0);
        setComments("");
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquareHeart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Weekly Feedback</CardTitle>
            <CardDescription>
              How are we doing on {projectName}?
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Success message */}
        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg">Thank you!</h3>
            <p className="text-muted-foreground">
              Your feedback has been recorded.
            </p>
          </div>
        ) : (
          /* Feedback form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarRating
                label="Overall Satisfaction"
                value={satisfaction}
                onChange={setSatisfaction}
              />
              <StarRating
                label="Communication Quality"
                value={communication}
                onChange={setCommunication}
              />
            </div>

            {/* Optional comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Any blockers? Something we did well? Let us know..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-25 resize-none"
              />
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
