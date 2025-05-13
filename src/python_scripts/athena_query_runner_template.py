
import boto3
import time
import json
import os

# --- AWS Client Initialization (Conceptual - credentials managed by Lambda execution role) ---
# athena_client = boto3.client('athena')

# --- Configuration ---
# These should be configured, e.g., via Lambda environment variables
ATHENA_DATABASE = os.environ.get('ATHENA_DATABASE', 'hvac_optimizer_db') # Default if not set
S3_OUTPUT_LOCATION = os.environ.get('S3_ATHENA_RESULTS_BUCKET', 's3://your-athena-query-results-bucket/ide-outputs/')

def execute_athena_query(query_string, database=ATHENA_DATABASE, s3_output=S3_OUTPUT_LOCATION):
    """
    Starts an Athena query execution and returns the execution ID.
    """
    print(f"Starting Athena query in database '{database}':\n{query_string[:200]}...") # Log truncated query
    # response = athena_client.start_query_execution(
    #     QueryString=query_string,
    #     QueryExecutionContext={'Database': database},
    #     ResultConfiguration={'OutputLocation': s3_output}
    # )
    # query_execution_id = response['QueryExecutionId']
    # print(f"Athena query started with Execution ID: {query_execution_id}")
    # return query_execution_id
    
    # Mocking for IDE simulation / local testing
    print("Simulating Athena query start...")
    return "mock_query_execution_id_" + str(int(time.time()))


def poll_query_status(query_execution_id, poll_interval_seconds=1, timeout_seconds=300):
    """
    Polls Athena for the status of a query execution until it completes or times out.
    Returns the final status.
    """
    elapsed_time = 0
    while elapsed_time < timeout_seconds:
        # query_status_response = athena_client.get_query_execution(QueryExecutionId=query_execution_id)
        # status = query_status_response['QueryExecution']['Status']['State']
        # reason = query_status_response['QueryExecution']['Status'].get('StateChangeReason', '')
        
        # Mocking for IDE simulation
        print(f"Polling status for {query_execution_id}... (Simulated)")
        if elapsed_time < 2: # Simulate running for a bit
            status = 'RUNNING'
            reason = ''
        else: # Simulate completion
            status = 'SUCCEEDED' 
            reason = 'Query successful (mocked)'
        
        print(f"Query Status: {status}")

        if status == 'SUCCEEDED':
            return {'status': status, 'reason': reason}
        elif status in ['FAILED', 'CANCELLED']:
            error_message = f"Athena query {status.lower()}. Reason: {reason}"
            print(error_message)
            raise Exception(error_message)
        
        time.sleep(poll_interval_seconds)
        elapsed_time += poll_interval_seconds
        
    raise TimeoutError(f"Athena query {query_execution_id} timed out after {timeout_seconds} seconds.")


def get_query_results(query_execution_id):
    """
    Retrieves results for a completed Athena query.
    Handles pagination.
    """
    print(f"Fetching results for Athena query ID: {query_execution_id}")
    # results_paginator = athena_client.get_paginator('get_query_results')
    # results_iter = results_paginator.paginate(
    #     QueryExecutionId=query_execution_id,
    #     PaginationConfig={'PageSize': 1000} # Adjust as needed
    # )
    
    # column_names = []
    # data_rows = []

    # for page_num, page in enumerate(results_iter):
    #     if page_num == 0: # First page's ResultSetMetadata contains column info
    #         if 'ResultSetMetadata' in page['ResultSet'] and 'ColumnInfo' in page['ResultSet']['ResultSetMetadata']:
    #             column_names = [col_info['Name'] for col_info in page['ResultSet']['ResultSetMetadata']['ColumnInfo']]
    #         else: # Fallback or error if metadata not found
    #             print("Warning: Column metadata not found in the first page.")
    #             # Could attempt to infer from first data row if desperate, but risky.

    #     # Process rows, skipping header row if present (Athena includes it in Rows)
    #     current_page_rows = page['ResultSet']['Rows']
    #     start_index = 1 if page_num == 0 and len(current_page_rows) > 0 and \
    #                           all(item.get('VarCharValue') == col_name for item, col_name in zip(current_page_rows[0]['Data'], column_names)) \
    #                       else 0

    #     for row_data in current_page_rows[start_index:]:
    #         values = [item.get('VarCharValue', None) for item in row_data['Data']]
    #         if column_names: # Only append if we have column names
    #             data_rows.append(dict(zip(column_names, values)))
    #         else: # If no column_names, append as list of values (less ideal)
    #             data_rows.append(values)

    # print(f"Retrieved {len(data_rows)} rows.")
    # return data_rows

    # Mocked response for IDE simulation
    print("Simulating Athena query result fetching...")
    mock_results = [
        {'sensor_id': 'temp_001', 'avg_value': '22.5', 'hour_timestamp': '2023-01-01 10:00:00.000 UTC'},
        {'sensor_id': 'temp_002', 'avg_value': '23.1', 'hour_timestamp': '2023-01-01 10:00:00.000 UTC'},
        {'sensor_id': 'temp_001', 'avg_value': '22.8', 'hour_timestamp': '2023-01-01 11:00:00.000 UTC'},
    ]
    return mock_results

def lambda_handler(event, context):
    """
    AWS Lambda handler function.
    Expects a 'query' in the event payload.
    - Executes the Athena query.
    - Polls for completion.
    - Retrieves and returns results.
    """
    query_string = event.get('query')
    if not query_string:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': "Missing 'query' parameter in the event."})
        }

    try:
        query_execution_id = execute_athena_query(query_string)
        
        # In a real Lambda, if the query is long-running, you might:
        # 1. Return immediately with query_execution_id and have another mechanism to fetch results.
        # 2. Use Step Functions for orchestration.
        # For IDE direct execution (or shorter queries), polling is acceptable.
        status_info = poll_query_status(query_execution_id)
        
        if status_info['status'] == 'SUCCEEDED':
            results = get_query_results(query_execution_id)
            return {
                'statusCode': 200,
                'body': json.dumps({
                    "message": "Athena query executed successfully.",
                    "query_execution_id": query_execution_id,
                    "results": results
                })
            }
        else: # Should be caught by poll_query_status, but as a safeguard
            return {
                'statusCode': 500, # Or appropriate error code based on status
                'body': json.dumps({
                    "error": f"Athena query ended with status: {status_info['status']}",
                    "reason": status_info.get('reason', 'No reason provided.'),
                    "query_execution_id": query_execution_id
                })
            }
            
    except TimeoutError as te:
        print(f"TimeoutError: {str(te)}")
        return {'statusCode': 504, 'body': json.dumps({'error': str(te)})} # Gateway Timeout
    except Exception as e:
        print(f"Error executing Athena query: {str(e)}")
        # Log detailed error to CloudWatch
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"An error occurred: {str(e)}"})
        }

# --- For local testing or IDE simulation ---
if __name__ == "__main__":
    mock_event = {
        "query": """
            SELECT sensor_id, AVG(value) as avg_value, date_trunc('hour', "timestamp") as hour_of_day
            FROM "hvac_optimizer_db"."mock_sensor_data_table" -- Ensure your DB and Table names are correct
            WHERE type = 'temperature'
            GROUP BY sensor_id, date_trunc('hour', "timestamp")
            ORDER BY hour_of_day DESC
            LIMIT 10;
        """
    }
    # Note: For actual local testing against AWS, ensure your AWS credentials and region are configured.
    # And the S3_OUTPUT_LOCATION bucket must exist and be writable by your IAM user/role.
    
    print("--- Simulating Lambda Execution for Athena Query ---")
    result = lambda_handler(mock_event, None)
    print("\n--- Lambda Result (Athena Query) ---")
    # Pretty print the JSON body if it exists
    try:
        body_json = json.loads(result['body'])
        print(json.dumps(body_json, indent=2))
    except json.JSONDecodeError:
        print(result['body'])
    except TypeError: # If body is not a string (e.g. already a dict if local test doesn't stringify)
        print(json.dumps(result['body'], indent=2))

```