# HVAC Optimizer Application Pages

This directory contains the core pages for the HVAC Optimizer application, focusing on monitoring and controlling HVAC systems.

## Overview

The pages within this section provide users with tools to:
-   Visualize sensor data from HVAC systems.
-   Monitor the output and decisions of various control algorithms.
-   Configure HVAC system parameters and algorithm preferences.
-   View overall system performance through a central dashboard.

## Key Pages

*   **`/dashboard`**:
    *   **Purpose**: Displays key performance indicators (KPIs) such as energy consumption, cost savings, and comfort scores. Provides a high-level overview of the HVAC system's operational status.
    *   **Features**: KPI cards, real-time charts for temperature, occupancy, and energy usage (using Plotly.js), time range selectors, and data export capabilities.
    *   **Technology**: React, Plotly.js, ShadCN UI components.

*   **`/sensor-data`**:
    *   **Purpose**: Allows users to perform detailed timeseries analysis of individual sensor data streams (e.g., temperature, occupancy, energy usage).
    *   **Features**: Interactive line plots (Plotly.js) for sensor trends, gauge widgets for real-time values, statistical summaries (mean, min, max, std dev), data filters (sensor type, time range), and CSV export.
    *   **Technology**: React, Plotly.js, ShadCN UI components.

*   **`/algorithm-output`**:
    *   **Purpose**: Presents the decisions and actions taken by the selected HVAC control algorithms (heuristic, optimization, or AI/ML).
    *   **Features**: An action log displaying recent algorithm decisions, visualization of heuristic rule flows (conceptual, e.g., using Vis.js), plots for optimization trade-offs (e.g., cost vs. comfort), and insights from ML models (e.g., feature importance). Includes a manual override feature.
    *   **Technology**: React, ShadCN UI components, (conceptual Vis.js/Plotly.js for specific visualizations).

*   **`/configure`**:
    *   **Purpose**: Enables users to dynamically configure the HVAC control system, select algorithms, and adjust their parameters.
    *   **Features**: Forms for selecting algorithm type (heuristic, optimization, AI/ML), sliders for cost vs. comfort weighting, input fields for additional JSON-based parameters, and status updates on configuration application.
    *   **Technology**: React, React Hook Form, Zod (for validation), ShadCN UI components.

## Layout

All pages in this section share a common layout (`src/app/(app)/layout.tsx`) which includes:
-   A collapsible sidebar for navigation.
-   An application header.
-   User profile and logout actions.

The navigation items are defined in `src/config/site.ts`.

## State Management

Client-side state management for individual pages is typically handled using React's `useState` and `useEffect` hooks. For more complex global state, consider libraries like Zustand or Redux if the need arises.

## Data Fetching

Data fetching is primarily client-side, simulating interactions with a backend. In a production scenario, this would involve API calls to a backend service (e.g., built with AWS Lambda and API Gateway) to retrieve data from S3, DynamoDB, or other data sources. Server Actions are used for form submissions where appropriate.
```