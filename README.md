# HVAC Optimizer & Cloud IDE

This project is a Next.js application designed to optimize and monitor HVAC (Heating, Ventilation, and Air Conditioning) systems. It also includes an integrated cloud-based IDE tailored for Data Analytics Engineers to develop, test, and deploy timeseries analytics and control algorithms.

## Project Overview

The HVAC Optimizer aims to provide intelligent control over HVAC systems by leveraging real-time sensor data, advanced analytics, and various control algorithms (heuristic, optimization, AI/ML). The accompanying Cloud IDE empowers Data Analytics Engineers to architect solutions based on captured requirements, design and implement control algorithms, and manage the data lifecycle within an AWS-centric environment.

**Role of the Data Analytics Engineer:**

The Data Analytics Engineer plays a pivotal role in this project. Responsibilities include:
*   **Requirements Engineering:** Engaging with project teams and stakeholders to plan, set up, and execute requirements capture and management. This involves understanding business needs, defining technical specifications for data pipelines, analytics, and control strategies.
*   **Solution Architecture:** Designing and architecting data-driven solutions for HVAC optimization, leveraging timeseries analytics and AWS cloud services. This includes defining data flows, preprocessing pipelines, algorithm execution environments, and monitoring strategies.
*   **Algorithm Design & Development:** Designing, developing, testing, and deploying various control algorithms:
    *   **Heuristic/Domain-Expertise:** Creating rule-based systems based on HVAC domain knowledge.
    *   **Optimization/Predictive Control:** Implementing algorithms (e.g., linear programming with PuLP) to optimize for specific objectives like cost or comfort.
    *   **Data-Driven AI/ML:** Developing machine learning models (e.g., LSTMs with TensorFlow/Keras) for predictive control and anomaly detection.
*   **Python Proficiency:** Utilizing Python for algorithm development, data preprocessing (pandas, NumPy, scikit-learn), and interaction with AWS services (boto3).
*   **AWS Cloud Expertise:** Working extensively with AWS services, including S3 for data storage, Athena for data querying, Lambda for serverless compute (preprocessing, algorithm execution), SageMaker for ML model training and deployment, and CloudWatch for monitoring.
*   **Version Control:** Employing Git for version control of code, configurations, and documentation, following collaborative workflows (feature branching, pull requests).

The Cloud IDE is specifically designed to support these responsibilities by providing an integrated environment for data exploration, algorithm development, configuration management, and performance monitoring.

## Core Application Features (HVAC Optimizer)

1.  **Sensor Data Visualization**: Real-time and historical visualization of IoT sensor data (temperature, occupancy, energy usage).
2.  **Algorithm Output Display**: Transparent presentation of control algorithm decisions and HVAC actions.
3.  **Dynamic Configuration Engine**: User-driven selection and parameterization of control algorithms.
4.  **Performance Dashboard**: Key performance indicators (KPIs) for energy consumption, cost savings, and comfort levels.

## Core IDE Features (Cloud IDE for Data Analytics)

The IDE is the primary workbench for the Data Analytics Engineer, enabling them to:
1.  **Integrated Data Explorer**: Seamlessly access, explore, and preprocess timeseries data from AWS S3, DynamoDB, and Athena. Includes built-in Python scripting and visualization tools (Plotly.js) to support timeseries analysis.
2.  **Algorithm Development Workbench**: Develop, test, debug, and deploy Python-based control algorithms (heuristic, optimization with PuLP, AI/ML with TensorFlow/Keras). Facilitates interaction with AWS Lambda for execution and SageMaker for ML model management.
3.  **AWS Configuration Manager**: Manage algorithm parameters, AWS resource configurations (CloudFormation, IAM), and deployment settings, ensuring traceability through Git.
4.  **Real-Time Monitoring & Collaboration**: Monitor code execution metrics (Lambda, SageMaker), data analytics results (Athena), and AWS resource utilization. Includes real-time chat and Git integration for effective team collaboration.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI components, Plotly.js, Lucide Icons.
*   **Backend/Algorithm Execution**: Python, AWS Lambda (for heuristic, optimization, and some ML inference), AWS SageMaker (for ML model training and complex inference).
*   **AI/GenAI**: Genkit (for GenAI features like configuration generation).
*   **Data Stores**: AWS S3 (raw and processed timeseries data, model artifacts, configurations), AWS DynamoDB (real-time data, algorithm outputs, cached metrics).
*   **Analytics**: AWS Athena (for querying S3 data).
*   **Cloud IDE Base**: Conceptually based on AWS Cloud9 principles, implemented as a dedicated Next.js application section. The IDE leverages AWS SDK (boto3) for backend interactions.
*   **Version Control**: Git (GitHub integration described for collaborative workflows).
*   **Real-time Communication**: AWS API Gateway WebSockets (for IDE chat and real-time data updates).
*   **Alerting**: AWS SNS (for system and performance alerts).

## Getting Started

For Data Analytics Engineers, the typical workflow involves:
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This installs frontend dependencies. Python dependencies for algorithm development (pandas, numpy, pulp, tensorflow, boto3, etc.) are typically managed within the IDE's Python environment (conceptually similar to a virtual environment or a Cloud9 setup).

3.  **Set up environment variables:**
    Create a `.env.local` file. This file is crucial for configuring AWS SDK access and other service endpoints.
    ```env
    # AWS Credentials (configure an IAM user/role with appropriate permissions for S3, Lambda, Athena, DynamoDB, SageMaker, SNS, API Gateway)
    AWS_ACCESS_KEY_ID=your_access_key_id
    AWS_SECRET_ACCESS_KEY=your_secret_access_key
    AWS_REGION=your_aws_region

    # Genkit/Google AI API Key
    GOOGLE_API_KEY=your_google_ai_api_key

    # S3 Buckets
    S3_HVAC_DATA_BUCKET=your-hvac-data-bucket-name # For raw sensor data and processed data
    S3_ATHENA_RESULTS_BUCKET=your-athena-query-results-bucket-name # For Athena query outputs
    S3_MODEL_ARTIFACTS_BUCKET=your-ml-model-artifacts-bucket-name # For SageMaker model artifacts, algorithm configurations
    S3_LAMBDA_CODE_BUCKET=your-lambda-deployment-packages-bucket # For Lambda deployment packages

    # DynamoDB Tables
    DYNAMODB_SENSOR_DATA_TABLE=SensorData # For processed/real-time sensor data
    DYNAMODB_ALGORITHM_OUTPUTS_TABLE=AlgorithmOutputs # For logging algorithm decisions
    DYNAMODB_CONFIG_TABLE=HvacConfigurations # For storing dynamic configurations

    # Athena
    ATHENA_DATABASE=hvac_optimizer_db
    ATHENA_WORKGROUP=primary

    # SNS Topic ARN for Alerts
    SNS_ALERTS_TOPIC_ARN=arn:aws:sns:your-region:your-account-id:HvacIdeAlerts

    # API Gateway WebSocket URL for IDE Chat (if implemented and deployed)
    NEXT_PUBLIC_CHAT_WEBSOCKET_URL=wss://your-chat-api-gateway-endpoint.example.com/production
    ```
    **Note**: For local development and testing within the IDE, ensure the AWS credentials provide necessary permissions. The IDE environment should simulate the AWS execution environment as closely as possible.

4.  **Run the development server:**
    The application (including the IDE frontend) uses port 9002.
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) to access the HVAC Optimizer and its integrated IDE. Navigate to `/ide` to access the IDE features.

5.  **Run Genkit development server (for AI features):**
    Open a separate terminal:
    ```bash
    npm run genkit:dev
    ```

6.  **Engage with the IDE:**
    *   Use the **Data Explorer** to connect to S3/DynamoDB, write Python preprocessing scripts, and visualize data.
    *   Use the **Workbench** to develop Python-based control algorithms, test them with simulated data, and prepare for deployment to Lambda/SageMaker.
    *   Use the **Config Manager** to define algorithm parameters and manage related AWS resource configurations.
    *   Use the **Monitoring** dashboard to track algorithm performance and system health.
    *   Utilize **Git** for all code and configuration changes, adhering to the project's branching strategy (e.g., `feature/algorithm-X`, `fix/data-pipeline-bug`).

## Project Structure

*   `src/app/(app)`: Main HVAC Optimizer application pages.
*   `src/app/ide/(ide-app)`: IDE-specific pages designed for Data Analytics Engineers.
*   `src/ai`: Genkit AI flows and configuration.
*   `src/components`: UI components (ShadCN UI and custom components for both app and IDE).
*   `src/python_scripts`: Python script templates (heuristic, optimization, ML, data processing, AWS interaction) used within the IDE. These form the basis for algorithms run on Lambda or SageMaker.
*   `src/config`: Application and navigation configuration.
*   `src/hooks`: Custom React hooks.
*   `src/lib`: Utility functions.
*   `src/types`: TypeScript type definitions.

## Further Information

For more detailed information on specific sections relevant to the Data Analytics Engineer role, refer to the README files within:
*   `src/app/ide/(ide-app)/README.md`: Detailed breakdown of IDE features.
*   `src/python_scripts/README.md`: Overview of Python templates for algorithm development and AWS tasks.
*   `src/ai/README.md`: Information on using Genkit for AI-powered features.
```