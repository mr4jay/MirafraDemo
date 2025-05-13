# Application Configuration

This directory stores configuration files that define various aspects of the HVAC Optimizer application and its integrated IDE. For Data Analytics Engineers, these files are primarily relevant for understanding the navigation structure of the IDE and how to access different tools.

## Overview

Configuration files help in managing static settings, navigation structures, and other parameters. While engineers might not frequently modify these, understanding their structure can be helpful.

## Key Files

*   **`site.ts`**:
    *   **Purpose**: Defines configuration specific to the main HVAC Optimizer application.
    *   **Relevance for Engineers**: Less directly relevant, but defines the overall application context.
    *   **Contents**:
        *   `siteConfig`: Application's name and description.
        *   `navItems`: Navigation structure for the main application.
            ```typescript
            import type { NavItem } from '@/types';

            export const navItems: NavItem[] = [
              {
                title: "Dashboard",
                href: "/dashboard",
                icon: "LayoutDashboard", // Lucide icon name
                label: "Dashboard",
              },
              // ... other navigation items
            ];
            ```
    *   **Usage**: Imported by `src/app/(app)/layout.tsx`.

*   **`ide.ts`**:
    *   **Purpose**: Defines configuration specific to the cloud-based IDE section.
    *   **Relevance for Engineers**: **Highly relevant.** This file defines the navigation menu within the IDE, providing access to tools like the Data Explorer, Workbench, Config Manager, and Monitoring dashboard.
    *   **Contents**:
        *   `ideSiteConfig`: The IDE's name and description.
        *   `ideNavItems`: An array of `NavItem` objects defining the navigation structure for the IDE. Engineers use these links to access their development tools.
            ```typescript
            import type { NavItem } from '@/types';

            export const ideNavItems: NavItem[] = [
              {
                title: "Data Explorer",
                href: "/ide/data-explorer",
                icon: "Database", // Lucide icon name for data-related tools
                label: "Explore and Preprocess Data",
              },
              {
                title: "Workbench",
                href: "/ide/workbench",
                icon: "TerminalSquare", // Lucide icon name for coding/development
                label: "Develop Algorithms",
              },
              {
                title: "Config Manager",
                href: "/ide/config-manager",
                icon: "SlidersHorizontal", // Lucide icon name for settings/configurations
                label: "Manage AWS & Algorithm Configurations",
              },
              {
                title: "Monitoring",
                href: "/ide/monitoring",
                icon: "LineChart", // Lucide icon name for performance tracking
                label: "Monitor Performance & Collaborate",
              },
            ];
            ```
    *   **Usage**: Imported by the IDE layout component (`src/app/ide/(ide-app)/layout.tsx`) to render the IDE-specific navigation menu.

## `NavItem` Type

The `NavItem` type, used in both configuration files, is defined in `src/types/index.ts`:
```typescript
export type NavItem = {
  title: string;
  href: string;
  icon: string; // String identifier for a Lucide React icon name
  label?: string;
  disabled?: boolean;
  external?: boolean;
};
```

## Customization by Engineers

While direct modification of these files by Data Analytics Engineers might be infrequent, understanding `ide.ts` helps them navigate the IDE efficiently. If new top-level tools or sections were added to the IDE, this file would be updated.
```