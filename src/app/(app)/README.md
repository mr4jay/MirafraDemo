# HVAC Optimizer Application Pages

This directory contains the core pages for the HVAC Optimizer application. For Data Analytics Engineers, these pages serve as critical interfaces for monitoring system behavior, visualizing data produced by their algorithms, validating algorithm performance, and configuring control strategies.

## Overview

The pages within this section provide users, including Data Analytics Engineers, with tools to:
-   Visualize real-time and historical sensor data, crucial for understanding system dynamics and algorithm inputs.
-   Monitor the output and decisions of various control algorithms (heuristic, optimization, AI/ML) developed by engineers.
-   Configure HVAC system parameters and select/parameterize control algorithms, allowing engineers to test different strategies.
-   View overall system performance through a central dashboard, enabling assessment of algorithm effectiveness in terms of energy savings, cost, and comfort.

## Key Pages for Data Analytics Engineers

*   **`/dashboard`**:
    *   **Purpose**: Provides a high-level overview of the HVAC system's operational status and the impact of control algorithms.
    *   **Relevance for Engineers**:
        *   **KPI Monitoring**: Track Key Performance Indicators (KPIs) like energy consumption, cost savings, and comfort scores. These KPIs directly reflect the performance of the implemented control algorithms.
        *   **Real-time Data Overview**: View aggregated real-time charts for temperature, occupancy, and energy usage. Useful for quick checks on system state and algorithm response.
        *   **Baseline Comparison**: (Conceptually) Compare current performance against baselines or simulated results of different algorithm versions.
    *   **Technology**: React, Plotly.js for charts, ShadCN UI components.

*   **`/sensor-data`**:
    *   **Purpose**: Allows detailed timeseries analysis of individual sensor data streams. This is a fundamental tool for Data Analytics Engineers.
    *   **Relevance for Engineers**:
        *   **Data Exploration**: Deep dive into raw and processed sensor data (temperature, occupancy, energy) to understand patterns, anomalies, and correlations relevant for algorithm design and tuning.
        *   **Input Validation**: Verify the quality and characteristics of data being fed into control algorithms.
        *   **Preprocessing Impact Assessment**: (Conceptually) Compare data before and after preprocessing steps applied by backend Python scripts.
        *   **Visualization**: Interactive line plots (Plotly.js) for trend analysis, gauge widgets for current values.
        *   **Statistical Summaries**: Compute and view mean, min, max, std dev for selected data, aiding in feature engineering.
    *   **Technology**: React, Plotly.js, ShadCN UI components. Data is fetched client-side, simulating retrieval from backend data stores (S3/DynamoDB via Lambda).

*   **`/algorithm-output`**:
    *   **Purpose**: Presents the decisions and actions taken by the selected HVAC control algorithms developed by engineers. This page is crucial for debugging and validating algorithm logic.
    *   **Relevance for Engineers**:
        *   **Action Log**: Review a detailed log of recent algorithm decisions (e.g., "Heuristic Algo: Reduce cooling in Zone A to 22°C due to low occupancy").
        *   **Decision Flow Visualization (Heuristic)**: (Conceptual) Use a Vis.js-like tool to trace the execution path of heuristic rules, helping debug complex rule sets.
        *   **Optimization Trade-offs**: For optimization algorithms (e.g., PuLP-based), visualize trade-off plots (e.g., cost vs. comfort scatter plot) to understand Pareto frontiers.
        *   **AI/ML Insights**: For AI/ML models (e.g., TensorFlow/Keras LSTMs deployed on SageMaker), display feature importance, prediction confidence, or actual vs. predicted values.
        *   **Manual Override**: Test system response by manually overriding algorithm decisions for specific zones or parameters.
    *   **Technology**: React, ShadCN UI components. Visualizations are conceptual placeholders (Plotly.js, Vis.js).

*   **`/configure`**:
    *   **Purpose**: Enables users, including Data Analytics Engineers, to dynamically configure the HVAC control system, select algorithms, and adjust their parameters.
    *   **Relevance for Engineers**:
        *   **Algorithm Selection**: Switch between different deployed algorithms (heuristic, optimization, AI/ML) to compare their performance in real-world or simulated scenarios.
        *   **Parameter Tuning**: Adjust key parameters for selected algorithms (e.g., cost vs. comfort weighting for optimization, temperature thresholds for heuristics, hyperparameters for AI/ML models via backend integration).
        *   **Scenario Testing**: Use this page to set up different operational scenarios for testing algorithm robustness and effectiveness.
        *   **GenAI Configuration**: (Conceptually) Interface with Genkit flows to generate initial configurations based on high-level inputs.
    *   **Technology**: React, React Hook Form, Zod (for validation), ShadCN UI components. Form submissions use Server Actions, conceptually triggering backend updates to algorithm configurations (e.g., updating JSON in S3, re-deploying Lambda with new settings).

## Layout and Workflow

All pages in this section share a common layout (`src/app/(app)/layout.tsx`). For Data Analytics Engineers, the workflow often involves:
1.  **Understanding System State**: Using `/dashboard` and `/sensor-data` to analyze current and historical HVAC performance.
2.  **Developing/Refining Algorithms**: Done within the `/ide` (see `src/app/ide/(ide-app)/README.md`).
3.  **Deploying & Configuring**: Using `/configure` to select the newly deployed/updated algorithm or adjust its parameters.
4.  **Monitoring & Validation**: Observing algorithm behavior and its impact on KPIs through `/algorithm-output` and `/dashboard`.
5.  **Iteration**: Based on observations, return to the IDE to refine algorithms or data pipelines.

## State Management and Data Fetching

Client-side state is managed with React hooks. Data is primarily fetched client-side from mock sources or would simulate calls to a backend API (e.g., Lambda functions querying S3/DynamoDB). Server Actions handle form submissions for configuration changes.
```