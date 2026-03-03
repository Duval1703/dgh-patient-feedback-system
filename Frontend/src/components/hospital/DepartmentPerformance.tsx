import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface DepartmentData {
  name: string;
  avgRating: number;
  patients: number;
  doctors: number;
}

interface DepartmentPerformanceProps {
  departments: DepartmentData[];
  className?: string;
}

const DepartmentPerformance: React.FC<DepartmentPerformanceProps> = ({ departments, className = "" }) => {
  // Sort departments by rating in descending order
  const sortedDepartments = [...departments].sort((a, b) => b.avgRating - a.avgRating);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDepartments.map(dept => (
          <div key={dept.name} className="flex items-center justify-between border-b pb-2 last:border-0">
            <div>
              <p className="font-medium">{dept.name}</p>
              <div className="flex items-center mt-1">
                <div className="flex items-center mr-3">
                  <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                  <span className="text-sm">{dept.avgRating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dept.patients} patients</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{dept.doctors} doctors</p>
              <p className="text-sm text-muted-foreground">on staff</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DepartmentPerformance;