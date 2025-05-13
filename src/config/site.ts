import type { NavItem } from '@/types';
// Icon components are no longer directly used here, only their string names.

export const siteConfig = {
  name: "HVAC Optimizer",
  description: "Intelligent HVAC optimization and monitoring.",
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard", // String identifier
    label: "Dashboard",
  },
  {
    title: "Sensor Data",
    href: "/sensor-data",
    icon: "BarChart3", // String identifier
    label: "Sensor Data",
  },
  {
    title: "Algorithm Output",
    href: "/algorithm-output",
    icon: "SlidersHorizontal", // String identifier
    label: "Algorithm Output",
  },
  {
    title: "Configure System",
    href: "/configure",
    icon: "Settings", // String identifier
    label: "Configure",
  },
];

