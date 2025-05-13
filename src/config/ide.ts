
import type { NavItem } from '@/types';

export const ideSiteConfig = {
  name: "Cloud IDE for Data Analytics",
  description: "Develop timeseries analytics and control algorithms.",
};

export const ideNavItems: NavItem[] = [
  {
    title: "Data Explorer",
    href: "/ide/data-explorer",
    icon: "Database", // Lucide icon name
    label: "Data Explorer",
  },
  {
    title: "Workbench",
    href: "/ide/workbench",
    icon: "TerminalSquare", // Lucide icon name
    label: "Algorithm Workbench",
  },
  {
    title: "Config Manager",
    href: "/ide/config-manager",
    icon: "SlidersHorizontal", // Lucide icon name
    label: "AWS Configuration",
  },
  {
    title: "Monitoring",
    href: "/ide/monitoring",
    icon: "LineChart", // Lucide icon name (using LineChart as AreaChart might not be available or suitable)
    label: "Performance Monitoring",
  },
];
