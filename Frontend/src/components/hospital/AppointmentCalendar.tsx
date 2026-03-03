import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  type: string;
  status: string;
  dateTime: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  className?: string;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments, className = "" }) => {
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');

  // Format appointments for FullCalendar
  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.patient} - ${appointment.type}`,
    start: appointment.dateTime,
    end: new Date(new Date(appointment.dateTime).getTime() + 30 * 60000).toISOString(), // Adding 30 minutes
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    extendedProps: appointment
  }));

  function getStatusColor(status: string) {
    switch(status.toLowerCase()) {
      case 'completed':
        return '#22c55e'; // green
      case 'scheduled':
        return '#3b82f6'; // blue
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  const handleEventClick = (clickInfo: {event: {extendedProps: Appointment}}) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsDialogOpen(true);
  };

  const exportAppointments = () => {
    const headers = ['Patient', 'Doctor', 'Type', 'Status', 'Date', 'Time'];
    
    // Handle empty appointments
    if (!appointments || appointments.length === 0) {
      const csvContent = headers.join(','); // Just headers, no data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const fileName = `appointments_${currentView}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    const csvData = appointments.map(appointment => [
      appointment.patient,
      appointment.doctor,
      appointment.type,
      appointment.status,
      new Date(appointment.dateTime).toLocaleDateString(),
      new Date(appointment.dateTime).toLocaleTimeString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `appointments_${currentView}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointment Calendar</CardTitle>
          <Button onClick={exportAppointments} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          viewDidMount={(info) => setCurrentView(info.view.type)}
          height="auto"
          aspectRatio={1.5}
          // Suppress unknown option warnings from development tools
          eventDataTransform={(eventData) => {
            // Remove any data-* attributes that might be injected by dev tools
            const cleanedData = { ...eventData };
            Object.keys(cleanedData).forEach(key => {
              if (key.startsWith('data-')) {
                delete cleanedData[key];
              }
            });
            return cleanedData;
          }}
        />

        {selectedEvent && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedEvent.patient}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                    <p className="font-medium">{selectedEvent.doctor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedEvent.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEvent.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      selectedEvent.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedEvent.status}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{new Date(selectedEvent.dateTime).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;