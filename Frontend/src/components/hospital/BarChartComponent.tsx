import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartComponentProps {
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey: string;
  color?: string;
  title?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  unit?: string;
  className?: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  color, 
  title, 
  secondaryDataKey, 
  secondaryColor, 
  unit = "%",
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis unit={unit} />
          <Tooltip formatter={(value) => unit === "%" ? `${value}%` : value} />
          <Legend />
          <Bar dataKey={dataKey} name={dataKey} fill={color || "#8884d8"} />
          {secondaryDataKey && (
            <Bar dataKey={secondaryDataKey} name={secondaryDataKey} fill={secondaryColor || "#82ca9d"} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;