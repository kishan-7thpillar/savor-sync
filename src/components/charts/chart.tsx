'use client';

import React from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: any[];
  xField: string;
  yField: string;
  title?: string;
}

export function BarChart({ data, xField, yField, title }: ChartProps) {
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey={xField} 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }} 
          />
          <Bar 
            dataKey={yField} 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({ data, xField, yField, title }: ChartProps) {
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey={xField} 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey={yField} 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ stroke: '#3b82f6', strokeWidth: 2, fill: 'white', r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
