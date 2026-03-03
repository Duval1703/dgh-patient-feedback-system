import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MessageSquare, Star } from 'lucide-react';

interface FeedbackItem {
  id: string;
  patient: string;
  patient_id?: string;
  doctor: string;
  rating: number;
  comment: string;
  date: string;
  replies?: any[];
}

interface PatientSatisfactionTrendsProps {
  feedback: FeedbackItem[];
  patients: any[];
}

const PatientSatisfactionTrends: React.FC<PatientSatisfactionTrendsProps> = ({ feedback = [], patients = [] }) => {
  // Debug logging
  React.useEffect(() => {
    console.log('PatientSatisfactionTrends received:', {
      feedbackCount: feedback?.length || 0,
      patientCount: patients?.length || 0,
      feedbackSample: feedback?.slice(0, 2) || [],
      patientSample: patients?.slice(0, 2) || []
    });
  }, [feedback, patients]);

  // Simple analytics calculation
  const analytics = React.useMemo(() => {
    try {
      console.log('Processing feedback data:', feedback?.length || 0, 'items');
      if (!feedback || feedback.length === 0) {
        console.log('No feedback data available');
        return {
          totalFeedback: 0,
          avgRating: 0,
          replyRate: 0,
          chartData: []
        };
      }

      // Calculate basic metrics
      const totalFeedback = feedback.length;
      const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
      const repliedFeedback = feedback.filter(f => f.replies && f.replies.length > 0).length;
      const replyRate = Math.round((repliedFeedback / totalFeedback) * 100);

      // Create simple monthly data for chart
      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const monthKey = date.toISOString().slice(0, 7);
        
        const monthFeedback = feedback.filter(f => f.date.startsWith(monthKey));
        chartData.push({
          month: monthName,
          feedback: monthFeedback.length,
          rating: monthFeedback.length > 0 ? 
            Math.round((monthFeedback.reduce((sum, f) => sum + f.rating, 0) / monthFeedback.length) * 10) / 10 
            : 0
        });
      }

      return {
        totalFeedback,
        avgRating: Math.round(avgRating * 10) / 10,
        replyRate,
        chartData
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return {
        totalFeedback: 0,
        avgRating: 0,
        replyRate: 0,
        chartData: []
      };
    }
  }, [feedback]);
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Patient Engagement & Satisfaction Trends</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-blue-600">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Feedback</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{analytics.totalFeedback}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active Patients</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'Active').length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Avg Satisfaction</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{analytics.avgRating}/5</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Reply Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{analytics.replyRate}%</p>
          </div>
        </div>
        
        {/* Trend Charts */}
        {analytics.totalFeedback === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No feedback data available for trend analysis
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Feedback Chart */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Monthly Feedback Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="feedback" fill="#3b82f6" name="Feedback Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Monthly Rating Chart */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Monthly Average Rating</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="#f59e0b" name="Average Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
      
      </CardContent>
    </Card>
  );
};

export default PatientSatisfactionTrends;