# Python Scripts for HVAC Optimizer IDE

This directory contains Python script templates and utility modules designed to be used within the cloud-based IDE for the HVAC Optimizer project. These scripts are foundational for the Data Analytics Engineer, representing the backend logic that would typically run on AWS Lambda or SageMaker. They are used conceptually and as starting points within the IDE's workbench and data explorer features.

## Overview for Data Analytics Engineers

The Python scripts serve several key purposes directly aligned with the Data Analytics Engineer's responsibilities:
1.  **Data Preprocessing & Timeseries Analysis**: Templates for loading data from S3/DynamoDB, cleaning (handling missing values, outliers), transforming (resampling, feature engineering), normalizing timeseries data using `pandas` and `numpy`, and `scikit-learn`.
2.  **Control Algorithm Implementation**:
    *   **Heuristic/Domain-Expertise**: Templates for developing rule-based control logic.
    *   **Optimization/Predictive Control**: Templates for implementing optimization algorithms, particularly using linear programming with the `pulp` library to minimize cost or maximize comfort.
    *   **Data-Driven AI/ML**: Templates for developing AI/ML models (e.g., LSTMs for prediction using `tensorflow.keras`, or other `scikit-learn` models) for advanced control strategies.
3.  **AWS Service Interaction (boto3)**: Examples and templates for using `boto3` to interact with crucial AWS services like:
    *   S3: For reading raw data, writing processed data, storing model artifacts, and configurations.
    *   DynamoDB: For storing/retrieving real-time data, algorithm outputs, and parameters.
    *   Athena: For executing SQL queries against data in S3.
    *   Lambda: Scripts are designed to be deployable as Lambda functions for serverless execution of preprocessing tasks or algorithms.
    *   SageMaker: Conceptual templates for training ML models and invoking SageMaker endpoints.
4.  **Monitoring and Alerting Utilities**: Scripts that conceptually gather metrics from CloudWatch, parse logs, and could be used to trigger alerts via AWS SNS.

## Key Scripts and Their Relevance

*   **`athena_query_runner_template.py`**:
    *   **Purpose**: A template for a Lambda function that executes AWS Athena queries.
    *   **Engineer Workflow**: Used within the IDE's Data Explorer to run SQL queries against historical timeseries data stored in S3. Engineers can adapt this template to build custom data extraction and analysis pipelines.
    *   **Key Libraries**: `boto3`, `json`, `time`.

*   **`heuristic_control_template.py`**:
    *   **Purpose**: A template for implementing heuristic (rule-based) HVAC control algorithms in Python.
    *   **Engineer Workflow**: Engineers use this as a starting point in the Algorithm Development Workbench. They define rules (often in an external JSON loaded from S3) and implement the Python logic to evaluate sensor inputs against these rules.
    *   **Key Libraries**: `json`.

*   **`ide_lambda_monitoring_utils.py`**:
    *   **Purpose**: Provides utility functions for fetching monitoring data (CloudWatch metrics, logs) and publishing SNS alerts.
    *   **Engineer Workflow**: While primarily for backend system monitoring, engineers might adapt parts of this for custom monitoring of their algorithm's specific metrics or for creating custom alerts based on algorithm performance.
    *   **Key Libraries**: `boto3`, `datetime`, `json`.

*   **`ide_metric_aggregation_lambda.py`**:
    *   **Purpose**: A template for a Lambda function that periodically aggregates metrics from various AWS services.
    *   **Engineer Workflow**: Data displayed on the IDE's Monitoring dashboard would conceptually be sourced from such an aggregation pipeline. Engineers can understand how performance data is collected.
    *   **Key Libraries**: `boto3`, `json`, `datetime`.

*   **`ml_model_template.py`**:
    *   **Purpose**: A template for developing AI/ML-based HVAC control algorithms, particularly focusing on LSTM models with TensorFlow/Keras.
    *   **Engineer Workflow**: Used in the Algorithm Development Workbench. Engineers adapt this template for:
        *   Data loading and preprocessing for ML (creating sequences, scaling features).
        *   Defining model architectures (`tensorflow.keras.Sequential`, `LSTM`, `Dense` layers).
        *   Conceptual integration with AWS SageMaker for training and endpoint deployment/invocation.
    *   **Key Libraries**: `numpy`, `pandas`, (conceptual `tensorflow`, `sklearn`, `boto3`).

*   **`optimization_control_template.py`**:
    *   **Purpose**: A template for implementing optimization-based HVAC control algorithms using linear programming with the PuLP library.
    *   **Engineer Workflow**: Used in the Algorithm Development Workbench. Engineers define:
        *   **Objective Function**: e.g., minimizing `cost_weight * total_energy_cost + comfort_deviation_weight * total_comfort_deviation`.
        *   **Decision Variables**: e.g., `energy_kwh_hour_t`.
        *   **Constraints**: e.g., temperature bounds, HVAC capacity.
        The script then solves the LP problem.
    *   **Key Libraries**: `pulp`.

*   **`s3_data_processor_template.py`**:
    *   **Purpose**: A template for a Lambda function designed to preprocess timeseries data arriving in an S3 bucket.
    *   **Engineer Workflow**: This is a core script for the Data Explorer. Engineers can customize this template to build robust data ingestion and preprocessing pipelines. Steps include loading data (JSON, CSV), timestamp handling, missing value imputation (`df.interpolate`), outlier removal, duplicate handling, rolling average calculation (`df.rolling().mean()`), and normalization (`MinMaxScaler`). Processed data can then be stored back to S3 or DynamoDB.
    *   **Key Libraries**: `boto3`, `pandas`, `numpy`, `sklearn.preprocessing.MinMaxScaler`, `io.StringIO`.

## Usage in IDE and Version Control (Git)

*   **Templates**: These scripts are loaded into the IDE's code editors, providing a validated starting point for algorithm development and data pipeline construction.
*   **Conceptual Backend Logic**: They illustrate the Python code that would run in AWS Lambda or SageMaker, driven by IDE actions.
*   **Local Testing**: Most scripts include `if __name__ == "__main__":` blocks with mock data, allowing engineers to test logic within the IDE's Python environment before deploying to AWS.
*   **Git Workflow**:
    *   Engineers clone the repository containing these scripts into their IDE environment.
    *   They create feature branches for new algorithms or data pipelines (e.g., `git checkout -b feature/advanced-occupancy-heuristic`).
    *   Modified or new Python scripts are committed regularly (`git add <script_name>.py`, `git commit -m "feat: implement new temperature prediction model"`).
    *   Pull requests are used for code review before merging into `develop` or `main` branches.
    *   Configuration files related to these scripts (e.g., JSON rules for heuristics, hyperparameters for ML) are also version-controlled.

By providing these well-structured Python templates and integrating them with AWS services, the IDE empowers Data Analytics Engineers to efficiently develop, test, and deploy sophisticated solutions for HVAC optimization.
```