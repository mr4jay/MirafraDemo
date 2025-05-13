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
import boto3
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Example: Fetch data from S3
# s3_client = boto3.client('s3')
# obj = s3_client.get_object(Bucket='your-bucket', Key='your-file.json') # e.g., JSON, CSV, Parquet
# df = pd.read_json(obj['Body']) 

# Example: Fetch data from DynamoDB
# dynamodb = boto3.resource('dynamodb')
# table = dynamodb.Table('SensorData')
# response = table.query(KeyConditionExpression=...)
# df = pd.DataFrame(response['Items'])

print("Sample Data Loaded (Mock).")

def preprocess_data(df):
    print("Starting data preprocessing...")
    # Handle missing values (interpolate using linear method)
    df['value_interpolated'] = df['value'].interpolate(method='linear')
    
    # Outlier removal (values >3σ)
    mean = df['value_interpolated'].mean()
    std_dev = df['value_interpolated'].std()
    df_cleaned = df[df['value_interpolated'].between(mean - 3 * std_dev, mean + 3 * std_dev)]
    
    # Normalization (MinMaxScaler for 0–1 range)
    scaler = MinMaxScaler()
    df_cleaned['value_normalized'] = scaler.fit_transform(df_cleaned[['value_interpolated']])
    
    print("Preprocessing complete.")
    print("Cleaned DataFrame head:")
    print(df_cleaned.head())
    return df_cleaned

# Assuming df is loaded
# df_processed = preprocess_data(df.copy())

# Example: Save processed data to S3 or DynamoDB
# s3_client.put_object(Bucket='processed-bucket', Key='processed_data.csv', Body=df_processed.to_csv())
# for index, row in df_processed.iterrows():
#     dynamodb_table.put_item(Item=row.to_dict())

print("Preprocessing script ready. Use 'Run Preprocessing (via Lambda)' button.")
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
              <CardTitle className="text-base flex items-center"><Workflow className="mr-2 h-5 w-5 text-primary"/>Data Preprocessing Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-grow flex flex-col min-h-0">
                <div className="flex-grow min-h-[200px]">
                    <CodeEditorPlaceholder title="Python Preprocessing Script" defaultCode={initialPythonScript} language="python" />
                </div>
                <div className="flex gap-2 items-center">
                    <Button variant="default"><Play className="mr-2 h-4 w-4" />Run Preprocessing (Lambda)</Button>
                    <Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Load Sample Data (Mock)</Button>
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
