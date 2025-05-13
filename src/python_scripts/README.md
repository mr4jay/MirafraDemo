# Python Scripts for HVAC Optimizer IDE

This directory contains Python script templates and utility modules designed to be used within the cloud-based IDE for the HVAC Optimizer project. These scripts represent the backend logic that would typically run on AWS Lambda or SageMaker, and are used conceptually within the IDE's workbench and data explorer features.

## Overview

The Python scripts serve several key purposes:
1.  **Data Preprocessing**: Templates for loading, cleaning, transforming, and normalizing timeseries data from S3.
2.  **Algorithm Implementation**: Templates for heuristic, optimization (using PuLP), and AI/ML (using TensorFlow/Keras) control algorithms.
3.  **AWS Service Interaction**: Examples of using `boto3` to interact with AWS services like S3, DynamoDB, Athena, Lambda, and SageMaker.
4.  **Monitoring and Alerting**: Utility scripts for fetching metrics, logs, and publishing alerts.

## Key Scripts

*   **`athena_query_runner_template.py`**:
    *   **Purpose**: A template for a Lambda function that executes AWS Athena queries.
    *   **Functionality**:
        *   Receives an SQL query string.
        *   Uses `boto3` to start an Athena query execution.
        *   Polls for query completion status.
        *   Retrieves and formats query results.
    *   **IDE Use**: The Data Explorer feature uses this conceptually to allow users to run SQL queries against data stored in S3.
    *   **Key Libraries**: `boto3`, `json`, `time`.

*   **`heuristic_control_template.py`**:
    *   **Purpose**: A template for implementing heuristic (rule-based) HVAC control algorithms.
    *   **Functionality**:
        *   Defines a function `heuristic_control_algorithm` that takes sensor inputs and a rules configuration (JSON).
        *   Evaluates conditions based on sensor readings and applies corresponding actions.
        *   Includes an example `if __name__ == "__main__":` block for local testing.
    *   **IDE Use**: The Algorithm Development Workbench uses this template when a user selects "Heuristic Algo".
    *   **Key Libraries**: `json`.

*   **`ide_lambda_monitoring_utils.py`**:
    *   **Purpose**: Provides utility functions for fetching monitoring data relevant to the IDE's monitoring dashboard.
    *   **Functionality**:
        *   `format_cloudwatch_metrics_for_dashboard`: Formats CloudWatch `get_metric_data` responses.
        *   `get_recent_cloudwatch_logs`: Fetches recent logs from a CloudWatch Log Group.
        *   `create_sns_alert`: Publishes an alert message to an AWS SNS topic.
    *   **IDE Use**: The Monitoring page conceptually uses these utilities to display metrics and logs.
    *   **Key Libraries**: `boto3`, `datetime`, `json`.

*   **`ide_metric_aggregation_lambda.py`**:
    *   **Purpose**: A template for a Lambda function that periodically aggregates metrics from various AWS services (Lambda, SageMaker).
    *   **Functionality**:
        *   Fetches metrics using `boto3` and CloudWatch APIs.
        *   Aggregates data into a structured format (e.g., JSON).
        *   Conceptually stores aggregated metrics in S3 for dashboard consumption.
    *   **IDE Use**: The Monitoring dashboard would display data sourced from the output of this aggregation Lambda.
    *   **Key Libraries**: `boto3`, `json`, `datetime`.

*   **`ml_model_template.py`**:
    *   **Purpose**: A template for developing AI/ML-based HVAC control algorithms, particularly focusing on LSTM models with TensorFlow/Keras.
    *   **Functionality**:
        *   `load_and_preprocess_data`: Loads data (conceptually from S3), handles missing values, scales features, and creates sequences for time-series prediction.
        *   `build_lstm_hvac_model`: Defines a simple LSTM model architecture.
        *   `train_hvac_model_sagemaker`: Conceptual function to launch an AWS SageMaker training job.
        *   `predict_hvac_control_sagemaker_endpoint`: Conceptual function to invoke a deployed SageMaker endpoint.
    *   **IDE Use**: The Algorithm Development Workbench uses this template for "AI/ML Model" development.
    *   **Key Libraries**: `numpy`, `pandas`, (conceptual `tensorflow`, `sklearn`, `boto3`).

*   **`optimization_control_template.py`**:
    *   **Purpose**: A template for implementing optimization-based HVAC control algorithms using linear programming with the PuLP library.
    *   **Functionality**:
        *   Defines `optimize_hvac_control_schedule` to set up and solve an optimization problem.
        *   Minimizes a weighted sum of energy cost and comfort deviation.
        *   Defines decision variables (energy usage), state variables (temperature), and constraints.
    *   **IDE Use**: The Algorithm Development Workbench uses this template for "Optimization Algo".
    *   **Key Libraries**: `pulp`.

*   **`s3_data_processor_template.py`**:
    *   **Purpose**: A template for a Lambda function designed to preprocess timeseries data arriving in an S3 bucket.
    *   **Functionality**:
        *   Triggered by S3 events.
        *   Loads data (JSON, CSV, conceptual Parquet) from S3.
        *   Applies preprocessing steps: timestamp conversion, missing value interpolation, duplicate removal, outlier removal, rolling average calculation, normalization.
        *   Conceptually saves processed data to another S3 location or DynamoDB.
    *   **IDE Use**: The Data Explorer feature conceptually relies on such a pipeline for providing processed data.
    *   **Key Libraries**: `boto3`, `pandas`, `numpy`, `sklearn.preprocessing.MinMaxScaler`, `io.StringIO`.

## Usage in IDE

These scripts are primarily intended as:
1.  **Templates**: To be loaded into the IDE's code editors, providing a starting point for users.
2.  **Conceptual Backend Logic**: They illustrate the Python code that would run in the AWS backend (Lambda, SageMaker) to support the IDE's functionalities. The IDE simulates the execution and results of these scripts.

## Local Testing

Most scripts include an `if __name__ == "__main__":` block with mock data or event structures. This allows for:
-   Basic local execution in a Python environment (like the one in Cloud9).
-   Understanding the script's expected inputs and outputs.
-   Unit testing parts of the logic.

For actual interaction with AWS services, appropriate AWS credentials and configurations (e.g., via `aws configure` or IAM roles for Lambda/SageMaker) would be necessary.
```