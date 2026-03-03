import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Star,
  User,
  Clock,
  Pill,
  MessageSquare,
  Plus,
  Search,
  Send,
  Phone,
  Menu,
  ClipboardList,
  Stethoscope
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

// Define TypeScript interfaces for our state data
interface Patient {
  id: string;
  name: string;
  email: string;
}

interface FeedbackItem {
  id: string;
  patient_name: string;
  category: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

interface Appointment {
  id: string;
  patient_id: number;
  doctor_id: number;
  patient_name: string;
  date: string;
  time: string;
  description: string;
  status: string;
}

interface Medication {
  id: string;
  patient_id?: number;
  doctor_id?: number;
  patient_name: string;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  role: "doctor"; // Fixed to match DashboardLayoutProps
}

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("feedback");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [patientFeedback, setPatientFeedback] = useState<FeedbackItem[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: "",
    date: "",
    time: "",
    description: "",
    status: "Pending"
  });
  const [medicationForm, setMedicationForm] = useState({
    patientName: "",
    medication: "",
    dosage: "",
    frequency: "",
    instructions: ""
  });
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [medicationSearch, setMedicationSearch] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({ id: "", name: "", specialty: "", role: "doctor" });
  const [patients, setPatients] = useState<Patient[]>([]);
  const { toast } = useToast();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // Fetch patients list for the dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("authToken") || "demo-token";
        const response = await fetch(`${backendUrl}/patients`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPatients(data.map((patient: { id: number | string; first_name?: string; last_name?: string; email: string }) => ({
            id: patient.id.toString(),
            name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || "Patient",
            email: patient.email
          })));
          localStorage.setItem("patientsList", JSON.stringify(data));
        } else {
          console.warn("Failed to fetch patients list, checking localStorage");
          const cachedPatients = localStorage.getItem("patientsList");
          if (cachedPatients) {
            const parsedPatients = JSON.parse(cachedPatients);
            setPatients(parsedPatients.map((patient: { id: number | string; first_name?: string; last_name?: string; email: string }) => ({
              id: patient.id.toString(),
              name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || "Patient",
              email: patient.email
            })));
          } else {
            throw new Error("Failed to fetch patients and no cached data available");
          }
        }
      } catch (error: any) {
        console.error("Fetch patients error:", error);
        toast({
          title: "Error",
          description: `Failed to load patients: ${error.message}`,
          variant: "destructive"
        });
      }
    };
    fetchPatients();
  }, [toast, backendUrl]);

  // Fetch doctor profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await fetch(`${backendUrl}/doctor/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch profile: ${errorData.detail || response.statusText}`);
        }
        const data = await response.json();
        setDoctorProfile({
          id: data.id.toString(),
          name: data.name,
          specialty: data.specialty,
          role: "doctor" // Hardcoded as doctor for DoctorDashboard
        });
      } catch (error: any) {
        console.error("Fetch profile error:", error);
        toast({
          title: "Error",
          description: `Failed to load profile: ${error.message}`,
          variant: "destructive"
        });
      }
    };
    fetchDoctorProfile();
  }, [toast, backendUrl]);

  // Fetch feedback for the logged-in doctor
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken") || "demo-token";
        const response = await fetch(`${backendUrl}/feedback`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch feedback: ${response.statusText}`);
        }
        const data = await response.json();
        setPatientFeedback(data.map((fb: any) => ({
          id: fb.id.toString(),
          patient_name: fb.patient_name || "Anonymous",
          category: fb.category?.name || "N/A",
          rating: fb.rating || 0,
          comment: fb.comment || "No comment",
          status: fb.rating <= 2 ? "Negative" : (fb.rating === 3 ? "Neutral" : "Positive"),
          created_at: fb.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
        })));
      } catch (error: any) {
        console.error("Fetch feedback error:", error);
        setPatientFeedback([]);
        toast({
          title: "Error",
          description: `Failed to load feedback: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [toast, backendUrl]);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken") || "demo-token";
        const response = await fetch(`${backendUrl}/appointments/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch appointments: ${response.statusText}`);
        }
        const data = await response.json();
        setUpcomingAppointments(data.map((appt: any) => ({
          id: appt.id.toString(),
          patient_id: appt.patient_id,
          doctor_id: appt.doctor_id,
          patient_name: appt.patient_name || "Unknown",
          date: appt.date,
          time: appt.time,
          description: appt.description || "",
          status: appt.status || "Pending"
        })));
      } catch (error: any) {
        console.error("Fetch appointments error:", error);
        setUpcomingAppointments([]);
        toast({
          title: "Error",
          description: `Failed to load appointments: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [toast, backendUrl]);

  // Fetch medications
  useEffect(() => {
    const fetchMedications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken") || "demo-token";
        const response = await fetch(`${backendUrl}/medications/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch medications: ${response.statusText}`);
        }
        const data = await response.json();
        setMedications(data.map((med: any) => ({
          id: med.id.toString(),
          patient_id: med.patient_id,
          doctor_id: med.doctor_id,
          patient_name: med.patient_name || "Unknown",
          medication: med.medication,
          dosage: med.dosage,
          frequency: med.frequency,
          instructions: med.instructions || ""
        })));
      } catch (error: any) {
        console.error("Fetch medications error:", error);
        setMedications([]);
        toast({
          title: "Error",
          description: `Failed to load medications: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, [toast, backendUrl]);

  // Handle appointment submission
  const handleSubmitAppointment = async () => {
    if (!appointmentForm.patientName || !appointmentForm.date || !appointmentForm.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || "demo-token";
      const selectedPatient = patients.find(p => p.name === appointmentForm.patientName);
      if (!selectedPatient) {
        throw new Error("Selected patient not found");
      }

      const payload = {
        patient_id: parseInt(selectedPatient.id),
        doctor_id: parseInt(doctorProfile.id),
        date: appointmentForm.date,
        time: appointmentForm.time,
        description: appointmentForm.description,
        status: appointmentForm.status
      };

      const response = await fetch(`${backendUrl}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create appointment: ${errorData.detail || response.statusText}`);
      }

      const newAppointment = await response.json();
      setUpcomingAppointments(prev => [
        ...prev,
        {
          id: newAppointment.id.toString(),
          patient_id: newAppointment.patient_id,
          doctor_id: newAppointment.doctor_id,
          patient_name: newAppointment.patient_name || "Unknown",
          date: newAppointment.date,
          time: newAppointment.time,
          description: newAppointment.description || "",
          status: newAppointment.status || "Pending"
        }
      ]);

      toast({
        title: "Appointment Created",
        description: "The appointment has been successfully scheduled."
      });

      setAppointmentForm({
        patientName: "",
        date: "",
        time: "",
        description: "",
        status: "Pending"
      });
    } catch (error: any) {
      console.error("Create appointment error:", error);
      toast({
        title: "Error",
        description: `Failed to create appointment: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle medication submission
  const handleSubmitMedication = async () => {
    if (!medicationForm.patientName || !medicationForm.medication || !medicationForm.dosage || !medicationForm.frequency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || "demo-token";
      const selectedPatient = patients.find(p => p.name === medicationForm.patientName);
      if (!selectedPatient) {
        throw new Error("Selected patient not found");
      }

      const payload = {
        patient_id: parseInt(selectedPatient.id),
        doctor_id: parseInt(doctorProfile.id),
        medication: medicationForm.medication,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        instructions: medicationForm.instructions
      };

      const response = await fetch(`${backendUrl}/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create medication: ${errorData.detail || response.statusText}`);
      }

      const newMedication = await response.json();
      setMedications(prev => [
        ...prev,
        {
          id: newMedication.id.toString(),
          patient_id: newMedication.patient_id,
          doctor_id: newMedication.doctor_id,
          patient_name: newMedication.patient_name || "Unknown",
          medication: newMedication.medication,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          instructions: newMedication.instructions || ""
        }
      ]);

      toast({
        title: "Medication Prescribed",
        description: "The medication has been successfully prescribed."
      });

      setMedicationForm({
        patientName: "",
        medication: "",
        dosage: "",
        frequency: "",
        instructions: ""
      });
    } catch (error: any) {
      console.error("Create medication error:", error);
      toast({
        title: "Error",
        description: `Failed to create medication: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle contact support
  const handleContactSupport = () => {
    toast({
      title: "Support Message Sent",
      description: "Our support team will respond within 24 hours."
    });
  };

  // Filter feedback based on search and status
  const filteredFeedback = patientFeedback.filter(fb => {
    const matchesSearch = feedbackSearch
      ? fb.patient_name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        fb.comment.toLowerCase().includes(feedbackSearch.toLowerCase())
      : true;
    const matchesFilter = feedbackFilter === "all" ? true : fb.status.toLowerCase() === feedbackFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Filter appointments based on search
  const filteredAppointments = upcomingAppointments.filter(appt =>
    appointmentSearch
      ? appt.patient_name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        appt.description.toLowerCase().includes(appointmentSearch.toLowerCase())
      : true
  );

  // Filter medications based on search
  const filteredMedications = medications.reduce((acc: { [key: string]: Medication[] }, med) => {
    const patientName = med.patient_name || "Unknown";
    if (
      medicationSearch
        ? patientName.toLowerCase().includes(medicationSearch.toLowerCase()) ||
          med.medication.toLowerCase().includes(medicationSearch.toLowerCase())
        : true
    ) {
      if (!acc[patientName]) {
        acc[patientName] = [];
      }
      acc[patientName].push(med);
    }
    return acc;
  }, {});

  const medicationPatients = Object.keys(filteredMedications).sort();

  const navItems = [
    { id: "feedback", label: "Patient Feedback", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "appointments", label: "Appointments", icon: <CalendarIcon className="h-4 w-4" /> },
    { id: "medications", label: "Medications", icon: <Pill className="h-4 w-4" /> },
    { id: "support", label: "Contact Support", icon: <Phone className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout userRole={doctorProfile.role} userName={doctorProfile.name}>
      <div className="flex">
        <Button
          variant="ghost"
          className="md:hidden fixed top-20 left-4 z-50 p-2 rounded-full shadow-md bg-white dark:bg-gray-800"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-4" />
        </Button>

        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          fixed md:sticky
          top-0
          w-64 h-full
          transition-transform duration-300 ease-in-out
          bg-background border-r
          z-40
        `}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-6">
              <Stethoscope className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold">Doctor Portal</span>
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

        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
                <p className="text-muted-foreground">Manage your appointments and patient feedback</p>
              </div>
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold">DGH Care</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Patient Feedback</p>
                      <p className="text-2xl font-bold">{patientFeedback.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-8 w-8 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                      <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prescribed Medications</p>
                      <p className="text-2xl font-bold">{medications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {activeTab === "feedback" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Patient Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search feedback..."
                        value={feedbackSearch}
                        onChange={(e) => setFeedbackSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select onValueChange={setFeedbackFilter} defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Feedback</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {filteredFeedback.length > 0 ? (
                      filteredFeedback.map(fb => (
                        <div key={fb.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{fb.patient_name}</p>
                                <p className="text-sm text-muted-foreground">{fb.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= fb.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
                                  />
                                ))}
                              </div>
                              <span className={`text-xs font-medium ${
                                fb.status.toLowerCase() === 'negative' ? 'text-red-500' :
                                fb.status.toLowerCase() === 'neutral' ? 'text-yellow-500' :
                                'text-green-500'
                              }`}>
                                {fb.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{fb.comment}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{fb.created_at}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        {feedbackSearch || feedbackFilter !== "all"
                          ? "No feedback matches your search or filter."
                          : "No feedback available."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Add New Appointment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Patient</label>
                        <Select
                          onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, patientName: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map(patient => (
                              <SelectItem key={patient.id} value={patient.name}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Time</label>
                        <Input
                          type="time"
                          value={appointmentForm.time}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, status: value }))}
                          defaultValue="Pending"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Enter appointment details..."
                        value={appointmentForm.description}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSubmitAppointment} variant="healthcare" className="w-full" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search appointments..."
                          value={appointmentSearch}
                          onChange={(e) => setAppointmentSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appt => (
                          <div key={appt.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{appt.patient_name}</p>
                              <p className="text-sm text-muted-foreground">{appt.date} at {appt.time}</p>
                              <p className="text-sm text-muted-foreground">{appt.description}</p>
                            </div>
                            <Badge className={appt.status === "Confirmed" ? "bg-green-600 hover:bg-green-700" : ""}
                              variant={appt.status === "Confirmed" ? "secondary" : appt.status === "Cancelled" ? "destructive" : "default"}>
                              {appt.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">
                          {appointmentSearch ? "No appointments match your search." : "No upcoming appointments."}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "medications" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5" />
                      <span>Prescribe Medication</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Patient</label>
                        <Select
                          onValueChange={(value) => setMedicationForm(prev => ({ ...prev, patientName: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map(patient => (
                              <SelectItem key={patient.id} value={patient.name}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Medication</label>
                        <Input
                          placeholder="Enter medication name"
                          value={medicationForm.medication}
                          onChange={(e) => setMedicationForm(prev => ({ ...prev, medication: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dosage</label>
                        <Input
                          placeholder="Enter dosage"
                          value={medicationForm.dosage}
                          onChange={(e) => setMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Frequency</label>
                        <Input
                          placeholder="Enter frequency"
                          value={medicationForm.frequency}
                          onChange={(e) => setMedicationForm(prev => ({ ...prev, frequency: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea
                        placeholder="Enter medication instructions..."
                        value={medicationForm.instructions}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSubmitMedication} variant="healthcare" className="w-full" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Prescribe Medication
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prescribed Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search medications..."
                          value={medicationSearch}
                          onChange={(e) => setMedicationSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {medicationPatients.length > 0 ? (
                        medicationPatients.map(patient => (
                          filteredMedications[patient] && filteredMedications[patient].length > 0 ? (
                            <div key={patient} className="mb-4">
                              <h3 className="text-lg font-semibold mb-2">{patient}</h3>
                              <div className="space-y-3">
                                {filteredMedications[patient].map(med => (
                                  <div key={med.id} className="border rounded-lg p-3">
                                    <p><strong>Medication:</strong> {med.medication || "N/A"}</p>
                                    <p><strong>Dosage:</strong> {med.dosage || "N/A"}</p>
                                    <p><strong>Frequency:</strong> {med.frequency || "N/A"}</p>
                                    <p><strong>Instructions:</strong> {med.instructions || "N/A"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No medications found for {patient} matching search.</p>
                          )
                        ))
                      ) : (
                        <p className="text-muted-foreground">
                          {medicationSearch
                            ? "No medications found matching your search criteria."
                            : "No medications prescribed yet."}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "support" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Contact Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-4 bg-muted/30">
                      <div className="text-center space-y-2">
                        <Phone className="h-8 w-8 text-primary mx-auto" />
                        <h3 className="font-semibold">IT Support</h3>
                        <p className="text-muted-foreground">+237 233 40 10 01</p>
                      </div>
                    </Card>

                    <Card className="p-4 bg-muted/30">
                      <div className="text-center space-y-2">
                        <MessageSquare className="h-8 w-8 text-secondary mx-auto" />
                        <h3 className="font-semibold">Medical Support</h3>
                        <p className="text-muted-foreground">medical@dghcare.cm</p>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        placeholder="Describe your technical issue or question..."
                        rows={5}
                      />
                    </div>
                    <Button onClick={handleContactSupport} variant="healthcare" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;