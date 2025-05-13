
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileBrowserPlaceholder } from "@/components/ide/file-browser-placeholder";
import { CodeEditorPlaceholder } from "@/components/ide/code-editor-placeholder";
import { OutputPanelPlaceholder } from "@/components/ide/output-panel-placeholder";
import { RefreshCw, UploadCloud, Play, BarChartBig, DatabaseZap, Workflow, CloudLightning, Cpu, BookOpen, Activity } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const initialPythonScript = `
import json
import boto3
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import numpy as np # Required for type conversions for DynamoDB

def lambda_handler(event, context):
    s3_client = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    # Ensure 'SensorData' matches the DynamoDB table name specified in the architecture
    table = dynamodb.Table('SensorData') 

    # Assuming event is from S3 trigger for a single object
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    object_key = event['Records'][0]['s3']['object']['key']
    
    print(f"Processing s3://{bucket_name}/{object_key}")

    try:
        s3_object = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        # Assuming data is JSON. Add error handling for different formats or parsing errors.
        # For Parquet, you might use pd.read_parquet(io.BytesIO(s3_object['Body'].read()))
        # For CSV, pd.read_csv(io.BytesIO(s3_object['Body'].read()))
        df = pd.read_json(s3_object['Body']) 
        
        # Basic validation: Ensure 'value' column exists
        if 'value' not in df.columns:
            print(f"Key 'value' not found in DataFrame from {object_key}")
            return {'statusCode': 400, 'body': json.dumps(f"Missing 'value' column in {object_key}")}

        # Preprocessing
        df['value'] = pd.to_numeric(df['value'], errors='coerce') # Ensure numeric, coerce errors to NaN
        df.dropna(subset=['value'], inplace=True) # Drop rows where 'value' became NaN

        if df.empty:
            print(f"DataFrame is empty after coercing/dropping NaN values for {object_key}")
            return {'statusCode': 200, 'body': json.dumps(f"No valid data to process in {object_key} after initial cleaning")}

        # Interpolate missing values using linear method (if any NaNs remain or were introduced before coercion)
        df['value_interpolated'] = df['value'].interpolate(method='linear')
        
        # Outlier removal (values >3σ from the mean of interpolated values)
        # Check if std is not zero to avoid division by zero errors
        if df['value_interpolated'].std() != 0:
            mean_val = df['value_interpolated'].mean()
            std_val = df['value_interpolated'].std()
            df_cleaned = df[df['value_interpolated'].between(mean_val - 3 * std_val, mean_val + 3 * std_val)]
        else:
            df_cleaned = df.copy() # No outlier removal if std is zero
        
        # Drop duplicates - consider which columns define a duplicate
        # Example: df_cleaned = df_cleaned.drop_duplicates(subset=['timestamp', 'sensor_id', 'value_interpolated'])
        df_cleaned = df_cleaned.drop_duplicates() 

        if df_cleaned.empty:
            print(f"DataFrame is empty after outlier removal/deduplication for {object_key}")
            return {'statusCode': 200, 'body': json.dumps(f"No data in {object_key} after outlier removal/deduplication")}

        # Normalization (MinMaxScaler for 0–1 range on the cleaned, interpolated values)
        scaler = MinMaxScaler()
        df_cleaned['value_normalized'] = scaler.fit_transform(df_cleaned[['value_interpolated']])
        
        # Save processed data to DynamoDB (conceptual - requires correct schema mapping)
        # Ensure all data types are compatible with DynamoDB (e.g., no np.float64)
        # for _, row_series in df_cleaned.iterrows():
        #     item_to_put = row_series.to_dict()
        #     # Convert numpy types to Python native types
        #     for k, v in item_to_put.items():
        #         if isinstance(v, np.generic): # Catches numpy float, int, etc.
        #             item_to_put[k] = v.item()
        #         elif pd.isna(v): # Convert Pandas NaT/NaN to None for DynamoDB
        #             item_to_put[k] = None
        #     # Ensure primary key elements (sensor_id, timestamp) are present and correctly formatted
        #     # Example: if 'sensor_id' in item_to_put and 'timestamp' in item_to_put:
        #     #    table.put_item(Item=item_to_put)
        #     # else:
        #     #    print(f"Skipping row due to missing PK: {item_to_put}")
        
        print(f"Successfully preprocessed data from {object_key}. (Simulated save to DynamoDB)")
        return {'statusCode': 200, 'body': json.dumps(f"Data from {object_key} preprocessed. (Simulated save to DynamoDB)")}

    except Exception as e:
        print(f"Error processing file {object_key}: {str(e)}")
        # Depending on Lambda configuration, this might trigger retries or go to a DLQ.
        # For a production system, consider more specific error handling and logging.
        return {'statusCode': 500, 'body': json.dumps(f"Error processing {object_key}: {str(e)}")}

# Example event structure (for local testing in IDE, not part of Lambda deployment)
# mock_event = {
#   "Records": [
#     {
#       "s3": {
#         "bucket": {
#           "name": "your-s3-bucket-name"
#         },
#         "object": {
#           "key": "path/to/your/sample_data.json"
#         }
#       }
#     }
#   ]
# }
# if __name__ == "__main__":
#    # This block allows local testing if you save the script and run it.
#    # You would need to mock boto3 clients or have AWS credentials configured.
#    # print(lambda_handler(mock_event, None))
#    print("Script loaded. Define mock_event and AWS credentials/mocks for local testing.")
`;

const initialAthenaQuery = `
SELECT 
    sensor_id, 
    AVG(value) as avg_value, 
    DATE_TRUNC('hour', "timestamp") as hour_timestamp
FROM 
    hvac_data_prod.sensor_timeseries_data 
WHERE 
    type = 'temperature' 
    AND year = '2025' AND month = '05' -- Example partition filter
    AND "timestamp" >= '2025-05-01T00:00:00Z'
GROUP BY 
    sensor_id, DATE_TRUNC('hour', "timestamp")
ORDER BY 
    hour_timestamp DESC, sensor_id
LIMIT 100;
`;

export default function DataExplorerPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><DatabaseZap className="mr-2 h-6 w-6 text-primary"/>Data Explorer & Preprocessing</CardTitle>
          <CardDescription>Connect to data sources, explore, preprocess, and visualize timeseries data for HVAC analytics.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh Data Sources</Button>
            <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Upload Local Data</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-0">
        {/* Left Panel: Data Source Browsers & IoT Core */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <FileBrowserPlaceholder title="S3 Bucket Explorer (raw-data/)" browserType="s3" />
          <FileBrowserPlaceholder title="DynamoDB Table Explorer (ProcessedData)" browserType="dynamodb" />
          <Card className="shadow-md">
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base flex items-center"><CloudLightning className="mr-2 h-5 w-5 text-primary"/>AWS IoT Core Stream</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                <Input placeholder="MQTT Topic (e.g., hvac/+/telemetry)" />
                <Button variant="outline" className="w-full">Connect to Stream</Button>
                <ScrollArea className="h-24 w-full rounded-md border p-2 text-xs bg-muted">
                    <p>[10:05:03] temp_sensor001: 22.5°C</p>
                    <p>[10:05:03] occupancy_sensor002: 5 people</p>
                    <p>[10:05:04] energy_meter001: 1.2 kWh</p>
                    <p className="text-muted-foreground">Real-time data will appear here...</p>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Panel: Preprocessing, Visualization, Athena */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <Card className="shadow-md flex-grow flex flex-col">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base flex items-center"><Workflow className="mr-2 h-5 w-5 text-primary"/>Data Preprocessing Pipeline (AWS Lambda Script)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-grow flex flex-col min-h-0">
                <div className="flex-grow min-h-[200px]">
                    <CodeEditorPlaceholder title="Python Preprocessing Script (lambda_function.py)" defaultCode={initialPythonScript} language="python" />
                </div>
                <div className="flex gap-2 items-center">
                    <Button variant="default"><Play className="mr-2 h-4 w-4" />Run Preprocessing (Simulate Lambda)</Button>
                    <Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Load Sample S3 Event</Button>
                </div>
                <OutputPanelPlaceholder title="Preprocessing Output / Logs" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-md">
            <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-base flex items-center"><BarChartBig className="mr-2 h-5 w-5 text-primary"/>Timeseries Visualization (Plotly.js)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
            <div className="text-center p-4 border border-dashed rounded-md min-h-[200px] flex flex-col items-center justify-center bg-muted/50">
                <Image src="https://picsum.photos/400/200?random=4" alt="Timeseries Chart Placeholder" width={400} height={200} className="rounded-md mb-2 data-ai-hint='timeseries chart'"/>
                <p className="text-sm text-muted-foreground">Interactive timeseries chart (line, bar) will render here.</p>
                <p className="text-xs text-muted-foreground">Supports zoom, pan, and hover tooltips.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center"><Activity className="mr-1 h-4 w-4"/>Gauge: Avg Temp</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center p-4 data-ai-hint='gauge temperature'">
                        <Image src="https://picsum.photos/150/100?random=5" alt="Gauge Chart Placeholder" width={150} height={100} className="rounded-md" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center"><Cpu className="mr-1 h-4 w-4"/>Stats: Energy (kWh)</CardTitle></CardHeader>
                    <CardContent className="p-4 text-xs">
                        <p>Mean: 15.2</p>
                        <p>Min: 5.1</p>
                        <p>Max: 25.8</p>
                        <p>Std Dev: 4.3</p>
                    </CardContent>
                </Card>
            </div>
            </CardContent>
        </Card>
        <Card className="shadow-md flex flex-col">
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base flex items-center"><DatabaseZap className="mr-2 h-5 w-5 text-primary"/>AWS Athena Querying</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 flex-grow flex flex-col min-h-0">
                <Label htmlFor="athenaQuery">SQL Query (Athena)</Label>
                <div className="flex-grow min-h-[150px]">
                    <Textarea 
                        id="athenaQuery" 
                        defaultValue={initialAthenaQuery} 
                        className="font-mono text-xs h-full resize-none"
                        placeholder="SELECT * FROM hvac_data_prod.sensor_timeseries_data LIMIT 10;"
                    />
                </div>
                <Button variant="default" className="w-full"><Play className="mr-2 h-4 w-4"/>Run Athena Query</Button>
                <OutputPanelPlaceholder title="Athena Query Results / Status" />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

