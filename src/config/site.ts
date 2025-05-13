import type { NavItem } from '@/types';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';

export const siteConfig = {
  name: "HVAC Optimizer",
  description: "Intelligent HVAC optimization and monitoring.",
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    label: "Dashboard",
  },
  {
    title: "Sensor Data",
    href: "/sensor-data",
    icon: AssessmentIcon,
    label: "Sensor Data",
  },
  {
    title: "Algorithm Output",
    href: "/algorithm-output",
    icon: TuneIcon,
    label: "Algorithm Output",
  },
  {
    title: "Configure System",
    href: "/configure",
    icon: SettingsIcon,
    label: "Configure",
  },
];
