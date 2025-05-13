
import json
import boto3
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import numpy as np
from io import StringIO # Or BytesIO for binary files like Parquet

# --- AWS Client Initialization (Conceptual - credentials managed by Lambda execution role) ---
# s3_client = boto3.client('s3')
# dynamodb_resource = boto3.resource('dynamodb')
# processed_data_table = dynamodb_resource.Table('SensorDataProcessed') # Example table

# --- Configuration ---
# These would typically be passed as environment variables or part of the event
# S3_PROCESSED_BUCKET = 'your-hvac-processed-data-bucket' 
# ROLLING_AVG_WINDOW = '5T' # 5 minutes for rolling average

def load_data_from_s3(bucket, key):
    """Loads data from S3. Handles JSON and CSV, can be extended for Parquet."""
    print(f"Loading data from s3://{bucket}/{key}")
    # obj = s3_client.get_object(Bucket=bucket, Key=key)
    # file_content = obj['Body'].read().decode('utf-8')
    
    # Mocking S3 get_object for local testing / IDE simulation
    if key.endswith('.json'):
        # Mock JSON data
        mock_data = [
            {"timestamp": "2023-01-01T00:00:00Z", "sensor_id": "temp_001", "value": 22.5, "unit": "C", "zone": "A"},
            {"timestamp": "2023-01-01T00:01:00Z", "sensor_id": "temp_001", "value": 22.7, "unit": "C", "zone": "A"},
            {"timestamp": "2023-01-01T00:02:00Z", "sensor_id": "temp_001", "value": None, "unit": "C", "zone": "A"}, # Missing value
            {"timestamp": "2023-01-01T00:03:00Z", "sensor_id": "temp_001", "value": 28.0, "unit": "C", "zone": "A"}, # Potential outlier
            {"timestamp": "2023-01-01T00:04:00Z", "sensor_id": "temp_001", "value": 22.6, "unit": "C", "zone": "A"},
            {"timestamp": "2023-01-01T00:04:00Z", "sensor_id": "temp_001", "value": 22.6, "unit": "C", "zone": "A"}, # Duplicate
        ]
        file_content = json.dumps(mock_data)
        df = pd.read_json(StringIO(file_content))
    elif key.endswith('.csv'):
        # Mock CSV data
        mock_csv_content = "timestamp,sensor_id,value,unit,zone\n" \
                           "2023-01-01T00:00:00Z,temp_001,22.5,C,A\n" \
                           "2023-01-01T00:01:00Z,temp_001,22.7,C,A"
        df = pd.read_csv(StringIO(mock_csv_content))
    # elif key.endswith('.parquet'):
        # For Parquet, you'd use: df = pd.read_parquet(BytesIO(obj['Body'].read()))
    else:
        raise ValueError(f"Unsupported file type for key: {key}")
    
    print(f"Loaded {len(df)} rows.")
    return df

def preprocess_timeseries_data(df):
    """
    Applies a series of preprocessing steps to the timeseries DataFrame.
    1. Converts 'timestamp' to datetime objects.
    2. Sets 'timestamp' as index and sorts.
    3. Ensures 'value' column is numeric, coercing errors.
    4. Handles missing values using linear interpolation.
    5. Removes duplicate entries based on timestamp and sensor_id.
    6. Identifies and removes outliers (values > 3 standard deviations from the mean).
    7. Calculates rolling averages (e.g., 5-minute window).
    8. Normalizes 'value' using MinMaxScaler to a 0-1 range.
    """
    if df.empty:
        print("Input DataFrame is empty. Skipping preprocessing.")
        return df

    # Convert timestamp and set as index
    if 'timestamp' not in df.columns:
        raise ValueError("DataFrame must contain a 'timestamp' column.")
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    df.dropna(subset=['timestamp'], inplace=True) # Drop rows where timestamp conversion failed
    df = df.set_index('timestamp').sort_index()

    # Ensure 'value' is numeric
    if 'value' not in df.columns:
        raise ValueError("DataFrame must contain a 'value' column.")
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    # Interpolate missing 'value' data
    df['value_interpolated'] = df['value'].interpolate(method='linear').fillna(method='bfill').fillna(method='ffill')
    
    # Remove duplicates (considering sensor_id if present, otherwise just timestamp and value)
    subset_cols = ['value_interpolated']
    if 'sensor_id' in df.columns:
        subset_cols.insert(0, 'sensor_id')
    df = df.reset_index().drop_duplicates(subset=['timestamp'] + subset_cols).set_index('timestamp')

    # Outlier removal (3-sigma rule on interpolated values)
    if not df['value_interpolated'].empty and df['value_interpolated'].std() != 0:
        mean_val = df['value_interpolated'].mean()
        std_val = df['value_interpolated'].std()
        df = df[np.abs(df['value_interpolated'] - mean_val) <= (3 * std_val)]
    
    if df.empty:
        print("DataFrame is empty after outlier removal. No data to process further.")
        return df.reset_index() # Return with timestamp as column

    # Rolling average
    df['value_rolling_avg'] = df['value_interpolated'].rolling(window=ROLLING_AVG_WINDOW).mean().fillna(method='bfill').fillna(method='ffill')

    # Normalization (MinMaxScaler)
    scaler = MinMaxScaler()
    df['value_normalized'] = scaler.fit_transform(df[['value_interpolated']])
    
    print(f"Preprocessing complete. {len(df)} rows remaining.")
    return df.reset_index() # Ensure timestamp is a column for saving

def save_processed_data(df, bucket, key):
    """Saves the processed DataFrame to S3 as Parquet and/or to DynamoDB."""
    if df.empty:
        print("No processed data to save.")
        return

    # Example: Save to S3 as Parquet (recommended for Athena)
    # parquet_buffer = BytesIO()
    # df.to_parquet(parquet_buffer, index=False)
    # processed_key = f"processed/{key.replace('.json', '.parquet').replace('.csv', '.parquet')}"
    # s3_client.put_object(Bucket=bucket, Key=processed_key, Body=parquet_buffer.getvalue())
    # print(f"Saved processed data to s3://{bucket}/{processed_key}")

    # Example: Save to DynamoDB (ensure schema matches and types are converted)
    # for _, row_series in df.iterrows():
    #     item = row_series.to_dict()
    #     # Convert numpy types to Python native types for DynamoDB
    #     for k, v in item.items():
    #         if isinstance(v, np.generic):
    #             item[k] = v.item()
    #         elif pd.isna(v): # Handle Pandas NaT/NaN
    #             item[k] = None 
    #         elif isinstance(v, pd.Timestamp): # Convert Timestamp to ISO string
    #             item[k] = v.isoformat()
    #     # Ensure primary key elements (e.g., sensor_id, timestamp) are present and correctly formatted
    #     # try:
    #     #    processed_data_table.put_item(Item=item)
    #     # except Exception as e:
    #     #    print(f"Error saving item to DynamoDB: {item}, Error: {e}")
    print("Simulated saving processed data.")


def lambda_handler(event, context):
    """
    AWS Lambda handler function.
    Triggered by S3 event (e.g., new raw data file).
    - Loads data from S3.
    - Preprocesses the data.
    - Saves processed data to another S3 location (e.g., Parquet for Athena) and/or DynamoDB.
    """
    try:
        # Assuming S3 trigger:
        # bucket = event['Records'][0]['s3']['bucket']['name']
        # key = event['Records'][0]['s3']['object']['key']
        
        # For IDE simulation / direct invocation, event might carry bucket/key directly:
        bucket = event.get('bucket', 'mock-hvac-data-bucket') # Default mock bucket
        key = event.get('key', 'sample_temp_data.json')     # Default mock key
        
        if not bucket or not key:
            return {'statusCode': 400, 'body': json.dumps("Missing S3 bucket or key in event.")}

        raw_df = load_data_from_s3(bucket, key)
        
        if raw_df.empty:
            return {'statusCode': 200, 'body': json.dumps(f"No data loaded from s3://{bucket}/{key}. Nothing to process.")}
            
        processed_df = preprocess_timeseries_data(raw_df)
        
        if not processed_df.empty:
            save_processed_data(processed_df, bucket, key) # Conceptual save
            # Return a sample of processed data or summary
            return {
                'statusCode': 200,
                'body': json.dumps({
                    "message": f"Successfully processed s3://{bucket}/{key}. {len(processed_df)} rows processed.",
                    "processed_sample": processed_df.head().to_dict(orient='records')
                }, default=str) # default=str to handle datetime/timedelta
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps({"message": f"No data remained after preprocessing s3://{bucket}/{key}."})
            }

    except Exception as e:
        print(f"Error processing file: {str(e)}")
        # Log to CloudWatch
        return {
            'statusCode': 500,
            'body': json.dumps({"error": str(e)})
        }

# --- For local testing or IDE simulation ---
if __name__ == "__main__":
    # Simulate an S3 event or a direct call with parameters
    mock_event = {
        'bucket': 'mock-hvac-data-bucket',
        'key': 'sample_temp_data.json' 
        # Replace with 'sample_temp_data.csv' to test CSV loading logic
    }
    
    print("--- Simulating Lambda Execution ---")
    result = lambda_handler(mock_event, None)
    print("\n--- Lambda Result ---")
    print(json.dumps(json.loads(result['body']), indent=2, default=str))
    
    # Example of directly calling functions for fine-grained testing:
    # print("\n--- Direct Function Call Example ---")
    # test_df = load_data_from_s3('mock-bucket', 'test.json')
    # if not test_df.empty:
    #    processed_test_df = preprocess_timeseries_data(test_df)
    #    print("\n--- Processed DataFrame (Direct Call) ---")
    #    print(processed_test_df.head())

```

