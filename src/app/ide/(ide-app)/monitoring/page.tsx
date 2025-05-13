"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, DatabaseZap, Layers3, ShieldAlert, ServerCrash, BrainCircuit, Pipeline, BellRing, RefreshCcw } from "lucide-react"; 
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockAthenaQueries = [
  { id: "q1", submitted: "10:05:12", status: "SUCCEEDED", runtime: "2.3s", dataScanned: "10MB", cost: "$0.00005" },
  { id: "q2", submitted: "10:03:45", status: "FAILED", runtime: "0.5s", dataScanned: "1MB", cost: "$0.00001" },
  { id: "q3", submitted: "10:02:01", status: "RUNNING", runtime: "15.1s", dataScanned: "50MB", cost: "$0.00025" },
];

export default function MonitoringPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Activity className="mr-2 h-6 w-6 text-primary"/>Real-Time Monitoring Dashboard</CardTitle>
          <CardDescription>Monitor code execution, data analytics pipelines, AWS resource utilization, and alerts for the HVAC Optimizer system.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Select defaultValue="last_1_hour">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_15_min">Last 15 Minutes</SelectItem>
              <SelectItem value="last_1_hour">Last 1 Hour</SelectItem>
              <SelectItem value="last_6_hours">Last 6 Hours</SelectItem>
              <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><RefreshCcw className="mr-2 h-4 w-4"/>Refresh Dashboard</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow min-h-0">
        {/* Lambda Execution Monitoring */}
        <Card className="flex flex-col shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Activity className="h-5 w-5 text-purple-500" /> AWS Lambda Execution</CardTitle>
            <CardDescription className="text-xs">Invocations, errors, duration, memory usage for core functions.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-2">
            <Image src="https://picsum.photos/300/120?random=1" alt="Lambda Metrics Chart Placeholder" width={300} height={120} className="rounded-md data-ai-hint='lambda chart' mb-1" />
            <p className="text-xs text-muted-foreground mt-1">Invocations/Errors/Duration Chart</p>
            <CardTitle className="text-sm mt-2 mb-1">Real-time Lambda Logs (preprocess-hvac-data)</CardTitle>
            <ScrollArea className="h-[100px] w-full rounded-md border p-2 text-xs bg-muted/50">
                <pre className="font-mono whitespace-pre-wrap break-all">
                    [INFO] 2025-05-13T10:05:03Z Cold start complete.
                    [INFO] 2025-05-13T10:05:04Z Processing S3 event for object: temp_sensor001.json
                    [WARN] 2025-05-13T10:05:05Z Interpolated 2 missing values.
                    [INFO] 2025-05-13T10:05:06Z Data saved to DynamoDB.
                </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Athena Query Monitoring */}
        <Card className="flex flex-col shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><DatabaseZap className="h-5 w-5 text-blue-500" /> AWS Athena Queries</CardTitle>
            <CardDescription className="text-xs">Execution time, data scanned, cost for analytical queries.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-2">
             <Image src="https://picsum.photos/300/120?random=2" alt="Athena Query Metrics Chart Placeholder" width={300} height={120} className="rounded-md data-ai-hint='athena chart' mb-1" />
             <p className="text-xs text-muted-foreground mt-1">Query Runtime/Data Scanned Chart</p>
             <CardTitle className="text-sm mt-2 mb-1">Recent Athena Queries</CardTitle>
             <ScrollArea className="h-[100px] w-full">
                <Table>
                    <TableHeader>
                        <TableRow><TableHead className="h-6 p-1 text-xs">ID</TableHead><TableHead className="h-6 p-1 text-xs">Status</TableHead><TableHead className="h-6 p-1 text-xs">Runtime</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAthenaQueries.map(q => (
                            <TableRow key={q.id}>
                                <TableCell className="p-1 text-xs font-mono">{q.id}</TableCell>
                                <TableCell className="p-1 text-xs">
                                    <Badge variant={q.status === "SUCCEEDED" ? "default" : q.status === "FAILED" ? "destructive" : "secondary"} className="text-xs">{q.status}</Badge>
                                </TableCell>
                                <TableCell className="p-1 text-xs">{q.runtime}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </ScrollArea>
          </CardContent>
        </Card>

        {/* CloudWatch Resource Utilization */}
        <Card className="flex flex-col shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Layers3 className="h-5 w-5 text-green-500" /> AWS Resource Usage</CardTitle>
            <CardDescription className="text-xs">CPU, memory, network for S3, DynamoDB, API Gateway.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-2">
            <Image src="https://picsum.photos/300/120?random=3" alt="CloudWatch Metrics Chart Placeholder" width={300} height={120} className="rounded-md data-ai-hint='cloudwatch chart' mb-1" />
            <p className="text-xs text-muted-foreground mt-1">CPU/Memory/Network I/O Chart</p>
             <CardTitle className="text-sm mt-2 mb-1">Key Resource Status</CardTitle>
            <ul className="text-xs list-disc list-inside pl-2 w-full">
                <li>S3 (hvac-data): Healthy, 99.99% uptime</li>
                <li>DynamoDB (SensorData): Healthy, Avg Latency 5ms</li>
                <li>API Gateway: Healthy, Error Rate 0.01%</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* SageMaker Endpoint Monitoring */}
        <Card className="flex flex-col shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><BrainCircuit className="h-5 w-5 text-orange-500" /> SageMaker Endpoints</CardTitle>
            <CardDescription className="text-xs">Latency, invocations, errors for deployed ML models.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-2">
            <Image src="https://picsum.photos/300/120?random=4" alt="SageMaker Metrics Chart Placeholder" width={300} height={120} className="rounded-md data-ai-hint='sagemaker chart' mb-1" />
            <p className="text-xs text-muted-foreground mt-1">Endpoint Latency/Invocation/Error Rate Chart</p>
            <p className="text-xs mt-2">lstm_control_v1: Healthy, Avg Latency 150ms</p>
          </CardContent>
        </Card>

        {/* Data Pipeline Status */}
         <Card className="flex flex-col shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Pipeline className="h-5 w-5 text-cyan-500" /> Data Pipeline Status</CardTitle>
            <CardDescription className="text-xs">Health of S3 ingestion, preprocessing Lambda success rates.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-2 text-center">
             <Image src="https://picsum.photos/300/120?random=5" alt="Data Pipeline Chart Placeholder" width={300} height={120} className="rounded-md data-ai-hint='pipeline chart' mb-1" />
            <p className="text-xs text-muted-foreground mt-1">Ingestion Rate / Lambda Success Rate Chart</p>
            <p className="text-xs mt-2">S3 Ingestion: 1000 msgs/min | Preprocessing Lambda: 99.9% success</p>
          </CardContent>
        </Card>
        
        {/* System Logs & Errors */}
        <Card className="flex flex-col shadow-md">
           <CardHeader>
            <CardTitle className="text-lg flex items-center"><ServerCrash className="h-5 w-5 text-red-500" /> System Logs & Errors</CardTitle>
            <CardDescription className="text-xs">Aggregated critical logs from various services.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-2">
            <ScrollArea className="h-[150px] w-full rounded-md border p-2 text-xs bg-muted/50">
              <pre className="font-mono whitespace-pre-wrap break-all">
                [ERROR] 2025-05-13T10:15:00Z AthenaQueryFailed: q2 - Timeout.
                [WARN] 2025-05-13T10:16:00Z SageMakerEndpoint: lstm_control_v1 high latency detected (350ms).
                [CRITICAL] 2025-05-13T10:18:00Z DynamoDB:SensorData ProvisionedThroughputExceeded.
              </pre>
            </ScrollArea>
            <div className="mt-2 p-2 border rounded-md bg-background">
                 <h4 className="text-sm font-semibold flex items-center"><BellRing className="mr-2 h-4 w-4 text-yellow-500"/>Active Alerts</h4>
                 <p className="text-xs text-muted-foreground">Alerts are configured via SNS/CloudWatch Alarms.</p>
                 <ul className="text-xs list-disc list-inside pl-2 mt-1">
                    <li className="text-destructive">P1: DynamoDB capacity low (Triggered 2m ago)</li>
                    <li className="text-yellow-600">P2: SageMaker endpoint high p90 latency (Triggered 5m ago)</li>
                 </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
