import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positivePercentage: number;
  ratings: Array<{ rating: number; percentage: number }>;
  recentFeedback: Array<{ id: string; patient: string; rating: number; comment: string; date: string; sentiment?: string }>;
}

interface FeedbackAnalyticsProps {
  data: FeedbackStats;
  className?: string;
}

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ data, className = "" }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Patient Feedback Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-primary">{data.totalFeedback}</p>
            <p className="text-sm text-muted-foreground">Total Feedback</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-primary">{data.averageRating.toFixed(1)}</p>
              <Star className="h-4 w-4 fill-warning text-warning ml-1" />
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-primary">{data.positivePercentage}%</p>
            <p className="text-sm text-muted-foreground">Positive Feedback</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-primary">{data.ratings.find(r => r.rating === 5)?.percentage || 0}%</p>
            <p className="text-sm text-muted-foreground">5-Star Ratings</p>
          </div>
        </div>
        
        {/* Rating Distribution */}
        <div className="space-y-2">
          <h3 className="text-md font-semibold">Rating Distribution</h3>
          <div className="space-y-2">
            {data.ratings.map(rating => (
              <div key={rating.rating} className="flex items-center space-x-2">
                <div className="w-6 text-sm">{rating.rating}★</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${rating.rating >= 4 ? 'bg-success' : rating.rating === 3 ? 'bg-warning' : 'bg-destructive'}`}
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
                <div className="w-10 text-xs text-muted-foreground">{rating.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Feedback */}
        <div className="space-y-2">
          <h3 className="text-md font-semibold">Recent Feedback</h3>
          <div className="space-y-4">
            {data.recentFeedback.map(feedback => (
              <div key={feedback.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{feedback.patient}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        className={`h-4 w-4 ${star <= feedback.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{feedback.date}</span>
                  <Badge variant={feedback.sentiment === "positive" ? "default" : "secondary"}>
                    {feedback.sentiment || (feedback.rating >= 4 ? 'positive' : feedback.rating === 3 ? 'neutral' : 'negative')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackAnalytics;