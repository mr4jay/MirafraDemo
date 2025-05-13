
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, BarChart3, SlidersHorizontal, Settings, Icon as LucideIcon, Database, TerminalSquare, LineChart, HelpCircle } from 'lucide-react'; // Import necessary icons

interface NavMenuProps {
  items: NavItem[];
  isMobile?: boolean;
}

const iconMap: { [key: string]: LucideIcon } = {
  LayoutDashboard,
  BarChart3,
  SlidersHorizontal,
  Settings,
  Database,
  TerminalSquare,
  LineChart,
  // Add other icons from ideNavItems here if they are string keys
};

export function NavMenu({ items, isMobile = false }: NavMenuProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon as LucideIcon;
        const FallbackIcon = HelpCircle; // Fallback icon
        const ResolvedIcon = IconComponent || FallbackIcon; // Use IconComponent if found, else fallback

        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        
        return item.href ? (
          <SidebarMenuItem key={index}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{
                  children: item.title,
                  side: 'right',
                  align: 'center',
                }}
                className={cn(
                  "justify-start",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <a>
                  <ResolvedIcon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ) : null;
      })}
    </SidebarMenu>
  );
}
