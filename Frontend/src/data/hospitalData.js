// Mock data for the hospital management dashboard
export const hospitalData = {
  stats: {
    patientSatisfaction: 87,
    avgWaitTime: 14,
    staffEfficiency: 92,
    bedOccupancy: 78
  },
  departmentPerformance: [
    { name: 'Cardiology', rating: 4.8, patientsSeen: 128, waitTime: 12 },
    { name: 'Neurology', rating: 4.6, patientsSeen: 85, waitTime: 18 },
    { name: 'Pediatrics', rating: 4.9, patientsSeen: 110, waitTime: 10 },
    { name: 'Orthopedics', rating: 4.5, patientsSeen: 95, waitTime: 15 },
    { name: 'General Medicine', rating: 4.4, patientsSeen: 140, waitTime: 16 },
    { name: 'Surgery', rating: 4.7, patientsSeen: 75, waitTime: 14 }
  ],
  patientVolume: [
    { month: 'Jan', volume: 420 },
    { month: 'Feb', volume: 380 },
    { month: 'Mar', volume: 450 },
    { month: 'Apr', volume: 520 },
    { month: 'May', volume: 480 },
    { month: 'Jun', volume: 510 }
  ],
  appointments: [
    {
      id: '1',
      patient: 'John Smith',
      doctor: 'Dr. Sarah Johnson',
      type: 'Check-up',
      status: 'Completed',
      dateTime: '2025-08-01T10:00:00'
    },
    {
      id: '2',
      patient: 'Emily Brown',
      doctor: 'Dr. Michael Wilson',
      type: 'Consultation',
      status: 'Scheduled',
      dateTime: '2025-08-06T14:30:00'
    },
    {
      id: '3',
      patient: 'Robert Davis',
      doctor: 'Dr. Lisa Thomas',
      type: 'Follow-up',
      status: 'Scheduled',
      dateTime: '2025-08-07T09:15:00'
    },
    {
      id: '4',
      patient: 'Jennifer Wilson',
      doctor: 'Dr. James Miller',
      type: 'Check-up',
      status: 'Cancelled',
      dateTime: '2025-08-05T16:00:00'
    },
    {
      id: '5',
      patient: 'Michael Thompson',
      doctor: 'Dr. Sarah Johnson',
      type: 'Consultation',
      status: 'Completed',
      dateTime: '2025-08-02T11:30:00'
    },
    {
      id: '6',
      patient: 'Jessica Martinez',
      doctor: 'Dr. Michael Wilson',
      type: 'Follow-up',
      status: 'Scheduled',
      dateTime: '2025-08-08T13:45:00'
    }
  ],
  doctorPerformance: [
    { name: 'Dr. Johnson', patients: 48, rating: 4.9 },
    { name: 'Dr. Wilson', patients: 42, rating: 4.7 },
    { name: 'Dr. Miller', patients: 38, rating: 4.8 },
    { name: 'Dr. Thomas', patients: 45, rating: 4.6 },
    { name: 'Dr. Davis', patients: 36, rating: 4.5 }
  ],
  feedbackStats: {
    totalFeedback: 320,
    averageRating: 4.6,
    positivePercentage: 87,
    ratings: [
      { rating: 5, percentage: 62 },
      { rating: 4, percentage: 25 },
      { rating: 3, percentage: 8 },
      { rating: 2, percentage: 3 },
      { rating: 1, percentage: 2 }
    ],
    recentFeedback: [
      { id: 'f1', patient: 'John S.', rating: 5, comment: 'Excellent care and attention to detail', date: '2025-08-01' },
      { id: 'f2', patient: 'Mary L.', rating: 4, comment: 'Very professional staff and clean facility', date: '2025-08-02' },
      { id: 'f3', patient: 'Robert D.', rating: 5, comment: 'Dr. Johnson was extremely helpful and caring', date: '2025-08-03' }
    ]
  }
};