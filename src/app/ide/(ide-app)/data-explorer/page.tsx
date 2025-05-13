"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileBrowserPlaceholder } from "@/components/ide/file-browser-placeholder";
import { CodeEditorPlaceholder } from "@/components/ide/code-editor-placeholder";
import { OutputPanelPlaceholder } from "@/components/ide/output-panel-placeholder";
import { RefreshCw, UploadCloud, Play, BarChartBig, DatabaseZap, Workflow, CloudLightning, Cpu, BookOpen, Activity, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import PlotlyChart from '@/components/ide/plotly-chart';
import type { Data, Layout } from 'plotly.js-dist-min';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// Conceptual: Python script for S3 data preprocessing and analysis.
// This script would be executed by a Lambda function triggered by S3 events or IDE actions.
// For IDE simulation, its logic is mocked in handleRunPreprocessing.
const initialPythonScript = `
import json
import boto3
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import numpy as np # Required for type conversions for DynamoDB

# s3_client = boto3.client('s3')
# dynamodb = boto3.resource('dynamodb')
# table = dynamodb.Table('SensorDataProcessed') # Assumes a table for processed data

def preprocess_sensor_data(raw_data_df):
    """
    Preprocesses raw sensor data.
    - Handles missing values by linear interpolation.
    - Removes outliers (values >3σ from the mean).
    - Normalizes data to 0-1 range using MinMaxScaler.
    - Adds aggregated features like rolling averages.
    """
    df = raw_data_df.copy()
    
    # Ensure 'value' is numeric, coercing errors
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    
    # Interpolate missing values (linear method)
    df['value'] = df['value'].interpolate(method='linear').fillna(method='bfill').fillna(method='ffill') # Chain fillna for edge cases
    
    # Outlier removal (values >3σ from the mean)
    if not df['value'].empty and df['value'].std() != 0:
        mean_val = df['value'].mean()
        std_val = df['value'].std()
        df = df[np.abs(df['value'] - mean_val) <= (3 * std_val)]
    
    if df.empty:
        print("DataFrame is empty after outlier removal.")
        return df

    # Normalization (MinMaxScaler for 0–1 range)
    scaler = MinMaxScaler()
    df['value_normalized'] = scaler.fit_transform(df[['value']])
    
    # Aggregation (e.g., 5-minute rolling average)
    # Ensure datetime index for resampling
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.set_index('timestamp').sort_index()
        df['value_rolling_avg_5min'] = df['value'].rolling(window='5T').mean().fillna(method='bfill').fillna(method='ffill')
        df = df.reset_index() # Reset index if needed for further processing/storage

    return df

def lambda_handler(event, context):
    # Example: event contains S3 bucket and key for a raw data file
    # bucket_name = event['Records'][0]['s3']['bucket']['name']
    # object_key = event['Records'][0]['s3']['object']['key']
    # raw_df = pd.read_json(f"s3://{bucket_name}/{object_key}")
    
    # For IDE simulation, raw_df might be passed or loaded differently
    # This is a placeholder for actual data loading logic
    sample_raw_data = {
        'timestamp': pd.to_datetime(['2023-01-01T00:00:00Z', '2023-01-01T00:01:00Z', None, '2023-01-01T00:03:00Z', '2023-01-01T00:04:00Z']),
        'value': [10, 12, np.nan, 100, 13], # Includes NaN and an outlier
        'sensor_id': ['sensorA'] * 5
    }
    raw_df = pd.DataFrame(sample_raw_data)
    
    processed_df = preprocess_sensor_data(raw_df)
    
    # Conceptual: Save processed_df to DynamoDB or another S3 location
    # for _, row in processed_df.iterrows():
    #    item_to_put = row.to_dict()
    #    # Convert numpy types, handle NaT/NaN for DynamoDB
    #    table.put_item(Item=item_to_put)
        
    print(f"Successfully preprocessed data. Processed rows: {len(processed_df)}")
    return {'statusCode': 200, 'body': processed_df.to_json(orient='records', date_format='iso')}

# Example usage for local testing:
# if __name__ == "__main__":
#    result = lambda_handler({}, None)
#    print(json.loads(result['body']))
`;

// Conceptual: Python script for running Athena queries.
// This would be executed by a Lambda function triggered by an API Gateway endpoint called from the IDE.
const initialAthenaQueryRunnerScript = `
import boto3
import time
import json

# athena_client = boto3.client('athena')
# S3_OUTPUT_LOCATION = 's3://your-athena-query-results-bucket/ide-outputs/' # Configure this
# ATHENA_DATABASE = 'hvac_db' # Configure this

def run_athena_query(query_string):
    """
    Executes an Athena query and waits for completion.
    Returns the query results.
    """
    # response = athena_client.start_query_execution(
    #     QueryString=query_string,
    #     QueryExecutionContext={'Database': ATHENA_DATABASE},
    #     ResultConfiguration={'OutputLocation': S3_OUTPUT_LOCATION}
    # )
    # query_execution_id = response['QueryExecutionId']
    
    # status = 'RUNNING'
    # while status in ['RUNNING', 'QUEUED']:
    #     time.sleep(1) # Poll every second
    #     query_status = athena_client.get_query_execution(QueryExecutionId=query_execution_id)
    #     status = query_status['QueryExecution']['Status']['State']
    #     if status == 'FAILED':
    #         raise Exception(f"Athena query failed: {query_status['QueryExecution']['Status']['StateChangeReason']}")
    #     elif status == 'CANCELLED':
    #         raise Exception("Athena query was cancelled.")
            
    # results_paginator = athena_client.get_paginator('get_query_results')
    # results_iter = results_paginator.paginate(QueryExecutionId=query_execution_id, PaginationConfig={'PageSize': 1000})
    
    # data_rows = []
    # column_names = []
    # for i, page in enumerate(results_iter):
    #     if i == 0: # First page contains column names
    #         column_names = [col['Name'] for col in page['ResultSet']['ResultSetMetadata']['ColumnInfo']]
    #     for row in page['ResultSet']['Rows']:
    #         data_values = [item.get('VarCharValue', None) for item in row['Data']]
    #         if i == 0 and all(val in column_names for val in data_values): # Skip header row if it's data
    #             continue
    #         data_rows.append(dict(zip(column_names, data_values)))
            
    # return data_rows
    
    # Mocked response for IDE simulation
    print(f"Simulating Athena query: {query_string}")
    mock_results = [
        {'sensor_id': 'temp_001', 'avg_value': '22.5', 'hour_timestamp': '2023-01-01 10:00:00.000 UTC'},
        {'sensor_id': 'temp_002', 'avg_value': '23.1', 'hour_timestamp': '2023-01-01 10:00:00.000 UTC'},
        {'sensor_id': 'temp_001', 'avg_value': '22.8', 'hour_timestamp': '2023-01-01 11:00:00.000 UTC'},
    ]
    return mock_results


def lambda_handler(event, context):
    # query = event.get('query')
    # if not query:
    #     return {'statusCode': 400, 'body': json.dumps("Query parameter is missing.")}
    # try:
    #     results = run_athena_query(query)
    #     return {'statusCode': 200, 'body': json.dumps(results)}
    # except Exception as e:
    #     return {'statusCode': 500, 'body': json.dumps(str(e))}
    
    # Mocked for IDE simulation
    query = event.get('query', 'SELECT * FROM mock_table LIMIT 3;')
    results = run_athena_query(query)
    return {'statusCode': 200, 'body': json.dumps(results)}
`;


const initialAthenaQuery = `
SELECT 
    sensor_id, 
    AVG(value) as avg_value, 
    DATE_TRUNC('hour', "timestamp") as hour_timestamp
FROM 
    hvac_data_prod.sensor_timeseries_data -- Ensure this table exists in your Athena setup
WHERE 
    type = 'temperature' 
    AND year = '2025' AND month = '05' -- Example partition filter
    AND "timestamp" >= CAST('2025-05-01T00:00:00Z' AS timestamp) -- Ensure correct timestamp casting
GROUP BY 
    sensor_id, DATE_TRUNC('hour', "timestamp")
ORDER BY 
    hour_timestamp DESC, sensor_id
LIMIT 100;
`;

interface TimeseriesStat {
  mean?: number;
  min?: number;
  max?: number;
  std?: number;
  count?: number;
}

export default function DataExplorerPage() {
  const [preprocessingScript, setPreprocessingScript] = useState(initialPythonScript);
  const [athenaQuery, setAthenaQuery] = useState(initialAthenaQuery);
  const [preprocessingLogs, setPreprocessingLogs] = useState<string[]>(["Preprocessing output will appear here."]);
  const [athenaResults, setAthenaResults] = useState<Record<string, any>[]>([]);
  const [athenaQueryStatus, setAthenaQueryStatus] = useState<string>("Athena query results will appear here.");

  const [timeseriesPlotData, setTimeseriesPlotData] = useState<Data[]>([]);
  const [timeseriesPlotLayout, setTimeseriesPlotLayout] = useState<Partial<Layout>>({
    title: 'Timeseries Data Visualization',
    xaxis: { title: 'Time', type: 'date' },
    yaxis: { title: 'Value' },
  });
  const [timeseriesStats, setTimeseriesStats] = useState<TimeseriesStat>({});
  
  // Conceptual: Real-time data updates could be handled via WebSocket connection
  // established here and updating `timeseriesPlotData`.
  // useEffect(() => {
  //   const ws = new WebSocket('wss://your-api-gateway-websocket-url');
  //   ws.onmessage = (event) => {
  //     const newDataPoint = JSON.parse(event.data);
  //     // Logic to append newDataPoint to timeseriesPlotData
  //   };
  //   return () => ws.close();
  // }, []);

  const handleRunPreprocessing = async () => {
    setPreprocessingLogs([`Simulating preprocessing with the provided script...`]);
    // In a real IDE, this would involve:
    // 1. Taking the content of 'preprocessingScript'.
    // 2. Sending it to a backend service (e.g., Lambda via API Gateway).
    // 3. The Lambda executes the script, possibly fetching data from S3 based on user selection.
    // 4. The Lambda returns the processed data and logs.
    
    // Mocking the process:
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    // Mock data generation based on the conceptual Python script
    const timestamps = pd.to_datetime(['2023-01-01T00:00:00Z', '2023-01-01T00:01:00Z', '2023-01-01T00:02:00Z', '2023-01-01T00:03:00Z', '2023-01-01T00:04:00Z']);
    const rawValues = [10, 12, 11, 100, 13]; // Original with NaN interpolated and outlier
    
    // Simulate interpolation
    const interpolatedValues = [10, 12, 11.5, 100, 13]; // Assume 11.5 was interpolated for a NaN at index 2
    
    // Simulate outlier removal (e.g. 100 is an outlier)
    const cleanedValues = interpolatedValues.filter(v => v < 50); // Simple filter
    const cleanedTimestamps = timestamps.filter((_,i) => interpolatedValues[i] < 50);


    if (cleanedValues.length === 0) {
      setPreprocessingLogs(prev => [...prev, "No data remaining after preprocessing."]);
      setTimeseriesPlotData([]);
      setTimeseriesStats({});
      return;
    }

    // Simulate normalization
    const minVal = Math.min(...cleanedValues);
    const maxVal = Math.max(...cleanedValues);
    const normalizedValues = maxVal === minVal ? cleanedValues.map(() => 0.5) : cleanedValues.map(v => (v - minVal) / (maxVal - minVal));

    const newPlotData: Data[] = [
      {
        x: cleanedTimestamps.map(t => t.toISOString()),
        y: cleanedValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cleaned Value',
      },
      {
        x: cleanedTimestamps.map(t => t.toISOString()),
        y: normalizedValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Normalized Value (0-1)',
        yaxis: 'y2'
      }
    ];
    setTimeseriesPlotData(newPlotData);
    setTimeseriesPlotLayout(prev => ({
      ...prev,
      title: 'Processed Sensor Data',
      yaxis: { title: 'Sensor Value' },
      yaxis2: { title: 'Normalized Value', overlaying: 'y', side: 'right', showgrid:false },
      legend: {x: 0.1, y: 1.1, orientation: 'h'}
    }));

    const sum = cleanedValues.reduce((a, b) => a + b, 0);
    const mean = sum / cleanedValues.length;
    const min = Math.min(...cleanedValues);
    const max = Math.max(...cleanedValues);
    const std = Math.sqrt(cleanedValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / cleanedValues.length);
    setTimeseriesStats({ mean, min, max, std, count: cleanedValues.length });

    setPreprocessingLogs(prev => [...prev, "Preprocessing simulation complete.", `Processed ${cleanedValues.length} data points.`]);
  };

  const handleRunAthenaQuery = async () => {
    setAthenaQueryStatus(`Running Athena query: ${athenaQuery.substring(0,50)}...`);
    setAthenaResults([]);
    // In a real IDE, this would send 'athenaQuery' to a backend service (Lambda via API Gateway).
    // The Lambda would use 'athena_query_runner_template.py' logic.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    // Mocked response based on 'initialAthenaQueryRunnerScript'
    const mockResults = [
        {'sensor_id': 'temp_001', 'avg_value': '22.5', 'hour_timestamp': '2023-01-01 10:00:00.000 UTC'},
        {'sensor_id': 'temp_002', 'avg_value': '23.1', 'hour_timestamp': '2023-01-01 10:00:00.000 UTC'},
        {'sensor_id': 'temp_001', 'avg_value': '22.8', 'hour_timestamp': '2023-01-01 11:00:00.000 UTC'},
        {'sensor_id': 'temp_002', 'avg_value': '23.5', 'hour_timestamp': '2023-01-01 11:00:00.000 UTC'},
    ];
    setAthenaResults(mockResults);
    setAthenaQueryStatus(`Athena query simulation complete. ${mockResults.length} rows returned.`);

    // Optionally visualize Athena results if suitable
    if (mockResults.length > 0 && mockResults[0].avg_value && mockResults[0].hour_timestamp) {
      const groupedBySensor = mockResults.reduce((acc, row) => {
        if (!acc[row.sensor_id]) acc[row.sensor_id] = { x: [], y: [], name: row.sensor_id, type: 'scatter', mode: 'lines+markers' };
        acc[row.sensor_id].x.push(new Date(row.hour_timestamp).toISOString());
        acc[row.sensor_id].y.push(parseFloat(row.avg_value));
        return acc;
      }, {} as Record<string, any>);

      setTimeseriesPlotData(Object.values(groupedBySensor));
      setTimeseriesPlotLayout({
        title: 'Athena Query Results: Average Temperature by Hour',
        xaxis: { title: 'Time', type: 'date' },
        yaxis: { title: 'Average Temperature (°C)' },
      });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><DatabaseZap className="mr-2 h-6 w-6 text-primary"/>Timeseries Data Integration Module</CardTitle>
          <CardDescription>Access, preprocess, query, and visualize timeseries data from AWS S3, DynamoDB, and Athena. 
          {/* Conceptual: Real-time updates can be achieved via WebSockets (API Gateway) and caching with ElastiCache for performance. */}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh Data Sources</Button>
            <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Upload Local Data</Button>
            {/* Conceptual: Git actions for scripts would be here.
            <Button variant="outline"><GitMerge className="mr-2 h-4 w-4" /> Commit Script</Button> 
            */}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-4 flex-grow min-h-0">
        {/* Left Panel: Data Sources, Filters, Preprocessing Script */}
        <div className="flex flex-col gap-4 min-h-0">
          <FileBrowserPlaceholder title="S3 Bucket Explorer (raw-data/)" browserType="s3" />
          {/* Conceptual: Selecting a file here would populate a path for preprocessing. */}
          <FileBrowserPlaceholder title="DynamoDB Table Explorer (ProcessedData)" browserType="dynamodb" />
          
          <Card className="shadow-md">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Data Filters & Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="sensorSelect">Sensor ID</Label>
              <Input id="sensorSelect" placeholder="e.g., temp_sensor_001, occupancy_zone_A" />
              <Label htmlFor="timeRange">Time Range</Label>
              <Select defaultValue="last_24h">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_1h">Last 1 Hour</SelectItem>
                  <SelectItem value="last_24h">Last 24 Hours</SelectItem>
                  <SelectItem value="last_7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-md flex-grow flex flex-col min-h-[300px]">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base flex items-center"><Workflow className="mr-2 h-5 w-5 text-primary"/>Data Preprocessing (Python Script)</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-2 flex-grow flex flex-col min-h-0">
                <div className="flex-grow min-h-[200px]">
                    <CodeEditorPlaceholder title="s3_data_processor.py" defaultCode={preprocessingScript} language="python" />
                </div>
                <Button variant="default" onClick={handleRunPreprocessing} className="w-full"><Play className="mr-2 h-4 w-4" />Run Preprocessing (Simulate)</Button>
                <OutputPanelPlaceholder title="Preprocessing Output / Logs" initialOutput={preprocessingLogs} />
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Edit the Python script and run to simulate preprocessing. Results will update the chart and stats.</p>
            </CardFooter>
          </Card>
        </div>

        {/* Right Panel: Visualization, Stats, Athena */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="shadow-md">
            <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-base flex items-center"><BarChartBig className="mr-2 h-5 w-5 text-primary"/>Timeseries Visualization</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <PlotlyChart data={timeseriesPlotData} layout={timeseriesPlotLayout} />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
             <CardHeader className="py-3 px-4 border-b"><CardTitle className="text-base flex items-center"><Cpu className="mr-1 h-4 w-4"/>Statistical Summary</CardTitle></CardHeader>
             <CardContent className="p-4 text-sm grid grid-cols-2 gap-2">
                <p><span className="font-semibold text-muted-foreground">Count:</span> {timeseriesStats.count?.toFixed(0) ?? 'N/A'}</p>
                <p><span className="font-semibold text-muted-foreground">Mean:</span> {timeseriesStats.mean?.toFixed(2) ?? 'N/A'}</p>
                <p><span className="font-semibold text-muted-foreground">Min:</span> {timeseriesStats.min?.toFixed(2) ?? 'N/A'}</p>
                <p><span className="font-semibold text-muted-foreground">Max:</span> {timeseriesStats.max?.toFixed(2) ?? 'N/A'}</p>
                <p><span className="font-semibold text-muted-foreground">Std Dev:</span> {timeseriesStats.std?.toFixed(2) ?? 'N/A'}</p>
             </CardContent>
          </Card>

          <Card className="shadow-md flex flex-col flex-grow min-h-[300px]">
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base flex items-center"><DatabaseZap className="mr-2 h-5 w-5 text-primary"/>AWS Athena Querying</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 flex-grow flex flex-col min-h-0">
                <Label htmlFor="athenaQuery">SQL Query (Athena)</Label>
                <div className="flex-grow min-h-[100px]">
                    <Textarea 
                        id="athenaQuery" 
                        value={athenaQuery}
                        onChange={(e) => setAthenaQuery(e.target.value)}
                        className="font-mono text-xs h-full resize-none"
                        placeholder="SELECT * FROM hvac_data_prod.sensor_timeseries_data LIMIT 10;"
                    />
                </div>
                <Button variant="default" className="w-full" onClick={handleRunAthenaQuery}><Play className="mr-2 h-4 w-4"/>Run Athena Query (Simulate)</Button>
                <Label>Query Results:</Label>
                <ScrollArea className="h-[150px] border rounded-md bg-muted/30">
                  {athenaResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(athenaResults[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {athenaResults.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {Object.values(row).map((val, cellIndex) => <TableCell key={cellIndex}>{String(val)}</TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="p-2 text-xs text-muted-foreground">{athenaQueryStatus}</p>
                  )}
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">Write Athena SQL queries to analyze historical data from S3. Results can be visualized.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
