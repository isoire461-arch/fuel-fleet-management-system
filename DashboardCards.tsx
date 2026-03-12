
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, trend, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 
            trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};
