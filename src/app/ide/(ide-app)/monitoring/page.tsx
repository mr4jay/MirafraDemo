"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, DatabaseZap, Layers3, ShieldAlert, ServerCrash, BrainCircuit, Pipeline, BellRing, RefreshCcw, MessageSquare, GitFork, Users } from "lucide-react"; 
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const mockAthenaQueries = [
  { id: "q1-alpha", submitted: "10:05:12 UTC", status: "SUCCEEDED", runtime: "2.3s", dataScanned: "10.5 MB", cost: "$0.000053", query: "SELECT COUNT(*) FROM hvac_processed_data WHERE zone='A'..." },
  { id: "q2-beta", submitted: "10:03:45 UTC", status: "FAILED", runtime: "0.5s", dataScanned: "1.2 MB", cost: "$0.000006", query: "SELECT AVG(temperature) FROM hvac_raw_data WHERE sensor_id='temp001' AND date_part('hour', timestamp) = 10..." },
  { id: "q3-gamma", submitted: "10:02:01 UTC", status: "RUNNING", runtime: "15.1s", dataScanned: "50.2 MB", cost: "$0.000251", query: "SELECT * FROM hvac_anomaly_logs ORDER BY timestamp DESC LIMIT 10..." },
  { id: "q4-delta", submitted: "09:55:30 UTC", status: "CANCELLED", runtime: "30.0s", dataScanned: "150 MB", cost: "$0.000750", query: "SELECT DISTINCT sensor_id FROM hvac_raw_data..." },
];

const mockLambdaLogs = [
  "[INFO] 2025-05-13T10:05:03Z Cold start complete for preprocess-hvac-data (Version: $LATEST).",
  "[INFO] 2025-05-13T10:05:04Z Processing S3 event for object: raw/temp_sensor001_20250513100500.json",
  "[WARN] 2025-05-13T10:05:05Z Interpolated 2 missing values out of 100 records.",
  "[INFO] 2025-05-13T10:05:06Z Successfully processed 98 valid records. Data saved to DynamoDB table: SensorDataProcessed.",
  "[ERROR] 2025-05-13T10:10:15Z control-algo-heuristic: Timeout after 3000ms. Event: {'sensor_id': 'zone_b_temp', 'current_value': 28.5}",
  "[INFO] 2025-05-13T10:12:00Z sagemaker-invoke-optimizer: Prediction latency: 120ms for endpoint: hvac-lstm-v2-endpoint"
];

const mockActiveAlerts = [
    { id: "alert-001", severity: "P1 (Critical)", service: "AWS Lambda", metric: "Error Rate > 5%", resource: "control-algo-heuristic", time: "2m ago", status: "Active" },
    { id: "alert-002", severity: "P2 (Warning)", service: "AWS SageMaker", metric: "Endpoint Latency p90 > 500ms", resource: "hvac-lstm-v2-endpoint", time: "5m ago", status: "Active" },
    { id: "alert-003", severity: "P2 (Warning)", service: "AWS Athena", metric: "Query Scan > 1TB", resource: "User: 'data_analyst_01'", time: "15m ago", status: "Active"},
];

export default function MonitoringPage() {
  return (
    <div className="flex flex-col h-full gap-6 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Activity className="mr-2 h-6 w-6 text-primary"/>Real-Time Monitoring Dashboard</CardTitle>
          <CardDescription>Monitor code execution, data analytics pipelines, AWS resource utilization, and alerts for the HVAC Optimizer system. Data is sourced from CloudWatch Metrics, CloudWatch Logs (queried via Athena or Log Insights), SageMaker Monitoring, and AWS Health Dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="timeRangeSelect" className="text-sm">Time Range:</Label>
            <Select defaultValue="last_1_hour" name="timeRangeSelect">
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_15_min">Last 15 Minutes</SelectItem>
                <SelectItem value="last_1_hour">Last 1 Hour</SelectItem>
                <SelectItem value="last_6_hours">Last 6 Hours</SelectItem>
                <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm"><RefreshCcw className="mr-2 h-4 w-4"/>Refresh Dashboard</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Lambda Execution Monitoring */}
        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Activity className="h-5 w-5 text-purple-500 mr-2" /> AWS Lambda Execution</CardTitle>
            <CardDescription className="text-xs">Metrics from CloudWatch for core functions (e.g., `preprocess-hvac-data`, `control-algo-heuristic`). Includes invocations, errors, duration (avg, p90, max), and memory usage.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
            <div className="w-full h-[150px] bg-muted/30 rounded-md flex items-center justify-center data-ai-hint='lambda metrics chart'" >
                <Image src="https://picsum.photos/seed/lambdaMetrics/350/150" alt="Lambda Metrics Chart Placeholder" width={350} height={150} className="rounded-md object-cover" />
            </div>
            <p className="text-xs text-muted-foreground text-center">Plotly.js Chart: Invocations/Errors/Avg Duration over selected time range.</p>
          </CardContent>
        </Card>

        {/* Athena Query Monitoring */}
        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><DatabaseZap className="h-5 w-5 text-blue-500 mr-2" /> AWS Athena Queries</CardTitle>
            <CardDescription className="text-xs">Monitor query performance from Athena Query History or CloudWatch Events for Athena. Metrics: execution time, data scanned, cost. Data logs can be stored in S3 and queried via Athena for deeper analysis.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
            <div className="w-full h-[150px] bg-muted/30 rounded-md flex items-center justify-center data-ai-hint='athena query chart'">
                 <Image src="https://picsum.photos/seed/athenaQueries/350/150" alt="Athena Query Metrics Chart Placeholder" width={350} height={150} className="rounded-md object-cover" />
            </div>
             <p className="text-xs text-muted-foreground text-center">Plotly.js Chart: Query Runtime Distribution / Data Scanned over Time.</p>
          </CardContent>
        </Card>

        {/* SageMaker Endpoint Monitoring */}
        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><BrainCircuit className="h-5 w-5 text-orange-500 mr-2" /> SageMaker Endpoints</CardTitle>
            <CardDescription className="text-xs">CloudWatch metrics for deployed ML models: latency (avg, p90), invocations, error rates (4xx, 5xx), CPU/Memory utilization.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
            <div className="w-full h-[150px] bg-muted/30 rounded-md flex items-center justify-center data-ai-hint='sagemaker endpoint chart'">
                 <Image src="https://picsum.photos/seed/sagemakerEndpoints/350/150" alt="SageMaker Metrics Chart Placeholder" width={350} height={150} className="rounded-md object-cover" />
            </div>
            <p className="text-xs text-muted-foreground text-center">Plotly.js Chart: Endpoint Latency (p90) and Invocation Count.</p>
            <p className="text-xs mt-1">Endpoint: `hvac-lstm-v2-prod` - Status: <Badge variant="default" className="bg-green-500/20 text-green-700">Healthy</Badge></p>
          </CardContent>
        </Card>
        
        {/* Data Pipeline Status */}
         <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Pipeline className="h-5 w-5 text-cyan-500 mr-2" /> Data Pipeline Status</CardTitle>
            <CardDescription className="text-xs">Monitor health of data ingestion (e.g., S3 put events via CloudTrail/CloudWatch Events) and preprocessing Lambda success/failure rates.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2 text-center">
            <div className="w-full h-[150px] bg-muted/30 rounded-md flex items-center justify-center data-ai-hint='data pipeline chart'">
                 <Image src="https://picsum.photos/seed/dataPipeline/350/150" alt="Data Pipeline Chart Placeholder" width={300} height={120} className="rounded-md object-cover" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Plotly.js Chart: S3 Ingestion Rate (objects/min) / Preprocessing Lambda Success Rate (%).</p>
            <p className="text-xs mt-1">S3 Ingestion (`s3://hvac-data/raw/`): 1000 msgs/min | Preprocessing Lambda (`preprocess-hvac-data`): 99.9% success</p>
          </CardContent>
        </Card>

        {/* System Logs & Errors */}
        <Card className="md:col-span-2 lg:col-span-2 flex flex-col shadow-lg">
           <CardHeader>
            <CardTitle className="text-lg flex items-center"><ServerCrash className="h-5 w-5 text-red-500 mr-2" /> Aggregated System Logs & Errors</CardTitle>
            <CardDescription className="text-xs">Critical logs from CloudWatch Logs. For deep analysis, logs are exported to S3 and queried via Athena. Filtering by service, severity, or time range available.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 space-y-2">
            <Label htmlFor="logFilterService">Filter by Service/Keyword:</Label>
            <Input id="logFilterService" placeholder="e.g., control-algo-heuristic, ERROR, timeout" className="h-8 text-xs"/>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2 text-xs bg-muted/30">
              <pre className="font-mono whitespace-pre-wrap break-all">
                {mockLambdaLogs.join("\n")}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-lg flex items-center"><BellRing className="h-5 w-5 text-yellow-600 mr-2"/>Active System Alerts</CardTitle>
            <CardDescription className="text-xs">Real-time alerts triggered by CloudWatch Alarms based on predefined metrics and thresholds. Notifications are sent via AWS SNS (e.g., email, Slack integration).</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Severity</TableHead>
                        <TableHead className="text-xs">Service</TableHead>
                        <TableHead className="text-xs">Metric / Condition</TableHead>
                        <TableHead className="text-xs">Resource</TableHead>
                        <TableHead className="text-xs">Time Triggered</TableHead>
                        <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockActiveAlerts.map(alert => (
                        <TableRow key={alert.id}>
                            <TableCell><Badge variant={alert.severity.startsWith("P1") ? "destructive" : "secondary"} className="text-xs">{alert.severity}</Badge></TableCell>
                            <TableCell className="text-xs">{alert.service}</TableCell>
                            <TableCell className="text-xs">{alert.metric}</TableCell>
                            <TableCell className="text-xs font-mono">{alert.resource}</TableCell>
                            <TableCell className="text-xs">{alert.time}</TableCell>
                            <TableCell className="text-right text-xs"><Badge variant="default" className="bg-orange-500/20 text-orange-700">{alert.status}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {/* Collaboration Hub - Conceptual */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Collaboration Hub</CardTitle>
          <CardDescription className="text-xs">Tools for team collaboration. Real-time code editing is part of the core Cloud9 IDE. Git integration is available via terminal or IDE Git panel.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>Team Chat (Conceptual)</h3>
            <p className="text-xs text-muted-foreground">Real-time chat via AWS API Gateway WebSockets and Lambda for message handling.</p>
            <div className="h-[150px] border rounded-md p-2 bg-muted/30 text-xs space-y-1 overflow-y-auto">
              <p><strong className="text-blue-600">Alice:</strong> Just pushed the new heuristic rules for Zone C. Can someone review?</p>
              <p><strong className="text-green-600">Bob:</strong> Sure, taking a look now. The performance dashboard is showing improved stability.</p>
              <p><strong className="text-purple-600">Charlie:</strong> @Alice Check the CloudWatch logs for `control-algo-heuristic`, seeing a few null pointer exceptions.</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type your message..." className="h-8 text-xs flex-grow"/>
              <Button size="sm" className="text-xs h-8">Send</Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center"><GitFork className="mr-2 h-4 w-4"/>Git Workflow & Version Control</h3>
            <p className="text-xs text-muted-foreground">
              Utilize standard Git practices for collaborative development. The IDE integrates with Git for versioning scripts, configurations, and notebooks.
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 pl-4">
              <li>Branching Strategy: `main` (production), `develop` (staging), `feature/descriptive-name` (development).</li>
              <li>Commits: Regular, atomic commits with clear messages. Automated commits for certain IDE actions (e.g., saving a major config change) could be set up via CI/CD hooks.</li>
              <li>Pull Requests: For code review and merging to `develop` and `main`.</li>
              <li>Example Git commands (via integrated terminal):
                <pre className="mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  git checkout -b feature/performance-alert-tuning<br/>
                  # ...make changes...<br/>
                  git add .<br/>
                  git commit -m "Tune CloudWatch alarms for Lambda latency"<br/>
                  git push origin feature/performance-alert-tuning
                </pre>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
