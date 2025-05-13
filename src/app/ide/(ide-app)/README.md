# Cloud IDE Application Pages

This directory contains the pages for the cloud-based Integrated Development Environment (IDE) specifically designed for Data Analytics Engineers working on the HVAC Optimizer project. The IDE is the primary tool for engineers to architect solutions, capture requirements, design, develop, test, and monitor timeseries analytics and control algorithms.

## Overview for Data Analytics Engineers

The IDE provides a comprehensive suite of tools to support the engineer's workflow, from data ingestion and preprocessing to algorithm deployment and performance analysis. It emphasizes Python proficiency, deep integration with AWS services (S3, DynamoDB, Athena, Lambda, SageMaker), and robust version control using Git.

## Key IDE Pages and Engineer Workflow

The Data Analytics Engineer will typically navigate these sections:

*   **`/data-explorer` (Timeseries Data Integration & Preprocessing)**:
    *   **Purpose**: The starting point for understanding and preparing data. Engineers connect to various AWS data sources, explore raw timeseries data, write and execute Python preprocessing scripts, and visualize datasets to inform algorithm design.
    *   **Core Activities for Engineers**:
        *   **Data Source Connection & Browsing**:
            *   Connect to AWS S3 buckets (e.g., `s3://hvac-data/raw/`) to access raw sensor data (JSON, CSV, Parquet).
            *   Browse AWS DynamoDB tables (e.g., `SensorDataProcessed`) for real-time or recently processed data.
            *   View data schemas and sample records.
        *   **Python-based Preprocessing**:
            *   Utilize an integrated Python code editor (with pandas, NumPy, scikit-learn support) to write custom scripts for:
                *   **Cleaning**: Handling missing values (interpolation, fill), identifying and removing outliers (e.g., using 3-sigma rule).
                *   **Transformation**: Resampling data (e.g., from 1-minute to 5-minute intervals), feature engineering (e.g., creating lag features).
                *   **Aggregation**: Computing rolling averages, sums, or other window functions.
                *   **Normalization/Scaling**: Applying techniques like MinMaxScaler or StandardScaler.
            *   Execute preprocessing scripts conceptually via AWS Lambda, with outputs potentially stored back to S3 (e.g., `s3://hvac-data/processed/`) or DynamoDB.
        *   **Timeseries Visualization (Plotly.js)**:
            *   Generate interactive line plots, scatter plots, histograms, and heatmaps to analyze data distributions, trends, and correlations.
            *   Customize plots with labels, titles, and annotations.
        *   **AWS Athena Querying**:
            *   Write and execute SQL queries via an integrated Athena interface to analyze large historical datasets stored in S3.
            *   View query results in tabular format and visualize them.
            *   Example Query:
                ```sql
                SELECT sensor_id, DATE_TRUNC('hour', timestamp) AS hour, AVG(value) AS avg_temp
                FROM hvac_optimizer_db.sensor_timeseries_data
                WHERE type = 'temperature' AND date_parse(timestamp, '%Y-%m-%dT%H:%i:%SZ') >= date_add('day', -7, NOW())
                GROUP BY 1, 2
                ORDER BY 2 DESC, 1;
                ```
        *   **Statistical Summaries**: Calculate and display descriptive statistics (mean, median, min, max, std dev, quantiles) for selected datasets.
        *   **Version Control (Git)**: Commit preprocessing scripts and noteworthy data exploration notebooks/queries to the Git repository (e.g., `feature/data-cleaning-pipeline`).
    *   **Technology**: React, Plotly.js, ShadCN UI components. Backend interactions (Python script execution, Athena queries) are simulated but designed to mirror AWS Lambda and SDK (boto3) calls.

*   **`/workbench` (Algorithm Development & Testing)**:
    *   **Purpose**: The primary environment for designing, developing, testing, and preparing control algorithms (heuristic, optimization, AI/ML) for deployment.
    *   **Core Activities for Engineers**:
        *   **Python Code Editor**:
            *   Full-featured editor with syntax highlighting for Python, autocompletion for relevant libraries (pandas, numpy, `pulp`, `tensorflow`, `scikit-learn`, `boto3`), linting, and conceptual debugging capabilities.
            *   Multiple tabs for managing different algorithm files.
        *   **Algorithm Templates**:
            *   **Heuristic**: Start with Python templates for rule-based logic, often loading rules from JSON configurations.
            *   **Optimization**: Utilize templates for `pulp` (or other solvers) to define objective functions, decision variables, and constraints for linear/mixed-integer programming.
                ```python
                # Example PuLP snippet
                from pulp import LpProblem, LpVariable, lpSum, LpMinimize
                prob = LpProblem("HVAC_Cost_Min", LpMinimize)
                hours = range(24)
                energy_vars = LpVariable.dicts("energy", hours, lowBound=0, cat='Continuous')
                # ... define objective (cost) and constraints (comfort, capacity) ...
                ```
            *   **AI/ML**: Work with templates for `tensorflow.keras` or `scikit-learn` to build predictive models (e.g., LSTMs for energy forecasting, classifiers for anomaly detection). Includes conceptual steps for data loading, preprocessing (specific to ML), model building, and training.
        *   **Simulation & Testing**:
            *   Run algorithms against simulated sensor data or historical datasets loaded in the Data Explorer.
            *   (Conceptual) Pytest integration for writing and executing unit tests for algorithm logic.
            *   Visualize algorithm outputs directly (e.g., decision paths for heuristics, objective function values for optimization, prediction accuracy for ML).
        *   **AWS Execution Environment**:
            *   Algorithms are designed to be packaged and deployed to AWS Lambda (for heuristics, simpler optimization) or AWS SageMaker (for ML model training and hosting).
            *   The workbench simulates this execution environment, allowing testing of `boto3` calls to interact with S3 (for model artifacts, data), DynamoDB (for parameters, results), and SageMaker endpoints.
        *   **Version Control (Git)**: All algorithm code (`.py` files), test scripts, and related configuration files (e.g., rule JSONs) are version-controlled using Git. Engineers work on feature branches (e.g., `feature/lstm-energy-predictor`).
    *   **Technology**: React, ShadCN UI components, Python script templates.

*   **`/config-manager` (Algorithm & AWS Resource Configuration)**:
    *   **Purpose**: Manage parameters for different algorithms and configurations for the AWS resources they depend on. This is crucial for requirements management and reproducibility.
    *   **Core Activities for Engineers**:
        *   **Algorithm Parameter Management**:
            *   Define and edit parameters for heuristic rules (e.g., temperature thresholds, occupancy counts).
            *   Set weights for optimization objectives (e.g., cost vs. comfort).
            *   Store hyperparameters for AI/ML models.
            *   Configurations are typically stored as JSON or YAML files in S3, versioned with Git.
        *   **AWS CloudFormation & IAM**:
            *   View and (conceptually) edit CloudFormation templates (`.yaml`/`.json`) used to provision AWS resources (Lambda functions, S3 buckets, DynamoDB tables, SageMaker endpoints, IAM roles).
            *   Manage IAM policies to ensure least-privilege access for algorithms and services.
        *   **Secrets Management**: Interface with AWS Secrets Manager (conceptually) for handling sensitive credentials (e.g., API keys for external weather services).
        *   **Deployment Settings**: Configure deployment parameters for Lambda (memory, timeout, environment variables) and SageMaker (instance types, scaling policies).
        *   **Version Control (Git)**: All configuration files (algorithm params, CloudFormation templates, IAM policy snippets) are version-controlled in Git. Changes follow a PR review process.
    *   **Technology**: React, ShadCN UI components, text/code editors for JSON/YAML.

*   **`/monitoring` (Performance Analysis & Collaboration)**:
    *   **Purpose**: Provide a dashboard to monitor the performance of deployed algorithms, data pipelines, and overall system health. Facilitates collaboration among engineers.
    *   **Core Activities for Engineers**:
        *   **Code Execution Metrics (Lambda, SageMaker)**:
            *   View CloudWatch metrics: invocations, error rates, duration/latency, memory/CPU utilization for Lambda functions and SageMaker endpoints.
            *   Visualize these metrics as timeseries plots (Plotly.js) to identify performance bottlenecks or degradation over time.
        *   **Data Analytics Pipeline Monitoring (Athena)**:
            *   Track Athena query performance: execution time, data scanned, cost.
            *   Monitor S3 data ingestion rates and Lambda preprocessing success/failure rates.
        *   **Algorithm Performance**:
            *   For AI/ML models: Display accuracy, precision, recall, F1-score, confusion matrices from batch evaluations or SageMaker Model Monitor.
            *   For optimization: Track objective function values achieved over time.
        *   **Log Aggregation & Analysis**:
            *   View aggregated logs from CloudWatch Logs for Lambda functions and other services.
            *   (Conceptual) Filter and search logs. Use Athena to query logs archived in S3 for deeper analysis.
        *   **Alerting (AWS SNS)**:
            *   View active alerts triggered by CloudWatch Alarms (e.g., high Lambda error rate, SageMaker endpoint latency exceeding thresholds).
        *   **Collaboration Hub**:
            *   **Team Chat**: Real-time chat using AWS API Gateway WebSockets for quick discussions and troubleshooting.
            *   **Git Workflow Information**: Display current branch, recent commits, and PR statuses relevant to the IDE workspace.
    *   **Technology**: React, Plotly.js, ShadCN UI components. Metrics are mock/simulated but designed to reflect actual CloudWatch data. Chat uses WebSockets.

## Layout and Workflow for Engineers

All IDE pages share a common layout (`src/app/ide/(ide-app)/layout.tsx`). The typical workflow for a Data Analytics Engineer:
1.  **Requirement Analysis**: Understand project needs, define control strategies.
2.  **Data Exploration (`/data-explorer`)**: Access data, preprocess, visualize, and run Athena queries. Commit scripts.
3.  **Algorithm Development (`/workbench`)**: Write Python code for heuristic, optimization, or AI/ML algorithms. Test locally/simulate. Commit code.
4.  **Configuration (`/config-manager`)**: Define algorithm parameters, set up AWS resource configurations. Commit configurations.
5.  **Deployment**: (Conceptual) Deploy algorithms to Lambda/SageMaker.
6.  **Monitoring (`/monitoring`)**: Track performance, analyze logs, view alerts. Collaborate with team via chat and Git.
7.  **Iteration**: Based on performance, refine algorithms, data pipelines, or configurations, cycling back through the relevant IDE sections.

## Key Concepts Simulated vs. Actual

*   **AWS Service Interaction**: UI mimics interactions. Actual backend calls would use `boto3` within Lambda functions or SageMaker scripts. Python script templates in `src/python_scripts/` guide this.
*   **Code Execution**: Python script execution (preprocessing, algorithms) is simulated in the frontend for rapid feedback. Actual execution occurs on AWS Lambda or SageMaker.
*   **Deployment**: Deployment to AWS is a conceptual UI feature; actual deployment would use AWS CLI, SDK, or CI/CD pipelines managed via the Config Manager.
```