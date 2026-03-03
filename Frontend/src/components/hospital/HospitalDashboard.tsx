import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import { Activity, Users, Clock, BedDouble, LineChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DepartmentPerformance from './DepartmentPerformance';
import BarChartComponent from './BarChartComponent';
import FeedbackAnalytics from './FeedbackAnalytics';
import AppointmentCalendar from './AppointmentCalendar';
import PatientSatisfactionTrends from './PatientSatisfactionTrends';
import { 
  fetchDepartmentStats, 
  fetchHospitalStats, 
  fetchDoctorStats, 
  fetchPatientAdmissions, 
  fetchFeedbackData, 
  fetchAppointments,
  fetchSentimentStats,
} from '@/api/statisticsService';

interface HospitalDashboardProps {
  patients?: any[];
  adminFeedback?: any[];
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ patients = [], adminFeedback = [] }) => {
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [hospitalStats, setHospitalStats] = useState<any[]>([]);
  const [doctorStats, setDoctorStats] = useState<any>({});
  const [patientAdmissionsData, setPatientAdmissionsData] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [sentimentStats, setSentimentStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('HospitalDashboard useEffect triggered with adminFeedback:', adminFeedback.length, 'items');
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load statistics data in parallel (excluding feedback since it's passed as prop)
        const [
          departmentStatsData,
          hospitalStatsData,
          doctorStatsData,
          patientAdmissionsData,
          appointmentsData,
          sentimentData,
        ] = await Promise.all([
          fetchDepartmentStats(),
          fetchHospitalStats(),
          fetchDoctorStats(),
          fetchPatientAdmissions(),
          fetchAppointments(),
          fetchSentimentStats(),
        ]);
        
        setDepartmentStats(departmentStatsData);
        setHospitalStats(hospitalStatsData);
        setDoctorStats(doctorStatsData);
        setPatientAdmissionsData(patientAdmissionsData);
        // Always use adminFeedback prop, don't fetch separately
        setFeedbackData(adminFeedback);
        setAppointments(appointmentsData);
        setSentimentStats(sentimentData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    // Only load data once on mount, not when adminFeedback changes
    if (adminFeedback.length > 0 || departmentStats.length === 0) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - load only once on mount
  
  // Separate effect to update feedback data when adminFeedback prop changes
  useEffect(() => {
    if (adminFeedback.length > 0) {
      setFeedbackData(adminFeedback);
    }
  }, [adminFeedback]);

  // Transform feedback data for the FeedbackAnalytics component
  const transformFeedbackData = () => {
    if (feedbackData.length === 0) return null;
    
    const totalFeedback = feedbackData.length;
    const averageRating = feedbackData.reduce((sum, item) => sum + item.rating, 0) / totalFeedback;
    
    // Calculate rating distribution
    const ratings: { rating: number; percentage: number }[] = [];
    for (let i = 1; i <= 5; i++) {
      const count = feedbackData.filter(item => Math.round(item.rating) === i).length;
      ratings.push({
        rating: i,
        percentage: totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0
      });
    }
    
    // Get recent feedback (last 3)
    const recentFeedback = feedbackData
      .slice()
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        patient:
          item.patient_name ||
          (item.patient ? `${item.patient.first_name} ${item.patient.last_name}` : 'Unknown Patient'),
        rating: item.rating,
        comment: item.comment,
        date: item.created_at
          ? String(item.created_at).split('T')[0]
          : new Date().toISOString().split('T')[0],
        sentiment: item.sentiment,
      }));
    
    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      positivePercentage: ratings.slice(3).reduce((sum, r) => sum + r.percentage, 0),
      ratings,
      recentFeedback
    };
  };

  // Transform doctor data for the doctor performance chart
  const transformDoctorData = () => {
    if (!doctorStats.topPerformers || doctorStats.topPerformers.length === 0) return [];
    
    return doctorStats.topPerformers.map((doctor: any) => {
      // Calculate actual patient count based on feedback
      const doctorFeedback = feedbackData.filter(f => f.doctor?.name === doctor.name);
      const patientCount = new Set(doctorFeedback.map(f => f.patient_id)).size;
      
      return {
        name: doctor.name,
        patients: patientCount || 0, // Use actual patient count
        rating: doctor.rating
      };
    });
  };

  // Transform appointment data for the calendar
  const transformAppointmentData = () => {
    return appointments.map(appointment => ({
      id: appointment.id,
      patient: appointment.patient_name || "Unknown Patient",
      doctor: appointment.doctor_name || "Unknown Doctor",
      type: appointment.category || 'Consultation',
      status: appointment.status || 'scheduled',
      dateTime: `${appointment.date}T${appointment.time}`
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe transformation with error handling
  let feedbackStats = null;
  let doctorPerformanceData: any[] = [];
  let appointmentData: any[] = [];
  
  try {
    feedbackStats = transformFeedbackData();
    doctorPerformanceData = transformDoctorData();
    appointmentData = transformAppointmentData();
  } catch (error) {
    console.error('Error transforming dashboard data:', error);
  }

  const exportAnalytics = () => {
    const analyticsData = {
      hospitalStats: hospitalStats.filter(stat => !stat.title.includes('Stay')),
      departmentStats: departmentStats,
      feedbackStats: feedbackStats,
      exportDate: new Date().toISOString()
    };
    
    // Create CSV content for hospital analytics
    const headers = ['Metric', 'Value', 'Change', 'Trend'];
    const csvData = analyticsData.hospitalStats.map(stat => [
      stat.title,
      stat.value,
      stat.change,
      stat.trend
    ]);
    
    const csvContent = [
      'Hospital Analytics Report',
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hospital_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  try {
    return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hospital Analytics Dashboard</h2>
        <Button onClick={exportAnalytics} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Analytics
        </Button>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hospitalStats
          .filter(stat => !stat.title.includes('Stay')) // Filter out average stay
          .map((stat, index) => (
            <StatsCard 
              key={index}
              title={stat.title}
              value={parseFloat(stat.value.replace(/,/g, ''))}
              unit={stat.title.includes('Satisfaction') ? '%' : undefined}
              icon={
                stat.icon.bgColor === 'bg-blue-500' ? <Users className="h-5 w-5" /> :
                stat.icon.bgColor === 'bg-green-500' ? <Activity className="h-5 w-5" /> :
                stat.icon.bgColor === 'bg-purple-500' ? <Clock className="h-5 w-5" /> :
                <BedDouble className="h-5 w-5" />
              }
              trend={{ 
                value: parseFloat(stat.change.replace(/[+%]/g, '')), 
                isUpward: stat.trend === 'up' 
              }}
            />
          ))
        }
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="lg:col-span-1">
          <DepartmentPerformance departments={departmentStats} />
        </div>
        
        {/* Feedback Analytics + Sentiment */}
        {feedbackStats && (
          <div className="lg:col-span-1 space-y-4">
            <FeedbackAnalytics data={feedbackStats} />

            {sentimentStats && sentimentStats.breakdown && sentimentStats.breakdown.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="text-sm font-semibold mb-3">Model-based Sentiment Analysis</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {sentimentStats.breakdown.map((item: any) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-md bg-background shadow-sm flex flex-col items-center min-w-[120px] max-w-[180px] flex-1 sm:flex-none"
                    >
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </span>
                      <span className="text-xl font-bold">{item.percentage}%</span>
                      <span className="text-xs text-muted-foreground">
                        {item.count} feedback
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      
      {/* Patient Satisfaction Trends - Simplified and Safe */}
      {(() => {
        console.log('HospitalDashboard passing data:', {
          feedbackDataCount: feedbackData?.length || 0,
          patientsCount: patients?.length || 0,
          feedbackSample: feedbackData?.slice(0, 2) || []
        });
        return <PatientSatisfactionTrends feedback={feedbackData} patients={patients} />;
      })()}
      
      {/* Appointment Calendar */}
      <AppointmentCalendar appointments={appointmentData} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering HospitalDashboard:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Error loading analytics dashboard</p>
        <p className="text-sm text-muted-foreground">Please check the console for details</p>
      </div>
    );
  }
};

export default HospitalDashboard;