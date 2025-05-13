import type { ReactNode, ElementType } from 'react';

export type NavItem = {
  title: string;
  href: string;
  icon: ElementType; // Was LucideIcon, changed to support Material Icons
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
  icon: ElementType; // Was LucideIcon, changed to support Material Icons
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};
