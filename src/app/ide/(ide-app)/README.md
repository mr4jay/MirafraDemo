# Cloud IDE Application Pages

This directory contains the pages for the cloud-based Integrated Development Environment (IDE) tailored for Data Analytics Engineers working on the HVAC Optimizer project.

## Overview

The IDE provides a comprehensive suite of tools to:
-   Explore and preprocess timeseries data from various AWS sources.
-   Develop, test, and debug Python-based control algorithms (heuristic, optimization, AI/ML).
-   Manage AWS configurations for algorithms and infrastructure.
-   Monitor the performance of deployed algorithms and data pipelines.
-   Collaborate with team members using integrated tools.

## Key Pages

*   **`/data-explorer`**:
    *   **Purpose**: Enables users to connect to data sources (S3, DynamoDB), browse data, write and execute Python preprocessing scripts, and visualize timeseries data.
    *   **Features**: File browsers for S3 and DynamoDB (conceptual), data filters, an integrated Python code editor for preprocessing scripts (simulated execution), an output panel for logs, Plotly.js for timeseries visualization, statistical summaries, and an AWS Athena SQL query interface.
    *   **Technology**: React, Plotly.js, ShadCN UI components, mock Python script execution.

*   **`/workbench`**:
    *   **Purpose**: Provides a dedicated environment for developing, testing, and conceptually deploying HVAC control algorithms.
    *   **Features**: File browser for algorithm files (conceptual S3), algorithm templates (heuristic, optimization, AI/ML), an integrated Python code editor with tabs for different algorithm types, simulation controls, Pytest integration (conceptual), deployment options (conceptual to AWS Lambda/SageMaker), and panels for test outputs and visualizations (e.g., decision flows, ML model insights).
    *   **Technology**: React, ShadCN UI components, Python script templates.

*   **`/config-manager`**:
    *   **Purpose**: Allows users to manage algorithm parameters and AWS resource configurations (CloudFormation, IAM policies, Secrets Manager).
    *   **Features**: Tabs for different configuration types (algorithm params as JSON, CloudFormation as YAML, IAM settings, Secrets), integrated code/text editors for viewing and modifying configurations, conceptual save and deploy actions.
    *   **Technology**: React, ShadCN UI components.

*   **`/monitoring`**:
    *   **Purpose**: Offers a dashboard to monitor the performance of code execution (e.g., Lambda functions), data analytics pipelines (e.g., Athena queries), SageMaker endpoints, and overall system health.
    *   **Features**: Time range selection, refresh capabilities, visualizations of Lambda metrics (invocations, errors, duration), Athena query analytics (runtime, data scanned), SageMaker endpoint performance (latency, invocations), data pipeline throughput, aggregated system logs, active system alerts (conceptual SNS integration), and a collaboration hub with team chat (WebSocket based) and Git workflow information.
    *   **Technology**: React, Plotly.js, ShadCN UI components, mock metrics, WebSocket for chat.

## Layout

All IDE pages share a common layout (`src/app/ide/(ide-app)/layout.tsx`) which includes:
-   A collapsible sidebar specifically for IDE navigation.
-   An IDE-specific header.
-   User profile, IDE settings, and exit actions.

The navigation items for the IDE are defined in `src/config/ide.ts`.

## Key Concepts Simulated

*   **AWS Service Interaction**: While the UI mimics interaction with services like S3, DynamoDB, Lambda, Athena, and SageMaker, the actual backend calls are mostly conceptual or simulated for this front-end focused implementation. Python script templates (`src/python_scripts/`) provide an idea of how these interactions would occur.
*   **Code Execution**: Python script execution (preprocessing, algorithms) is simulated. In a real IDE, this would involve a backend execution engine.
*   **Deployment**: Deploying to AWS Lambda or SageMaker is a conceptual feature within the UI.
*   **Real-time Collaboration**: The chat feature uses WebSockets, but live code editing is a feature typically provided by platforms like AWS Cloud9, which this IDE conceptually emulates.

## Data Flow

Data exploration and algorithm development involve:
1.  Fetching raw data (conceptually from S3/DynamoDB).
2.  Writing and (simulated) running Python preprocessing scripts in the Data Explorer.
3.  Visualizing processed data.
4.  Developing algorithms in the Workbench using Python templates.
5.  (Simulated) testing and deploying algorithms.
6.  Configuring parameters and AWS resources in the Config Manager.
7.  Monitoring performance in the Monitoring dashboard.
```