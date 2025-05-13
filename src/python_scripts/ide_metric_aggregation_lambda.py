import boto3
import json
import os
from datetime import datetime, timedelta

# --- AWS Client Initialization (Conceptual - credentials managed by Lambda execution role) ---
# cloudwatch_client = boto3.client('cloudwatch')
# s3_client = boto3.client('s3') # For storing aggregated metrics

# --- Configuration ---
# These would typically be passed as environment variables
METRICS_S3_BUCKET = os.environ.get('METRICS_S3_BUCKET', 'hvac-ide-monitoring-metrics')
METRICS_NAMESPACE_LAMBDA = 'AWS/Lambda'
METRICS_NAMESPACE_SAGEMAKER = 'AWS/SageMaker'
METRICS_NAMESPACE_ATHENA = 'AWS/Athena' # Custom if pushing Athena metrics

# List of Lambda functions to monitor
LAMBDA_FUNCTIONS_TO_MONITOR = [
    'preprocess-hvac-data',
    'control-algo-heuristic',
    'control-algo-optimization',
    'invoke-sagemaker-endpoint-ml',
    'athena-query-runner'
]
# List of SageMaker endpoints
SAGEMAKER_ENDPOINTS_TO_MONITOR = [
    'hvac-lstm-control-endpoint-prod',
    'hvac-energy-prediction-endpoint-v2'
]

def get_lambda_metrics(function_name, start_time, end_time, period_seconds=300):
    """
    Fetches key metrics for a specific Lambda function from CloudWatch.
    Metrics: Invocations, Errors, Duration (Average, p90, Max), ConcurrentExecutions.
    """
    print(f"Fetching CloudWatch metrics for Lambda: {function_name} from {start_time} to {end_time}")
    # response = cloudwatch_client.get_metric_data(
    #     MetricDataQueries=[
    #         {'Id': 'invocations', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_LAMBDA, 'MetricName': 'Invocations', 'Dimensions': [{'Name': 'FunctionName', 'Value': function_name}]}, 'Period': period_seconds, 'Stat': 'Sum'}, 'ReturnData': True},
    #         {'Id': 'errors', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_LAMBDA, 'MetricName': 'Errors', 'Dimensions': [{'Name': 'FunctionName', 'Value': function_name}]}, 'Period': period_seconds, 'Stat': 'Sum'}, 'ReturnData': True},
    #         {'Id': 'duration_avg', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_LAMBDA, 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': function_name}]}, 'Period': period_seconds, 'Stat': 'Average'}, 'ReturnData': True},
    #         {'Id': 'duration_p90', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_LAMBDA, 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': function_name}]}, 'Period': period_seconds, 'Stat': 'p90'}, 'ReturnData': True},
    #         # Add more metrics like ConcurrentExecutions, Throttles if needed
    #     ],
    #     StartTime=start_time,
    #     EndTime=end_time,
    #     ScanBy='TimestampAscending'
    # )
    # # Process response:
    # metrics = {label_query['Id']: {'Timestamps': label_query['Timestamps'], 'Values': label_query['Values']} for label_query in response['MetricDataResults']}
    # return metrics

    # Mocked response for IDE simulation
    print(f"Simulating CloudWatch metric fetch for Lambda: {function_name}")
    timestamps = [ (start_time + timedelta(minutes=i*5)).isoformat() for i in range(12) ]
    return {
        'invocations': {'Timestamps': timestamps, 'Values': [10 + i for i in range(12)]},
        'errors': {'Timestamps': timestamps, 'Values': [max(0, i % 3 -1) for i in range(12)]}, # some errors
        'duration_avg': {'Timestamps': timestamps, 'Values': [100 + i*10 for i in range(12)]},
        'duration_p90': {'Timestamps': timestamps, 'Values': [150 + i*12 for i in range(12)]},
    }

def get_sagemaker_endpoint_metrics(endpoint_name, variant_name='AllTraffic', start_time, end_time, period_seconds=300):
    """
    Fetches key metrics for a SageMaker endpoint from CloudWatch.
    Metrics: Invocations, ModelLatency, OverheadLatency, Errors (4xx, 5xx).
    """
    print(f"Fetching CloudWatch metrics for SageMaker Endpoint: {endpoint_name}, Variant: {variant_name}")
    # dimensions = [{'Name': 'EndpointName', 'Value': endpoint_name}, {'Name': 'VariantName', 'Value': variant_name}]
    # response = cloudwatch_client.get_metric_data(
    #     MetricDataQueries=[
    #         {'Id': 'invocations', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_SAGEMAKER, 'MetricName': 'Invocations', 'Dimensions': dimensions}, 'Period': period_seconds, 'Stat': 'Sum'}, 'ReturnData': True},
    #         {'Id': 'model_latency_p90', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_SAGEMAKER, 'MetricName': 'ModelLatency', 'Dimensions': dimensions}, 'Period': period_seconds, 'Stat': 'p90'}, 'ReturnData': True},
    #         {'Id': 'overhead_latency_p50', 'MetricStat': {'Metric': {'Namespace': METRICS_NAMESPACE_SAGEMAKER, 'MetricName': 'OverheadLatency', 'Dimensions': dimensions}, 'Period': period_seconds, 'Stat': 'p50'}, 'ReturnData': True},
    #         # Add more metrics: Invocation4XXErrors, Invocation5XXErrors, CPUUtilization, MemoryUtilization etc.
    #     ],
    #     StartTime=start_time,
    #     EndTime=end_time
    # )
    # metrics = {label_query['Id']: {'Timestamps': label_query['Timestamps'], 'Values': label_query['Values']} for label_query in response['MetricDataResults']}
    # return metrics

    # Mocked response for IDE simulation
    print(f"Simulating CloudWatch metric fetch for SageMaker Endpoint: {endpoint_name}")
    timestamps = [ (start_time + timedelta(minutes=i*5)).isoformat() for i in range(12) ]
    return {
        'invocations': {'Timestamps': timestamps, 'Values': [50 + i*2 for i in range(12)]},
        'model_latency_p90': {'Timestamps': timestamps, 'Values': [80 + i*5 for i in range(12)]},
        'overhead_latency_p50': {'Timestamps': timestamps, 'Values': [10 + i for i in range(12)]},
    }

# Conceptual: Functions to get Athena query metrics (e.g., from CloudTrail logs or by parsing query history)
# Conceptual: Functions to get Data Pipeline metrics (e.g., S3 object counts, Lambda success rates for preprocessing)


def aggregate_and_store_metrics(start_time, end_time):
    """
    Aggregates metrics for all monitored resources and stores them.
    For IDE, this would be stored in a format easily consumable by the frontend (e.g., S3 JSON).
    """
    all_metrics_data = {
        "lambda_functions": {},
        "sagemaker_endpoints": {},
        "timestamp_range": { "start": start_time.isoformat(), "end": end_time.isoformat() }
    }

    for func_name in LAMBDA_FUNCTIONS_TO_MONITOR:
        try:
            all_metrics_data["lambda_functions"][func_name] = get_lambda_metrics(func_name, start_time, end_time)
        except Exception as e:
            print(f"Error fetching metrics for Lambda {func_name}: {e}")
            all_metrics_data["lambda_functions"][func_name] = {"error": str(e)}

    for endpoint_name in SAGEMAKER_ENDPOINTS_TO_MONITOR:
        try:
            all_metrics_data["sagemaker_endpoints"][endpoint_name] = get_sagemaker_endpoint_metrics(endpoint_name, start_time=start_time, end_time=end_time)
        except Exception as e:
            print(f"Error fetching metrics for SageMaker Endpoint {endpoint_name}: {e}")
            all_metrics_data["sagemaker_endpoints"][endpoint_name] = {"error": str(e)}

    # Store aggregated_data in S3
    # output_key = f"aggregated_metrics/{end_time.strftime('%Y/%m/%d/%H%M%S')}_metrics.json"
    # try:
    #     s3_client.put_object(
    #         Bucket=METRICS_S3_BUCKET,
    #         Key=output_key,
    #         Body=json.dumps(all_metrics_data, default=str), # Use default=str for datetime
    #         ContentType='application/json'
    #     )
    #     print(f"Successfully stored aggregated metrics in s3://{METRICS_S3_BUCKET}/{output_key}")
    # except Exception as e:
    #     print(f"Error storing metrics in S3: {e}")
    
    print("Simulated storing aggregated metrics.")
    return all_metrics_data


def lambda_handler(event, context):
    """
    AWS Lambda handler function.
    Triggered periodically (e.g., every 5 minutes by CloudWatch Events/EventBridge).
    - Fetches metrics from CloudWatch for various services.
    - Aggregates them.
    - Stores the aggregated metrics (e.g., in S3) for dashboard consumption.
    """
    print("Starting metrics aggregation Lambda function...")
    
    # Define time window for metrics (e.g., last 15 minutes or last hour)
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=1) # Example: Fetch last 1 hour of data

    try:
        aggregated_metrics = aggregate_and_store_metrics(start_time, end_time)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                "message": "Metrics aggregation successful.",
                "details": f"Aggregated metrics for period {start_time.isoformat()} to {end_time.isoformat()}",
                # "sample_data": aggregated_metrics # Optionally return some data for quick check
            }, default=str)
        }
    except Exception as e:
        print(f"Error during metrics aggregation: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({"error": f"An error occurred during metrics aggregation: {str(e)}"})
        }

# --- For local testing or IDE simulation ---
if __name__ == "__main__":
    print("--- Simulating Metrics Aggregation Lambda Execution ---")
    
    # Simulate a time range
    sim_end_time = datetime.utcnow()
    sim_start_time = sim_end_time - timedelta(hours=1)
    
    result_data = aggregate_and_store_metrics(sim_start_time, sim_end_time)
    
    print("\n--- Aggregated Metrics (Simulated Output) ---")
    # Pretty print a sample of the JSON output
    print(json.dumps({
        "lambda_sample": list(result_data["lambda_functions"].keys())[0] if result_data["lambda_functions"] else "N/A",
        "sagemaker_sample": list(result_data["sagemaker_endpoints"].keys())[0] if result_data["sagemaker_endpoints"] else "N/A",
        "time_range": result_data["timestamp_range"]
    }, indent=2, default=str))
    
    # To test the handler directly:
    # mock_lambda_event = {}
    # lambda_result = lambda_handler(mock_lambda_event, None)
    # print("\n--- Lambda Handler Result (Simulated) ---")
    # print(json.dumps(json.loads(lambda_result['body']), indent=2, default=str))
