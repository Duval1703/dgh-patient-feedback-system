import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, unit = '%', icon, trend, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{value}</p>
            {unit && <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</p>}
          </div>
          {trend && (
            <div className={`mt-2 flex items-center text-xs ${trend.isUpward ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              <span className="mr-1">
                {trend.isUpward ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span>{trend.value}% {trend.isUpward ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;