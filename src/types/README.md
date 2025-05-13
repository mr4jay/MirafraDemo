# TypeScript Type Definitions

This directory (`src/types`) contains shared TypeScript type definitions and interfaces used throughout the HVAC Optimizer application.

## Overview

Centralizing type definitions helps in:
-   Ensuring consistency in data structures across different parts of the application.
-   Improving code readability and maintainability.
-   Leveraging TypeScript's static typing benefits for early error detection and better developer experience (e.g., autocompletion).

## Key Type Definitions (`index.ts`)

*   **`NavItem`**:
    *   **Purpose**: Defines the structure for an item in the navigation menus (both for the main application and the IDE).
    *   **Properties**:
        *   `title: string`: The display text for the navigation link.
        *   `href: string`: The URL path for the navigation link.
        *   `icon: string`: A string identifier for a Lucide icon (e.g., "LayoutDashboard"). The actual icon component is resolved dynamically.
        *   `label?: string`: Optional text for accessibility labels or tooltips.
        *   `disabled?: boolean`: Optional flag to disable the navigation item.
        *   `external?: boolean`: Optional flag to indicate if the link is to an external site.
    *   **Usage**: Used in `src/config/site.ts` and `src/config/ide.ts` to define navigation structures.

*   **`SensorDataPoint`**:
    *   **Purpose**: Represents a single data point from a sensor at a specific time.
    *   **Properties**:
        *   `time: string`: The timestamp of the reading, typically an ISO string or a formatted date string.
        *   `value: number`: The numerical value of the sensor reading.
    *   **Usage**: Used within `TimeseriesData` to represent individual points in a sensor data series.

*   **`TimeseriesData`**:
    *   **Purpose**: Defines the structure for a complete timeseries dataset for a particular sensor or metric.
    *   **Properties**:
        *   `name: string`: The name or identifier of the sensor or metric (e.g., "temperature_zone_a", "energy_consumption").
        *   `data: SensorDataPoint[]`: An array of `SensorDataPoint` objects representing the actual timeseries values.
        *   `color?: string`: Optional property to specify a color for this series when displayed in charts (e.g., Plotly.js).
    *   **Usage**: Used for passing sensor data to charting components and for data manipulation in preprocessing scripts.

*   **`KpiCardProps`**:
    *   **Purpose**: Defines the properties for the `KpiCard` component (`src/components/kpi-card.tsx`).
    *   **Properties**:
        *   `title: string`: The title of the Key Performance Indicator.
        *   `value: string`: The main value to be displayed (formatted as a string).
        *   `unit?: string`: Optional unit for the value (e.g., "kWh", "%").
        *   `icon: ElementType`: The React component type for the icon to be displayed (e.g., a Lucide icon component).
        *   `description?: string`: Optional descriptive text below the main value.
        *   `trend?: 'up' | 'down' | 'neutral'`: Optional indicator of the trend direction.
        *   `trendValue?: string`: Optional string representing the magnitude of the trend (e.g., "5%", "2 pts").
    *   **Usage**: Used by the `KpiCard` component to render performance indicators on dashboards.

*   **`ChatMessage`**:
    *   **Purpose**: Defines the structure for a message within the IDE's chat feature.
    *   **Properties**:
        *   `id: string`: A unique identifier for the message.
        *   `user: string`: The username or identifier of the sender.
        *   `text: string`: The content of the chat message.
        *   `time: string`: The timestamp of when the message was sent (ISO string or formatted time).
        *   `isLocalUser?: boolean`: Optional flag to differentiate messages sent by the current user, primarily for UI styling.
    *   **Usage**: Used in `src/app/ide/(ide-app)/monitoring/page.tsx` to manage and display chat messages.

## Adding New Types

When introducing new shared data structures:
1.  Define the interface or type alias in `src/types/index.ts`.
2.  Use clear and descriptive names for types and their properties.
3.  Provide JSDoc comments if the type or its properties are not self-explanatory.
4.  Import types where needed using:
    ```typescript
    import type { MyNewType } from '@/types';
    ```
    Using `import type` ensures that the import is only used for type checking and is erased at runtime, which can be a good practice for type-only imports.
```