import type { NavItem } from '@/types';
import { LayoutDashboard, BarChart3, Cpu, Thermometer, Settings, Activity } from 'lucide-react';

export const siteConfig = {
  name: "HVAC Optimizer",
  description: "Intelligent HVAC optimization and monitoring.",
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    title: "Sensor Data",
    href: "/sensor-data",
    icon: BarChart3,
    label: "Sensor Data",
  },
  {
    title: "Algorithm Output",
    href: "/algorithm-output",
    icon: Activity, // Using Activity as a proxy for algorithm/CPU related output
    label: "Algorithm Output",
  },
  {
    title: "Configure System",
    href: "/configure",
    icon: Settings,
    label: "Configure",
  },
];
