# UI Components

This directory contains all the UI components used in the HVAC Optimizer application and its integrated IDE. The components are organized to promote reusability, maintainability, and a consistent user experience.

## Overview

The component strategy relies heavily on:
1.  **ShadCN UI**: A collection of beautifully designed components that are accessible and customizable. These components are typically found in the `src/components/ui` subdirectory after being added via the ShadCN CLI.
2.  **Custom Components**: Application-specific or IDE-specific components built by composing ShadCN UI components or from scratch when necessary. These are usually located directly within `src/components` or in feature-specific subdirectories if the project grows.

## Directory Structure

*   **`src/components/ui`**:
    *   **Purpose**: Houses the Radix UI-based components provided by ShadCN UI (e.g., `Button`, `Card`, `Input`, `Select`, `Sidebar`, `Dialog`, `Toast`).
    *   **Management**: Components in this directory are typically added or updated using the ShadCN CLI:
        ```bash
        npx shadcn-ui@latest add button card input
        ```
    *   **Customization**: While these are library components, their styling is controlled via Tailwind CSS and CSS variables defined in `src/app/globals.css`, allowing for theming.

*   **`src/components` (root of this directory)**:
    *   **Purpose**: Contains custom, application-specific components. For Data Analytics Engineers, relevant custom components include those that form the building blocks of the Cloud IDE, enabling them to interact with data, develop algorithms, and monitor performance.
    *   **Examples**:
        *   `app-logo.tsx`: The main application logo.
        *   `ide-logo.tsx`: The logo for the IDE section.
        *   `kpi-card.tsx`: A specialized card component for displaying Key Performance Indicators, useful in both the main app and the IDE's monitoring dashboard.
        *   `nav-menu.tsx`: Renders the navigation menu within the sidebars for both the app and IDE.
        *   `ide/code-editor-placeholder.tsx`: A placeholder component simulating a code editor within the IDE. Data Analytics Engineers use this for Python scripting.
        *   `ide/file-browser-placeholder.tsx`: A placeholder for browsing files/data sources (S3, DynamoDB) in the IDE.
        *   `ide/output-panel-placeholder.tsx`: A placeholder for displaying command outputs, logs, or algorithm results in the IDE.
        *   `ide/plotly-chart.tsx`: A wrapper component for integrating Plotly.js charts, crucial for timeseries data visualization by engineers.

## Component Design Principles

*   **Reusability**: Components should be designed to be reusable across different parts of the application where applicable.
*   **Encapsulation**: Components should encapsulate their own logic and styling as much as possible.
*   **Accessibility (a11y)**: Leverage ARIA attributes and semantic HTML. ShadCN UI components are generally good in this regard.
*   **Responsiveness**: Ensure components adapt well to different screen sizes. Tailwind CSS utility classes are primarily used for this.
*   **Props**:
    *   Use TypeScript interfaces for defining component props.
    *   Provide default props where sensible to make components easier to use.
*   **Styling**:
    *   Primarily use Tailwind CSS for styling.
    *   Adhere to the color palette and theme defined in `src/app/globals.css`. Avoid hardcoding colors directly in components; use Tailwind's theme-based classes (e.g., `bg-primary`, `text-foreground`).
*   **Single Root Element**: Each React component should return a single root JSX element. Fragments (`<>...</>`) can be used if no wrapper `div` is needed.
*   **Client vs. Server Components**:
    *   Default to Server Components for better performance.
    *   Use the `'use client';` directive only when client-side interactivity (hooks like `useState`, `useEffect`, event handlers) is necessary. Many IDE components will be client components due to their interactive nature.

## Using Components

Import components as needed:
```typescript
// Example from a page component
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/kpi-card';
// Example for IDE:
// import { CodeEditorPlaceholder } from '@/components/ide/code-editor-placeholder';

export default function MyPage() {
  return (
    <div>
      <KpiCard title="Energy Saved" value="150 kWh" icon={Zap} />
      <Button onClick={() => alert('Clicked!')}>Click Me</Button>
      {/* <CodeEditorPlaceholder title="My Python Script" language="python" /> */}
    </div>
  );
}
```

## Adding New Components

1.  **ShadCN UI Component**:
    *   Run `npx shadcn-ui@latest add <component-name>`.
    *   The component will be added to `src/components/ui`.
2.  **Custom Component**:
    *   Create a new `.tsx` file in `src/components` (or a relevant subdirectory like `src/components/ide`).
    *   Develop the component, adhering to the design principles.
    *   Export the component for use elsewhere.
```