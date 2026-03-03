import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Download, 
  MessageSquare, 
  Calendar, 
  Star, 
  TrendingUp, 
  Search, 
  Menu,
  Settings,
  Shield,
  X,
  Eye,
  EyeOff,
  Activity,
  Upload
} from "lucide-react";
import HospitalDashboard from "@/components/hospital/HospitalDashboard";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  status: string;
  patientCount?: number;
  averageRating?: number;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: string;
}

interface Feedback {
  id: string;
  patient: string;
  patient_id?: string;
  patient_name?: string;
  doctor: string;
  rating: number;
  comment: string;
  date: string;
  sentiment: string;
  replies?: FeedbackReply[];
}

interface FeedbackReply {
  id: string;
  reply_text: string;
  created_at: string;
  admin_name: string;
}

// Add proper typing for API responses
interface DoctorApiResponse {
  id: number | string;
  name?: string;
  specialty?: string;
  email?: string;
  is_active?: boolean;
  patientCount?: number;
  averageRating?: number;
  [key: string]: any;
}

interface PatientApiResponse {
  id: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  created_at?: string;
  is_active?: boolean;
  [key: string]: any;
}

interface FeedbackApiResponse {
  id: number | string;
  patient?: {
    first_name?: string;
    last_name?: string;
  };
  patient_id?: number | string;
  patient_name?: string;
  doctor?: {
    name?: string;
  };
  rating?: number;
  comment?: string;
  created_at?: string;
  replies?: {
    id: number | string;
    reply_text: string;
    created_at: string;
    admin_name?: string;
  }[];
  [key: string]: any;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [replyingToFeedback, setReplyingToFeedback] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [doctorStatusFilter, setDoctorStatusFilter] = useState("all");
  const [doctorRatingFilter, setDoctorRatingFilter] = useState("all");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState("all");
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    email: "",
    password: "",
    status: "Active"
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this feature.",
        variant: "destructive"
      });
      navigate('/auth');
      return false;
    }
    return true;
  };

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

  const specialtyOptions = [
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "general", label: "General Medicine" },
    { value: "surgery", label: "Surgery" }
  ];

  const calculateFeedbackAnalytics = () => {
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0 ? feedback.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedback : 0;
    const positivePercentage = totalFeedback > 0 ? Math.round((feedback.filter(f => f.rating >= 4).length) / totalFeedback * 100) : 0;
    const recentFeedback = feedback.slice(0, 3);
    
    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const count = feedback.filter(f => Math.floor(f.rating) === rating).length;
      const percentage = totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0;
      return { rating, count, percentage };
    });
    
    // Calculate feedback with replies
    const repliedCount = feedback.filter(f => f.replies && f.replies.length > 0).length;
    const replyRate = totalFeedback > 0 ? Math.round((repliedCount / totalFeedback) * 100) : 0;
    
    return {
      totalFeedback,
      averageRating,
      positivePercentage,
      recentFeedback,
      ratingDistribution,
      repliedCount,
      replyRate,
      responseTime: "2.3 hours"
    };
  };

  const calculateSystemAnalytics = () => {
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter(d => d.status === "Active").length;
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === "Active").length;
    
    // Calculate doctor specialties distribution
    const specialtyDistribution = doctors.reduce((acc, doctor) => {
      acc[doctor.specialty] = (acc[doctor.specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const specialtyData = Object.entries(specialtyDistribution).map(([specialty, count]) => ({
      name: specialty,
      count,
      percentage: totalDoctors > 0 ? Math.round((count / totalDoctors) * 100) : 0
    }));
    
    return {
      totalDoctors,
      activeDoctors,
      totalPatients,
      activePatients,
      specialtyData,
      doctorUtilizationRate: totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0,
      patientActivityRate: totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 0
    };
  };

  const feedbackAnalytics = calculateFeedbackAnalytics();
  const systemAnalytics = calculateSystemAnalytics();

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setSidebarOpen(!isMobileView);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDoctors = async () => {
    try {
      console.log(`Fetching ${backendUrl}/doctor`);
      const response = await fetch(`${backendUrl}/doctor`, {
        headers: getAuthHeaders()
      });
      console.log(`Response status for /doctor: ${response.status}`);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        console.error(`Error response for /doctor:`, errorData);
        const message = errorData.detail || `Failed to fetch doctors (Status: ${response.status})`;
        throw new Error(message);
      }
      const data: DoctorApiResponse[] = await response.json();
      console.log(`Data fetched for /doctor:`, data);
      
      // Store the raw data for persistence
      localStorage.setItem(`admin_doctor`, JSON.stringify(data));
      
      const transformedData: Doctor[] = data.map((item: DoctorApiResponse) => {
        // Calculate patient count for this doctor from appointments/feedback
        const doctorFeedback = feedback.filter(f => f.doctor === item.name);
        const patientCount = new Set(doctorFeedback.map(f => f.patient_id || f.patient)).size;
        const averageRating = doctorFeedback.length > 0 
          ? doctorFeedback.reduce((sum, f) => sum + f.rating, 0) / doctorFeedback.length 
          : 0;
        
        return {
          id: item.id.toString(),
          name: item.name || "Unknown",
          specialty: item.specialty || "N/A",
          email: item.email || "N/A",
          status: item.is_active ? "Active" : "Inactive",
          patientCount: patientCount,
          averageRating: Math.round(averageRating * 10) / 10
        };
      });
      
      setDoctors(transformedData);
    } catch (error: unknown) {
      console.error(`Error fetching doctors:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch doctors`;
      
      // Try to load from localStorage if API fails
      const savedData = localStorage.getItem(`admin_doctor`);
      if (savedData) {
        console.log(`Using cached data for /doctor`);
        const parsedData: DoctorApiResponse[] = JSON.parse(savedData);
        
        const transformedData: Doctor[] = parsedData.map((item: DoctorApiResponse) => {
          // Calculate patient count for this doctor from feedback
          const doctorFeedback = feedback.filter(f => f.doctor === item.name);
          const patientCount = new Set(doctorFeedback.map(f => f.patient_id || f.patient)).size;
          const averageRating = doctorFeedback.length > 0 
            ? doctorFeedback.reduce((sum, f) => sum + f.rating, 0) / doctorFeedback.length 
            : 0;
          
          return {
            id: item.id.toString(),
            name: item.name || "Unknown",
            specialty: item.specialty || "N/A",
            email: item.email || "N/A",
            status: item.is_active ? "Active" : "Inactive",
            patientCount: patientCount,
            averageRating: Math.round(averageRating * 10) / 10
          };
        });
        
        setDoctors(transformedData);
      } else {
        toast({
          title: `Failed to Load Doctors`,
          description: errorMessage || `Could not load doctors. Please check if the backend is running and the endpoint is correct.`,
          variant: "destructive"
        });
      }
    }
  };

  const fetchPatients = async () => {
    try {
      console.log(`Fetching ${backendUrl}/patients`);
      const response = await fetch(`${backendUrl}/patients`, {
        headers: getAuthHeaders()
      });
      console.log(`Response status for /patients: ${response.status}`);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        console.error(`Error response for /patients:`, errorData);
        const message = errorData.detail || `Failed to fetch patients (Status: ${response.status})`;
        throw new Error(message);
      }
      const data: PatientApiResponse[] = await response.json();
      console.log(`Data fetched for /patients:`, data);
      
      // Store the raw data for persistence
      localStorage.setItem(`admin_patients`, JSON.stringify(data));
      
      const transformedData: Patient[] = data.map((item: PatientApiResponse) => ({
        id: item.id.toString(),
        name: `${item.first_name || "Unknown"} ${item.last_name || ""}`,
        email: item.email || "N/A",
        phone: item.phone_number || "N/A",
        registrationDate: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
        status: item.is_active ? "Active" : "Inactive"
      }));
      
      setPatients(transformedData);
    } catch (error: unknown) {
      console.error(`Error fetching patients:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch patients`;
      
      // Try to load from localStorage if API fails
      const savedData = localStorage.getItem(`admin_patients`);
      if (savedData) {
        console.log(`Using cached data for /patients`);
        const parsedData: PatientApiResponse[] = JSON.parse(savedData);
        
        const transformedData: Patient[] = parsedData.map((item: PatientApiResponse) => ({
          id: item.id.toString(),
          name: `${item.first_name || "Unknown"} ${item.last_name || ""}`,
          email: item.email || "N/A",
          phone: item.phone_number || "N/A",
          registrationDate: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
          status: item.is_active ? "Active" : "Inactive"
        }));
        
        setPatients(transformedData);
      } else {
        toast({
          title: `Failed to Load Patients`,
          description: errorMessage || `Could not load patients. Please check if the backend is running and the endpoint is correct.`,
          variant: "destructive"
        });
      }
    }
  };

  const fetchFeedback = async () => {
    try {
      console.log(`Fetching ${backendUrl}/feedback`);
      const response = await fetch(`${backendUrl}/feedback`, {
        headers: getAuthHeaders()
      });
      console.log(`Response status for /feedback: ${response.status}`);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        console.error(`Error response for /feedback:`, errorData);
        const message = errorData.detail || `Failed to fetch feedback (Status: ${response.status})`;
        throw new Error(message);
      }
      const data: FeedbackApiResponse[] = await response.json();
      console.log(`Data fetched for /feedback:`, data);
      
      // Fetch sentiment analysis from ML model for each feedback item
      let sentimentMap: Record<string, string> = {};
      try {
        const sentimentResponse = await fetch(`${backendUrl}/statistics/sentiment/details`, {
          headers: getAuthHeaders()
        });
        if (sentimentResponse.ok) {
          const sentimentData: Array<{feedback_id: number, sentiment: string}> = await sentimentResponse.json();
          console.log('Individual feedback sentiments:', sentimentData);
          
          // Create a map of feedback ID to sentiment
          sentimentData.forEach(item => {
            sentimentMap[item.feedback_id.toString()] = item.sentiment.toLowerCase();
          });
          
          console.log('Sentiment map created:', sentimentMap);
        }
      } catch (error) {
        console.error('Failed to fetch sentiment analysis:', error);
      }
      
      // Store the raw data for persistence
      localStorage.setItem(`admin_feedback`, JSON.stringify(data));
      
      const transformedData: Feedback[] = data.map((item: FeedbackApiResponse) => ({
        id: item.id.toString(),
        patient: item.patient_name || (item.patient ? `${item.patient.first_name || ""} ${item.patient.last_name || ""}`.trim() : `Patient ${item.patient_id || "Unknown"}`),
        patient_id: item.patient_id?.toString(),
        patient_name: item.patient_name,
        doctor: item.doctor ? item.doctor.name || "Unknown Doctor" : "Unknown Doctor",
        rating: item.rating || 0,
        comment: item.comment || "No comment",
        date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        sentiment: sentimentMap[item.id.toString()] || ((item.rating || 0) >= 4 ? "positive" : (item.rating || 0) >= 3 ? "neutral" : "negative"),
        replies: item.replies?.map(reply => ({
          id: reply.id.toString(),
          reply_text: reply.reply_text,
          created_at: reply.created_at,
          admin_name: reply.admin_name || "Hospital Administration"
        })) || []
      }));
      
      setFeedback(transformedData);
    } catch (error: unknown) {
      console.error(`Error fetching feedback:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch feedback`;
      
      // Try to load from localStorage if API fails
      const savedData = localStorage.getItem(`admin_feedback`);
      if (savedData) {
        console.log(`Using cached data for /feedback`);
        const parsedData: FeedbackApiResponse[] = JSON.parse(savedData);
        
        const transformedData: Feedback[] = parsedData.map((item: FeedbackApiResponse) => ({
          id: item.id.toString(),
          patient: item.patient_name || (item.patient ? `${item.patient.first_name || ""} ${item.patient.last_name || ""}`.trim() : `Patient ${item.patient_id || "Unknown"}`),
          patient_id: item.patient_id?.toString(),
          patient_name: item.patient_name,
          doctor: item.doctor ? item.doctor.name || "Unknown Doctor" : "Unknown Doctor",
          rating: item.rating || 0,
          comment: item.comment || "No comment",
          date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          sentiment: (item.rating || 0) >= 4 ? "positive" : (item.rating || 0) >= 3 ? "neutral" : "negative",
          replies: item.replies?.map(reply => ({
            id: reply.id.toString(),
            reply_text: reply.reply_text,
            created_at: reply.created_at,
            admin_name: reply.admin_name || "Hospital Administration"
          })) || []
        }));
        
        setFeedback(transformedData);
      } else {
        toast({
          title: `Failed to Load Feedback`,
          description: errorMessage || `Could not load feedback. Please check if the backend is running and the endpoint is correct.`,
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    // Fetch feedback first, then fetch doctors to calculate stats properly
    const loadData = async () => {
      try {
        await fetchFeedback();
        await Promise.all([
          fetchDoctors(),
          fetchPatients()
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]); // Removed toast from dependencies to prevent unnecessary re-renders

  const handleExportData = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} data is being exported to CSV format.`,
    });
  };

  const handleImportDoctors = async (csvContent: string) => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must contain headers and at least one data row');
      }

      // Better CSV parsing to handle quoted fields and different separators
      const parseCSVLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const requiredHeaders = ['name', 'specialty', 'email', 'password'];
      
      console.log('CSV Headers found:', headers);
      console.log('Required headers:', requiredHeaders);
      
      // Validate headers
      for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
          throw new Error(`Missing required column: ${required}. Found columns: ${headers.join(', ')}`);
        }
      }

      let importedCount = 0;
      let errorCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const doctorData = {
          name: values[headers.indexOf('name')] || '',
          specialty: values[headers.indexOf('specialty')] || '',
          email: values[headers.indexOf('email')] || '',
          password: values[headers.indexOf('password')] || '',
          is_active: true
        };

        // Validate required fields
        if (!doctorData.name || !doctorData.email || !doctorData.specialty || !doctorData.password) {
          errorCount++;
          continue;
        }

        try {
          const response = await fetch(`${backendUrl}/doctor`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(doctorData)
          });

          if (response.ok) {
            importedCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      toast({
        title: "Import Completed",
        description: `Successfully imported ${importedCount} doctors. ${errorCount} errors occurred.`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

      // Refresh the doctors list
      await fetchDoctors();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive"
      });
    }
  };

  const handleCreateDoctor = () => {
    setIsEditing(false);
    setEditingDoctorId(null);
    setNewDoctor({
      name: "",
      specialty: "",
      email: "",
      password: "",
      status: "Active"
    });
    setShowAddDoctorForm(true);
  };

  const handleEditDoctor = async (doctorId: string) => {
    try {
      const response = await fetch(`${backendUrl}/doctor/${doctorId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        throw new Error(errorData.detail || `Failed to fetch doctor data (Status: ${response.status})`);
      }
      const doctorData = await response.json();
      setNewDoctor({
        name: doctorData.name || "",
        specialty: doctorData.specialty || "",
        email: doctorData.email || "",
        password: "",
        status: doctorData.is_active ? "Active" : "Inactive"
      });
      setIsEditing(true);
      setEditingDoctorId(doctorId);
      setShowAddDoctorForm(true);
    } catch (error: unknown) {
      console.error(`Error fetching doctor ${doctorId}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load doctor data";
      toast({
        title: "Error",
        description: errorMessage || "Failed to load doctor data. Please check if the backend is running.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitDoctor = async () => {
    // Check authentication first
    if (!checkAuthentication()) {
      return;
    }

    // Validate required fields
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.email || (!isEditing && !newDoctor.password)) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newDoctor.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Validate password length for new doctors
    if (!isEditing && newDoctor.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = isEditing 
        ? `${backendUrl}/doctor/${editingDoctorId}`
        : `${backendUrl}/doctor`;
      const method = isEditing ? "PUT" : "POST";
      
      interface DoctorRequestBody {
        name: string;
        specialty: string;
        email: string;
        is_active: boolean;
        password?: string;
      }

      const requestBody: DoctorRequestBody = {
        name: newDoctor.name,
        specialty: newDoctor.specialty,
        email: newDoctor.email,
        is_active: newDoctor.status === "Active"
      };

      if (!isEditing || newDoctor.password) {
        requestBody.password = newDoctor.password;
      }

      console.log(`Submitting doctor to ${url}:`, requestBody);
      const headers = getAuthHeaders();
      console.log('Request headers:', headers);
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log(`Response status for ${url}: ${response.status}`);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        console.error(`Error response for ${url}:`, errorData);
        let errorMessage = errorData.detail || `Failed to ${isEditing ? "update" : "create"} doctor (Status: ${response.status})`;
        if (response.status === 409 || (response.status === 400 && errorData.detail === 'Email already registered')) {
          errorMessage = "Email already exists in the system. Please use a different email address.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
          // Redirect to auth page after a short delay
          setTimeout(() => navigate('/auth'), 2000);
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (response.status === 404) {
          errorMessage = "Doctor endpoint not found. Please ensure the backend is configured correctly.";
        }
        throw new Error(errorMessage);
      }

      toast({
        title: isEditing ? "Doctor Updated" : "Doctor Created",
        description: isEditing 
          ? "Doctor details have been successfully updated." 
          : "New doctor has been added to the system."
      });

      setShowAddDoctorForm(false);
      setIsEditing(false);
      setEditingDoctorId(null);
      setNewDoctor({
        name: "",
        specialty: "",
        email: "",
        password: "",
        status: "Active"
      });

      await fetchDoctors();

    } catch (error: unknown) {
      console.error("Doctor submission error:", error);
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          // This might be a CORS issue where the doctor was actually created
          // Let's refresh the doctors list to check
          setTimeout(async () => {
            await fetchDoctors();
            const doctorExists = doctors.some(d => d.email === newDoctor.email);
            if (doctorExists) {
              toast({
                title: "Doctor Created",
                description: "Doctor was created successfully (despite the error message)."
              });
              setShowAddDoctorForm(false);
              setIsEditing(false);
              setEditingDoctorId(null);
              setNewDoctor({
                name: "",
                specialty: "",
                email: "",
                password: "",
                status: "Active"
              });
              return;
            }
          }, 1000);
          
          errorMessage = "Network error occurred. The doctor might have been created - please check the doctors list. If not, try again.";
        } else if (error.message.includes('Email already registered')) {
          errorMessage = "Email already exists in the system. Please use a different email address.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleReplyToFeedback = async (feedbackId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Reply text cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/feedback/${feedbackId}/reply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reply_text: replyText })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        throw new Error(errorData.detail || `Failed to submit reply (Status: ${response.status})`);
      }

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the patient."
      });

      setReplyingToFeedback(null);
      setReplyText("");
      await fetchFeedback(); // Refresh feedback to show the new reply

    } catch (error: unknown) {
      console.error("Error submitting reply:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit reply";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeactivateUser = async (userId: string, userType: string) => {
    try {
      // Find the current user to get their current status
      let currentUser: Doctor | Patient | undefined;
      let isActive = false;
      
      if (userType === "doctor") {
        currentUser = doctors.find(d => d.id === userId);
        isActive = currentUser?.status === "Active";
      } else {
        currentUser = patients.find(p => p.id === userId);
        isActive = currentUser?.status === "Active";
      }
      
      const endpoint = userType === "doctor" ? `/doctor/${userId}/status` : `/patients/${userId}/status`;
      const url = `${backendUrl}${endpoint}`;
      console.log(`Updating status at ${url}`);
      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !isActive }) // Explicitly set the opposite state
      });
      console.log(`Response status for ${url}: ${response.status}`);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        console.error(`Error response for ${url}:`, errorData);
        let errorMessage = errorData.detail || `Failed to update ${userType} status (Status: ${response.status})`;
        if (response.status === 404) {
          errorMessage = `${userType.charAt(0).toUpperCase() + userType.slice(1)} status endpoint not found. Please ensure the backend is configured correctly.`;
        }
        throw new Error(errorMessage);
      }
      toast({
        title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Status Updated`,
        description: `${userType.charAt(0).toUpperCase() + userType.slice(1)} status has been updated.`,
      });
      if (userType === "doctor") {
        await fetchDoctors();
      } else {
        await fetchPatients();
      }
    } catch (error: unknown) {
      console.error(`Error updating ${userType} status:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to update ${userType} status`;
      toast({
        title: "Error",
        description: errorMessage || `Failed to update ${userType} status. Please check if the backend is running.`,
        variant: "destructive"
      });
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = doctorStatusFilter === "all" || 
      (doctorStatusFilter === "active" && doctor.status === "Active") ||
      (doctorStatusFilter === "inactive" && doctor.status === "Inactive");
    
    const matchesRating = doctorRatingFilter === "all" ||
      (doctorRatingFilter === "5" && doctor.averageRating >= 4.5) ||
      (doctorRatingFilter === "4" && doctor.averageRating >= 3.5 && doctor.averageRating < 4.5) ||
      (doctorRatingFilter === "3" && doctor.averageRating >= 2.5 && doctor.averageRating < 3.5) ||
      (doctorRatingFilter === "2" && doctor.averageRating >= 1.5 && doctor.averageRating < 2.5) ||
      (doctorRatingFilter === "1" && doctor.averageRating > 0 && doctor.averageRating < 1.5) ||
      (doctorRatingFilter === "0" && doctor.averageRating === 0);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = patientStatusFilter === "all" || 
      (patientStatusFilter === "active" && patient.status === "Active") ||
      (patientStatusFilter === "inactive" && patient.status === "Inactive");
    
    return matchesSearch && matchesStatus;
  });

  const filteredFeedback = feedback.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      item.patient.toLowerCase().includes(term) ||
      item.doctor.toLowerCase().includes(term) ||
      item.comment.toLowerCase().includes(term);

    const rating = item.rating;
    const ratingFilter = feedbackRatingFilter;
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "positive" && rating >= 4) ||
      (ratingFilter === "neutral" && rating === 3) ||
      (ratingFilter === "negative" && rating <= 2);

    return matchesSearch && matchesRating;
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "doctors", label: "Manage Doctors", icon: <UserPlus className="h-4 w-4" /> },
    { id: "patients", label: "Manage Patients", icon: <Users className="h-4 w-4" /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "feedback", label: "Patient Feedback", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "settings", label: "System Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="flex relative min-h-screen">
        <Button
          variant="ghost"
          className="md:hidden fixed top-20 left-4 z-50 p-2 rounded-full shadow-md bg-white dark:bg-gray-800"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:sticky top-0 w-64 h-full
          transition-transform duration-300 ease-in-out
          bg-background border-r z-40 md:flex
        `}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold">Admin Portal</span>
            </div>
            <div className="space-y-1 flex-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex-1 transition-all duration-300">
          <div className="p-4 md:p-8 pt-20 md:pt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Hospital management and analytics overview</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2 border-success text-success">
                  System Administrator
                </Badge>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Doctors</p>
                        <p className="text-2xl font-bold">{doctors.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Patients</p>
                        <p className="text-2xl font-bold">{patients.filter(p => p.status === "Active").length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-8 w-8 text-warning" />
                      <div>
                        <p className="text-sm text-muted-foreground">Feedback Received</p>
                        <p className="text-2xl font-bold">{feedbackAnalytics.totalFeedback}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                        <p className="text-2xl font-bold">{feedbackAnalytics.averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Patient Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {feedbackAnalytics.recentFeedback.length > 0 ? (
                            feedbackAnalytics.recentFeedback.map(feedback => (
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
                                  <span>{feedback.doctor}</span>
                                  <Badge variant={feedback.sentiment === "positive" ? "default" : "secondary"}>
                                    {feedback.sentiment}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No feedback available.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>System Health</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>System Uptime</span>
                          <Badge variant="default">40.9%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Active Sessions</span>
                          <Badge variant="secondary">4</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SMS Service</span>
                          <Badge variant="default">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Database Status</span>
                          <Badge variant="default">Healthy</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              {activeTab === "doctors" && (
                <div className="space-y-6">
                  {showAddDoctorForm && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{isEditing ? "Edit Doctor" : "Add New Doctor"}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setShowAddDoctorForm(false);
                              setIsEditing(false);
                              setEditingDoctorId(null);
                              setNewDoctor({ name: "", specialty: "", email: "", password: "", status: "Active" });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Full Name</label>
                              <Input 
                                placeholder="Dr. Full Name" 
                                value={newDoctor.name}
                                onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Specialty</label>
                              <Select
                                value={newDoctor.specialty}
                                onValueChange={(value) => setNewDoctor({...newDoctor, specialty: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialty" />
                                </SelectTrigger>
                                <SelectContent>
                                  {specialtyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Email</label>
                              <Input 
                                placeholder="doctor@hospital.cm" 
                                type="email"
                                value={newDoctor.email}
                                onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">{isEditing ? "New Password (optional)" : "Password"}</label>
                              <div className="relative">
                                <Input 
                                  placeholder={isEditing ? "Enter new password to change" : "Create a password"} 
                                  type={showPassword ? "text" : "password"}
                                  value={newDoctor.password}
                                  onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowAddDoctorForm(false);
                              setIsEditing(false);
                              setEditingDoctorId(null);
                              setNewDoctor({ name: "", specialty: "", email: "", password: "", status: "Active" });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="healthcare"
                            onClick={handleSubmitDoctor}
                            disabled={!newDoctor.name || !newDoctor.specialty || !newDoctor.email || (!isEditing && !newDoctor.password)}
                          >
                            {isEditing ? "Update Doctor" : "Add Doctor"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Doctor Management</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button onClick={handleCreateDoctor} variant="healthcare">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Doctor
                          </Button>
                          <Button 
                            onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = '.csv';
                              fileInput.onchange = (e) => {
                                const target = e.target as HTMLInputElement;
                                const file = target.files ? target.files[0] : null;
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const csvContent = event.target?.result as string;
                                    handleImportDoctors(csvContent);
                                  };
                                  reader.readAsText(file);
                                }
                              };
                              fileInput.click();
                            }}
                            variant="outline"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                          <Button 
                            onClick={() => {
                              // Export doctors to CSV
                              const headers = ['Name', 'Specialty', 'Email', 'Status', 'Patients', 'Rating'];
                              const csvData = filteredDoctors.map(doctor => [
                                doctor.name,
                                doctor.specialty,
                                doctor.email,
                                doctor.status,
                                doctor.patientCount?.toString() || '0',
                                doctor.averageRating?.toString() || 'N/A'
                              ]);
                              
                              const csvContent = [
                                headers.join(','),
                                ...csvData.map(row => row.join(','))
                              ].join('\n');
                              
                              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                              const link = document.createElement('a');
                              const url = URL.createObjectURL(blob);
                              link.setAttribute('href', url);
                              link.setAttribute('download', 'doctors.csv');
                              link.style.visibility = 'hidden';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              toast({
                                title: "Export Completed",
                                description: "Doctors data has been exported to CSV format.",
                              });
                            }} 
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search doctors..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                          />
                          <Select value={doctorStatusFilter} onValueChange={setDoctorStatusFilter}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={doctorRatingFilter} onValueChange={setDoctorRatingFilter}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Filter by rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Ratings</SelectItem>
                              <SelectItem value="5">4.5+ Stars</SelectItem>
                              <SelectItem value="4">3.5-4.4 Stars</SelectItem>
                              <SelectItem value="3">2.5-3.4 Stars</SelectItem>
                              <SelectItem value="2">1.5-2.4 Stars</SelectItem>
                              <SelectItem value="1">0.1-1.4 Stars</SelectItem>
                              <SelectItem value="0">No Rating</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Specialty</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Patients</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDoctors.length > 0 ? (
                              filteredDoctors.map(doctor => (
                                <TableRow key={doctor.id}>
                                  <TableCell className="font-medium">{doctor.name}</TableCell>
                                  <TableCell>{doctor.specialty}</TableCell>
                                  <TableCell>{doctor.email}</TableCell>
                                  <TableCell>{doctor.patientCount || 0}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-4 w-4 fill-warning text-warning" />
                                      <span>{doctor.averageRating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={doctor.status === "Active" ? "default" : "secondary"}>
                                      {doctor.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditDoctor(doctor.id)}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleDeactivateUser(doctor.id, "doctor")}
                                      >
                                        {doctor.status === "Active" ? "Deactivate" : "Activate"}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                  No doctors found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {activeTab === "patients" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Patient Management</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => {
                            // Export patients to CSV
                            const headers = ['Name', 'Email', 'Phone', 'Registration Date', 'Status'];
                            const csvData = filteredPatients.map(patient => [
                              patient.name,
                              patient.email,
                              patient.phone,
                              new Date(patient.registrationDate).toLocaleDateString(),
                              patient.status
                            ]);
                            
                            const csvContent = [
                              headers.join(','),
                              ...csvData.map(row => row.join(','))
                            ].join('\n');
                            
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            link.setAttribute('download', 'patients.csv');
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast({
                              title: "Export Completed",
                              description: "Patients data has been exported to CSV format.",
                            });
                          }} 
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Patient Data
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search patients..." 
                          className="max-w-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select value={patientStatusFilter} onValueChange={setPatientStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Patients</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPatients.length > 0 ? (
                            filteredPatients.map(patient => (
                              <TableRow key={patient.id}>
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.email}</TableCell>
                                <TableCell>{patient.phone}</TableCell>
                                <TableCell>{new Date(patient.registrationDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant={patient.status === "Active" ? "default" : "secondary"}>
                                    {patient.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Reset Access</Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleDeactivateUser(patient.id, "patient")}
                                    >
                                      {patient.status === "Active" ? "Deactivate" : "Activate"}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No patients found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* Enhanced System Overview */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                          <Users className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Active Doctors</p>
                            <p className="text-2xl font-bold">{systemAnalytics.activeDoctors}/{systemAnalytics.totalDoctors}</p>
                            <p className="text-xs text-muted-foreground">{systemAnalytics.doctorUtilizationRate}% utilization</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-8 w-8 text-secondary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Active Patients</p>
                            <p className="text-2xl font-bold">{systemAnalytics.activePatients}/{systemAnalytics.totalPatients}</p>
                            <p className="text-xs text-muted-foreground">{systemAnalytics.patientActivityRate}% active</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                          <Star className="h-8 w-8 text-warning" />
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Rating</p>
                            <p className="text-2xl font-bold">{feedbackAnalytics.averageRating.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">from {feedbackAnalytics.totalFeedback} reviews</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-8 w-8 text-success" />
                          <div>
                            <p className="text-sm text-muted-foreground">Reply Rate</p>
                            <p className="text-2xl font-bold">{feedbackAnalytics.replyRate}%</p>
                            <p className="text-xs text-muted-foreground">{feedbackAnalytics.repliedCount} replies sent</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enhanced Analytics Grid */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Doctor Specialties Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {systemAnalytics.specialtyData.length > 0 ? (
                          systemAnalytics.specialtyData.map((specialty) => (
                            <div key={specialty.name} className="flex items-center space-x-2">
                              <div className="w-20 text-sm font-medium">{specialty.name}</div>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${specialty.percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-16 text-xs text-muted-foreground text-right">
                                {specialty.count} ({specialty.percentage}%)
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center">No specialty data available.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Star className="h-5 w-5" />
                          <span>Feedback Rating Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {feedbackAnalytics.ratingDistribution.map(({ rating, count, percentage }) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <div className="w-8 text-sm font-medium">{rating}★</div>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  rating >= 4 ? 'bg-success' : 
                                  rating === 3 ? 'bg-warning' : 'bg-destructive'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-16 text-xs text-muted-foreground text-right">
                              {count} ({percentage}%)
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Integrated Hospital Dashboard with sentiment analysis */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Hospital Analytics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-auto">
                        <HospitalDashboard patients={patients} adminFeedback={feedback} />
                      </div>
                    </CardContent>
                  </Card>
                  
                </div>
              )}
            
              {activeTab === "feedback" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Patient Feedback</span>
                      </CardTitle>
                      <Button 
                        onClick={() => {
                          // Export feedback to CSV
                          const headers = ['Patient', 'Doctor', 'Rating', 'Comment', 'Date', 'Sentiment', 'Replies Count'];
                          const csvData = feedback.map(item => [
                            item.patient,
                            item.doctor,
                            item.rating.toString(),
                            `"${item.comment.replace(/"/g, '""')}"`, // Escape quotes in comments
                            item.date,
                            item.sentiment,
                            (item.replies?.length || 0).toString()
                          ]);
                          
                          const csvContent = [
                            headers.join(','),
                            ...csvData.map(row => row.join(','))
                          ].join('\n');
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          const url = URL.createObjectURL(blob);
                          link.setAttribute('href', url);
                          link.setAttribute('download', `feedback_${new Date().toISOString().split('T')[0]}.csv`);
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast({
                            title: "Export Completed",
                            description: "Feedback data has been exported to CSV format.",
                          });
                        }} 
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2"/>
                        Export Feedback
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search feedback..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="max-w-sm"
                        />
                        <Select value={feedbackRatingFilter} onValueChange={setFeedbackRatingFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="positive">Positive (4-5)</SelectItem>
                            <SelectItem value="neutral">Neutral (3)</SelectItem>
                            <SelectItem value="negative">Negative (1-2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        {filteredFeedback.length > 0 ? (
                          filteredFeedback.map((item) => (
                            <Card key={item.id} className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{item.patient}</span>
                                      <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <Star 
                                            key={star}
                                            className={`h-4 w-4 ${star <= item.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                                          />
                                        ))}
                                        <span className="text-sm text-muted-foreground">({item.rating.toFixed(1)})</span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Doctor: {item.doctor} • {new Date(item.date).toLocaleDateString()}
                                    </div>
                                    <p className="text-sm">{item.comment}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={item.sentiment === "positive" ? "default" : "secondary"}>
                                      {item.sentiment}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {/* Display existing replies */}
                                {item.replies && item.replies.length > 0 && (
                                  <div className="ml-4 border-l-2 border-muted pl-4 space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Hospital Responses:</h4>
                                    {item.replies.map((reply) => (
                                      <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-medium text-primary">{reply.admin_name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(reply.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm">{reply.reply_text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Reply form */}
                                {replyingToFeedback === item.id ? (
                                  <div className="border-t pt-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Reply to {item.patient}:</label>
                                      <textarea
                                        className="w-full p-2 border rounded-md resize-none"
                                        rows={3}
                                        placeholder="Type your reply here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                      />
                                      <div className="flex space-x-2">
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleReplyToFeedback(item.id)}
                                          disabled={!replyText.trim()}
                                        >
                                          Send Reply
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => {
                                            setReplyingToFeedback(null);
                                            setReplyText("");
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-t pt-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => {
                                        setReplyingToFeedback(item.id);
                                        setReplyText("");
                                      }}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Reply to Patient
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))
                        ) : (
                          <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No feedback found.</p>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeTab === "settings" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>System Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Maintenance Mode</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">System Notifications</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Appointments Per Day</label>
                        <Input type="number" defaultValue={20} min={1} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Feedback SLA (hrs)</label>
                        <Input type="number" defaultValue={24} min={1} />
                      </div>
                    </div>
                    <Button
                      className="mt-4"
                      onClick={() =>
                        toast({
                          title: "Settings Updated",
                          description: "Your changes have been saved successfully.",
                        })
                      }
                    >
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;