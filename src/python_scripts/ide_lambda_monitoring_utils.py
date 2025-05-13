import boto3
from datetime import datetime, timedelta

# --- AWS Client Initialization (Conceptual) ---
# cloudwatch_client = boto3.client('cloudwatch')

# This script provides utility functions that might be used by other Lambdas
# or backend services for fetching, parsing, and processing monitoring data.

def format_cloudwatch_metrics_for_dashboard(metric_data_results, function_name_or_id="resource"):
    """
    Parses the response from CloudWatch get_metric_data and formats it
    into a more dashboard-friendly structure.

    :param metric_data_results: The 'MetricDataResults' list from get_metric_data response.
    :param function_name_or_id: Identifier for the resource being monitored.
    :return: A dictionary with metric names as keys and lists of (timestamp, value) tuples.
             Example: {
                 'Invocations': [('2023-01-01T10:00:00Z', 100.0), ...],
                 'Errors': [('2023-01-01T10:00:00Z', 5.0), ...]
             }
    """
    formatted_metrics = {}
    for result in metric_data_results:
        metric_id = result['Id'] # e.g., 'invocations', 'errors'
        timestamps = result.get('Timestamps', [])
        values = result.get('Values', [])
        
        # Sort by timestamp just in case they are not ordered
        sorted_points = sorted(zip(timestamps, values), key=lambda x: x[0])
        
        # Convert datetime objects to ISO strings if they are not already
        formatted_points = [(ts.isoformat() if isinstance(ts, datetime) else ts, val) for ts, val in sorted_points]
        
        formatted_metrics[metric_id] = formatted_points
        
    print(f"Formatted CloudWatch metrics for: {function_name_or_id}")
    return formatted_metrics


def get_recent_cloudwatch_logs(log_group_name, minutes_ago=60, filter_pattern="", limit=50):
    """
    Fetches recent logs from a specific CloudWatch Log Group.

    :param log_group_name: The name of the CloudWatch Log Group.
    :param minutes_ago: How far back to fetch logs from (in minutes).
    :param filter_pattern: Optional pattern to filter log events.
    :param limit: Maximum number of log events to return.
    :return: A list of log event messages.
    """
    # logs_client = boto3.client('logs')
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(minutes=minutes_ago)
    
    print(f"Fetching logs for '{log_group_name}' from {start_time.isoformat()} to {end_time.isoformat()} with filter: '{filter_pattern}'")
    
    # try:
    #     response = logs_client.filter_log_events(
    #         logGroupName=log_group_name,
    #         startTime=int(start_time.timestamp() * 1000),
    #         endTime=int(end_time.timestamp() * 1000),
    #         filterPattern=filter_pattern,
    #         limit=limit,
    #         interleaved=True # Show logs from different streams in chronological order
    #     )
    #     log_messages = [event['message'] for event in response.get('events', [])]
    #     print(f"Retrieved {len(log_messages)} log events.")
    #     return log_messages
    # except Exception as e:
    #     print(f"Error fetching logs for {log_group_name}: {e}")
    #     return [f"Error fetching logs: {str(e)}"]

    # Mocked response for IDE simulation
    print(f"Simulating CloudWatch log fetch for: {log_group_name}")
    mock_logs = [
        f"[{datetime.utcnow().isoformat()}] [INFO] Simulated log event 1 for {log_group_name}. Filter: '{filter_pattern}'",
        f"[{datetime.utcnow().isoformat()}] [WARN] Simulated log event 2, possible issue detected.",
        f"[{datetime.utcnow().isoformat()}] [ERROR] Simulated critical error for {log_group_name}.",
    ]
    return mock_logs[:limit]


def create_sns_alert(topic_arn, subject, message_detail, severity="INFO"):
    """
    Publishes an alert message to an AWS SNS topic.
    This would be called when a performance threshold is breached.

    :param topic_arn: ARN of the SNS topic.
    :param subject: Subject line for the notification.
    :param message_detail: Detailed message body for the alert.
    :param severity: Severity level (e.g., INFO, WARNING, CRITICAL).
    """
    # sns_client = boto3.client('sns')
    full_message = f"Severity: {severity}\n\n{message_detail}"
    print(f"Publishing alert to SNS Topic {topic_arn}:\nSubject: {subject}\nMessage: {full_message[:200]}...")
    # try:
    #     response = sns_client.publish(
    #         TopicArn=topic_arn,
    #         Message=full_message,
    #         Subject=subject,
    #         MessageAttributes={ # Optional attributes for filtering subscriptions
    #             'severity': {
    #                 'DataType': 'String',
    #                 'StringValue': severity
    #             }
    #         }
    #     )
    #     print(f"Alert published to SNS. Message ID: {response.get('MessageId')}")
    #     return response.get('MessageId')
    # except Exception as e:
    #     print(f"Error publishing alert to SNS topic {topic_arn}: {e}")
    #     return None
    
    # Mocked response for IDE simulation
    print(f"Simulated SNS alert publication to: {topic_arn}")
    return f"mock_sns_message_id_{int(datetime.utcnow().timestamp())}"


# Example usage (can be run locally for conceptual testing)
if __name__ == "__main__":
    print("--- Lambda Monitoring Utilities Tests (Conceptual) ---")

    # 1. Test log fetching (mocked)
    mock_log_group = "/aws/lambda/preprocess-hvac-data"
    recent_logs = get_recent_cloudwatch_logs(mock_log_group, minutes_ago=30, filter_pattern="ERROR", limit=5)
    print(f"\nRecent Logs for '{mock_log_group}' (filtered by 'ERROR'):")
    for log_line in recent_logs:
        print(log_line)

    # 2. Test SNS alert publishing (mocked)
    mock_sns_topic = "arn:aws:sns:us-east-1:123456789012:HvacIdeAlerts"
    alert_subject = "CRITICAL: High Lambda Error Rate for 'control-algo-heuristic'"
    alert_message = """
    The Lambda function 'control-algo-heuristic' has exceeded an error rate of 10% over the last 15 minutes.
    Current Error Rate: 12.5%
    Timestamp: """ + datetime.utcnow().isoformat() + """
    Please investigate immediately.
    CloudWatch Logs Link: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fcontrol-algo-heuristic
    """
    message_id = create_sns_alert(mock_sns_topic, alert_subject, alert_message, severity="CRITICAL")
    print(f"\nSNS Alert Message ID (mocked): {message_id}")

    # 3. Conceptual formatting of CloudWatch metrics (example structure)
    mock_cw_response = [
        {'Id': 'invocations', 'Label': 'Invocations', 'Timestamps': [datetime(2023,1,1,10,0,0), datetime(2023,1,1,10,5,0)], 'Values': [100.0, 110.0]},
        {'Id': 'errors', 'Label': 'Errors', 'Timestamps': [datetime(2023,1,1,10,0,0), datetime(2023,1,1,10,5,0)], 'Values': [1.0, 0.0]}
    ]
    formatted = format_cloudwatch_metrics_for_dashboard(mock_cw_response, "myTestFunction")
    print("\nFormatted Metrics Example:")
    print(json.dumps(formatted, indent=2))

    print("\n--- End of Conceptual Tests ---")
