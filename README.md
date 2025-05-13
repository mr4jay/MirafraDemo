# HVAC Optimizer & Cloud IDE

This project is a Next.js application designed to optimize and monitor HVAC (Heating, Ventilation, and Air Conditioning) systems. It also includes an integrated cloud-based IDE tailored for Data Analytics Engineers to develop, test, and deploy timeseries analytics and control algorithms.

## Project Overview

The HVAC Optimizer aims to provide intelligent control over HVAC systems by leveraging real-time sensor data, advanced analytics, and various control algorithms (heuristic, optimization, AI/ML). The accompanying Cloud IDE empowers engineers to build and refine these algorithms within a dedicated development environment.

## Core Application Features (HVAC Optimizer)

1.  **Sensor Data Visualization**: Real-time and historical visualization of IoT sensor data (temperature, occupancy, energy usage).
2.  **Algorithm Output Display**: Transparent presentation of control algorithm decisions and HVAC actions.
3.  **Dynamic Configuration Engine**: User-driven selection and parameterization of control algorithms.
4.  **Performance Dashboard**: Key performance indicators (KPIs) for energy consumption, cost savings, and comfort levels.

## Core IDE Features (Cloud IDE for Data Analytics)

1.  **Integrated Data Explorer**: Seamless access to timeseries data from AWS S3, DynamoDB, and Athena, with built-in preprocessing and visualization tools (Plotly.js).
2.  **Algorithm Development Workbench**: Python code editor (syntax highlighting, autocompletion, debugging) for heuristic, optimization (PuLP), and AI/ML (TensorFlow/Keras) algorithms.
3.  **AWS Configuration Manager**: Tools for managing algorithm parameters and AWS resources (CloudFormation, IAM, S3).
4.  **Real-Time Monitoring & Collaboration**: Dashboard for code execution metrics, data analytics results, and AWS resource utilization. Includes real-time chat and Git integration.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI components, Plotly.js, Lucide Icons.
*   **Backend/AI**: Genkit (for GenAI features), AWS Lambda (for algorithm execution and data processing).
*   **Data Stores**: AWS S3 (raw and processed data), AWS DynamoDB (real-time data, algorithm outputs).
*   **Analytics**: AWS Athena (for querying S3 data).
*   **Cloud IDE Base**: AWS Cloud9 (conceptual, UI implemented within Next.js).
*   **Version Control**: Git (GitHub integration described).
*   **Real-time Communication**: AWS API Gateway WebSockets (for IDE chat).
*   **Alerting**: AWS SNS.

## Getting Started

To get started with development:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    If you encounter issues with specific packages (e.g., `react-vis-network`), ensure compatible versions are listed in `package.json` or consider alternatives if deprecated.

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and populate it with necessary AWS credentials and configuration values. Example:
    ```env
    # AWS Credentials (configure an IAM user with appropriate permissions)
    AWS_ACCESS_KEY_ID=your_access_key_id
    AWS_SECRET_ACCESS_KEY=your_secret_access_key
    AWS_REGION=your_aws_region

    # Genkit/Google AI API Key
    GOOGLE_API_KEY=your_google_ai_api_key

    # S3 Buckets
    S3_HVAC_DATA_BUCKET=your-hvac-data-bucket-name
    S3_ATHENA_RESULTS_BUCKET=your-athena-query-results-bucket-name
    S3_MODEL_ARTIFACTS_BUCKET=your-ml-model-artifacts-bucket-name

    # DynamoDB Tables
    DYNAMODB_SENSOR_DATA_TABLE=SensorData
    DYNAMODB_ALGORITHM_OUTPUTS_TABLE=AlgorithmOutputs

    # Athena
    ATHENA_DATABASE=hvac_optimizer_db
    ATHENA_WORKGROUP=primary

    # SNS Topic ARN for Alerts
    SNS_ALERTS_TOPIC_ARN=arn:aws:sns:your-region:your-account-id:HvacIdeAlerts

    # API Gateway WebSocket URL for IDE Chat (if implemented and deployed)
    NEXT_PUBLIC_CHAT_WEBSOCKET_URL=wss://your-chat-api-gateway-endpoint.example.com/production
    ```
    **Note**: For local development without full AWS backend, some features might be mocked or limited.

4.  **Run the development server:**
    The application uses port 9002 for development.
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

5.  **Run Genkit development server (for AI features):**
    Open a separate terminal and run:
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit development server, typically on port 3400.

## Project Structure

*   `src/app/(app)`: Main application pages (Dashboard, Sensor Data, etc.).
*   `src/app/ide/(ide-app)`: IDE-specific pages (Data Explorer, Workbench, etc.).
*   `src/ai`: Genkit AI flows and configuration.
*   `src/components`: UI components (ShadCN UI and custom components).
*   `src/python_scripts`: Python script templates used within the IDE.
*   `src/config`: Application and navigation configuration.
*   `src/hooks`: Custom React hooks.
*   `src/lib`: Utility functions.
*   `src/types`: TypeScript type definitions.

## Further Information

For more detailed information on specific sections of the application, refer to the README files within the respective directories (e.g., `src/app/(app)/README.md`, `src/ai/README.md`).
```