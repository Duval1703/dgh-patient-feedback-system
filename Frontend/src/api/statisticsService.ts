const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

// Mock data generators for fallback
const generateMockDepartmentStats = () => [
  { name: 'Emergency', efficiency: 85, patients: 120, avgWaitTime: '15 min' },
  { name: 'Cardiology', efficiency: 92, patients: 80, avgWaitTime: '25 min' },
  { name: 'Pediatrics', efficiency: 88, patients: 95, avgWaitTime: '20 min' },
  { name: 'Orthopedics', efficiency: 90, patients: 65, avgWaitTime: '30 min' },
  { name: 'Neurology', efficiency: 87, patients: 45, avgWaitTime: '35 min' }
];

const generateMockHospitalStats = () => [
  { 
    title: 'Total Patients', 
    value: '1,234', 
    change: '+12%', 
    trend: 'up',
    icon: { bgColor: 'bg-blue-500' }
  },
  { 
    title: 'Patient Satisfaction', 
    value: '94.5', 
    change: '+2.1%', 
    trend: 'up',
    icon: { bgColor: 'bg-green-500' }
  },
  { 
    title: 'Avg Stay Duration', 
    value: '3.2', 
    change: '-0.5%', 
    trend: 'down',
    icon: { bgColor: 'bg-purple-500' }
  },
  { 
    title: 'Bed Occupancy', 
    value: '78', 
    change: '+5%', 
    trend: 'up',
    icon: { bgColor: 'bg-orange-500' }
  }
];

const generateMockDoctorStats = () => ({
  totalDoctors: 45,
  activeDoctors: 42,
  averageRating: 4.6,
  topPerformers: [
    { name: 'Dr. Smith', rating: 4.9, specialty: 'Cardiology' },
    { name: 'Dr. Johnson', rating: 4.8, specialty: 'Neurology' },
    { name: 'Dr. Williams', rating: 4.7, specialty: 'Pediatrics' },
    { name: 'Dr. Brown', rating: 4.6, specialty: 'Emergency' }
  ]
});

const generateMockPatientAdmissions = () => [
  { name: 'Jan', emergency: 45, scheduled: 78 },
  { name: 'Feb', emergency: 52, scheduled: 85 },
  { name: 'Mar', emergency: 48, scheduled: 92 },
  { name: 'Apr', emergency: 61, scheduled: 88 },
  { name: 'May', emergency: 55, scheduled: 95 },
  { name: 'Jun', emergency: 67, scheduled: 102 }
];

const generateMockFeedbackData = () => [
  {
    id: 1,
    patient: { first_name: 'John', last_name: 'Doe' },
    rating: 5,
    comment: 'Excellent service and care',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    patient: { first_name: 'Jane', last_name: 'Smith' },
    rating: 4,
    comment: 'Very good experience overall',
    created_at: '2024-01-14T14:20:00Z'
  },
  {
    id: 3,
    patient: { first_name: 'Mike', last_name: 'Johnson' },
    rating: 5,
    comment: 'Outstanding medical care',
    created_at: '2024-01-13T09:15:00Z'
  }
];

const generateMockAppointments = () => [
  {
    id: 1,
    patient_name: 'Alice Wilson',
    doctor_name: 'Dr. Smith',
    date: '2024-01-20',
    time: '10:00',
    category: 'Consultation',
    status: 'scheduled'
  },
  {
    id: 2,
    patient_name: 'Bob Davis',
    doctor_name: 'Dr. Johnson',
    date: '2024-01-20',
    time: '14:30',
    category: 'Follow-up',
    status: 'confirmed'
  },
  {
    id: 3,
    patient_name: 'Carol Brown',
    doctor_name: 'Dr. Williams',
    date: '2024-01-21',
    time: '09:00',
    category: 'Check-up',
    status: 'scheduled'
  }
];

export const fetchDepartmentStats = async () => {
  try {
    const response = await fetch(`${backendUrl}/statistics/departments`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Department stats API failed, using mock data');
      return generateMockDepartmentStats();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching department stats, using mock data:', error);
    return generateMockDepartmentStats();
  }
};

export const fetchHospitalStats = async () => {
  try {
    const response = await fetch(`${backendUrl}/statistics/hospital`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Hospital stats API failed, using mock data');
      return generateMockHospitalStats();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching hospital stats, using mock data:', error);
    return generateMockHospitalStats();
  }
};

export const fetchDoctorStats = async () => {
  try {
    const response = await fetch(`${backendUrl}/statistics/doctors`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Doctor stats API failed, using mock data');
      return generateMockDoctorStats();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching doctor stats, using mock data:', error);
    return generateMockDoctorStats();
  }
};

export const fetchPatientAdmissions = async () => {
  try {
    const response = await fetch(`${backendUrl}/statistics/admissions`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Patient admissions API failed, using mock data');
      return generateMockPatientAdmissions();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching patient admissions, using mock data:', error);
    return generateMockPatientAdmissions();
  }
};

export const fetchFeedbackData = async () => {
  try {
    const response = await fetch(`${backendUrl}/feedback`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Feedback API failed, using mock data');
      return generateMockFeedbackData();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching feedback data, using mock data:', error);
    return generateMockFeedbackData();
  }
};

export const fetchAppointments = async () => {
  try {
    const response = await fetch(`${backendUrl}/appointments/all`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Appointments API failed, no appointments available');
      return []; // Return empty array instead of mock data
    }
    
    const data = await response.json();
    return data || []; // Ensure we return an array
  } catch (error) {
    console.warn('Error fetching appointments, no appointments available:', error);
    return []; // Return empty array instead of mock data
  }
};

export const fetchSentimentStats = async () => {
  try {
    const response = await fetch(`${backendUrl}/statistics/sentiment`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      console.warn('Sentiment stats API failed');
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching sentiment stats:', error);
    return null;
  }
};
