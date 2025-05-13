import type { ReactNode, ElementType } from 'react';

export type NavItem = {
  title: string;
  href: string;
  icon: string; // Changed from ElementType to string
  label?: string;
  disabled?: boolean;
  external?: boolean;
};

export type SensorDataPoint = {
  time: string; // ISO string or formatted date string
  value: number;
};

export type TimeseriesData = {
  name: string;
  data: SensorDataPoint[];
  color?: string; // Optional: specify color for this series
};

export type KpiCardProps = {
  title: string;
  value: string;
  unit?: string;
  icon: ElementType; 
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

