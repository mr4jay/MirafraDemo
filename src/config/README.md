# Application Configuration

This directory stores configuration files that define various aspects of the HVAC Optimizer application and its integrated IDE.

## Overview

Configuration files help in managing static settings, navigation structures, and other parameters that might change infrequently but are critical to the application's behavior and appearance.

## Key Files

*   **`site.ts`**:
    *   **Purpose**: Defines configuration specific to the main HVAC Optimizer application.
    *   **Contents**:
        *   `siteConfig`: An object containing the application's name and description. This can be used for metadata (e.g., page titles, SEO).
            ```typescript
            export const siteConfig = {
              name: "HVAC Optimizer",
              description: "Intelligent HVAC optimization and monitoring.",
            };
            ```
        *   `navItems`: An array of `NavItem` objects defining the primary navigation structure for the main application. Each item typically includes:
            *   `title`: The display text for the navigation link.
            *   `href`: The path for the link.
            *   `icon`: A string identifier for a Lucide icon (e.g., "LayoutDashboard"). The actual icon component is resolved in `NavMenu.tsx`.
            *   `label`: An optional accessibility label or tooltip content.
            ```typescript
            import type { NavItem } from '@/types';

            export const navItems: NavItem[] = [
              {
                title: "Dashboard",
                href: "/dashboard",
                icon: "LayoutDashboard",
                label: "Dashboard",
              },
              // ... other navigation items
            ];
            ```
    *   **Usage**: Imported by layout components (e.g., `src/app/(app)/layout.tsx`) to render the navigation menu and potentially by `src/app/layout.tsx` for site-wide metadata.

*   **`ide.ts`**:
    *   **Purpose**: Defines configuration specific to the cloud-based IDE section of the application.
    *   **Contents**:
        *   `ideSiteConfig`: An object containing the IDE's name and description.
            ```typescript
            export const ideSiteConfig = {
              name: "Cloud IDE for Data Analytics",
              description: "Develop timeseries analytics and control algorithms.",
            };
            ```
        *   `ideNavItems`: An array of `NavItem` objects defining the navigation structure for the IDE. The structure is similar to `navItems` in `site.ts`.
            ```typescript
            import type { NavItem } from '@/types';

            export const ideNavItems: NavItem[] = [
              {
                title: "Data Explorer",
                href: "/ide/data-explorer",
                icon: "Database",
                label: "Data Explorer",
              },
              // ... other IDE navigation items
            ];
            ```
    *   **Usage**: Imported by the IDE layout component (`src/app/ide/(ide-app)/layout.tsx`) to render the IDE-specific navigation menu.

## `NavItem` Type

The `NavItem` type, used in both configuration files, is defined in `src/types/index.ts`:
```typescript
export type NavItem = {
  title: string;
  href: string;
  icon: string; // String identifier for a Lucide icon
  label?: string;
  disabled?: boolean;
  external?: boolean;
};
```

## Customization

To modify the navigation or site/IDE metadata:
1.  **Edit `site.ts`** for changes related to the main HVAC Optimizer application.
2.  **Edit `ide.ts`** for changes related to the Cloud IDE.

Ensure that icon names correspond to valid Lucide React icon names, as these are dynamically resolved by the `NavMenu` component.
```