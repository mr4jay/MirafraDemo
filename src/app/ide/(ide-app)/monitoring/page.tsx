
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, DatabaseZap, BrainCircuit, Pipeline, ServerCrash, BellRing, RefreshCcw, MessageSquare, GitFork, Users, AlertTriangle, Cpu, MemoryStick, BarChart, LineChartIcon, Wifi, WifiOff } from "lucide-react"; 
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js-dist-min';
import { cn } from "@/lib/utils";
import type { ChatMessage } from '@/types'; // Import ChatMessage type
import { useToast } from "@/hooks/use-toast";


const PlotlyChart = dynamic(() => import('@/components/ide/plotly-chart'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full flex items-center justify-center bg-muted/30 rounded-md"><p className="text-muted-foreground">Loading chart...</p></div>,
});

// Mock data for Lambda metrics
const generateLambdaMetrics = (metricName: string, timePoints: string[]): Data => {
  return {
    x: timePoints,
    y: timePoints.map(() => Math.random() * (metricName === 'Errors' ? 5 : metricName === 'Duration' ? 500 : 100)),
    type: 'scatter',
    mode: 'lines+markers',
    name: metricName,
    marker: { color: metricName === 'Invocations' ? 'hsl(var(--chart-1))' : metricName === 'Errors' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))' }
  };
};

const mockAthenaQueries = [
  { id: "q1-alpha", submitted: "10:05:12 UTC", status: "SUCCEEDED", runtime: "2.3s", dataScanned: "10.5 MB", cost: "$0.000053", query: "SELECT COUNT(*) FROM cloudwatch_logs.lambda_errors_2025_05_13 WHERE function_name = 'preprocess-hvac-data' AND log_level = 'ERROR'..." },
  { id: "q2-beta", submitted: "10:03:45 UTC", status: "FAILED", runtime: "0.5s", dataScanned: "1.2 MB", cost: "$0.000006", query: "SELECT AVG(duration_ms) FROM cloudwatch_logs.lambda_performance_2025_05_13 WHERE function_name = 'control-algo-heuristic'..." },
  { id: "q3-gamma", submitted: "10:02:01 UTC", status: "RUNNING", runtime: "15.1s", dataScanned: "50.2 MB", cost: "$0.000251", query: "SELECT * FROM sagemaker_training_logs.hvac_lstm_v3_logs ORDER BY timestamp DESC LIMIT 10..." },
];

const mockLambdaLogs = [
  "[INFO] 2025-05-13T10:05:03Z Cold start complete for preprocess-hvac-data (Version: $LATEST). Duration: 1203ms. Memory Used: 128MB.",
  "[METRIC] 2025-05-13T10:05:04Z preprocess-hvac-data: Rows processed: 1000, Input S3 Object: raw/temp_sensor001_20250513100500.json",
  "[WARN] 2025-05-13T10:05:05Z preprocess-hvac-data: Interpolated 2 missing values out of 1000 records.",
  "[INFO] 2025-05-13T10:05:06Z Successfully processed 998 valid records. Data saved to DynamoDB table: SensorDataProcessed_IDE.",
  "[ERROR] 2025-05-13T10:10:15Z control-algo-heuristic: Timeout after 3000ms. Event: {'sensor_id': 'zone_b_temp', 'current_value': 28.5}. RequestID: abc-123",
  "[INFO] 2025-05-13T10:12:00Z sagemaker-invoke-optimizer: Prediction latency: 120ms for endpoint: hvac-lstm-v2-endpoint. Input features: 24.",
  "[METRIC] 2025-05-13T10:12:01Z ai_ml_model_hvac_lstm_v2: Prediction accuracy (simulated): 92.5%, Input Shape: (1, 24, 5)"
];

const mockActiveAlerts = [
    { id: "alert-001", severity: "P1 (Critical)", service: "AWS Lambda", metric: "Error Rate > 5%", resource: "control-algo-heuristic", time: "2m ago", status: "Active", details: "Function 'control-algo-heuristic' error rate exceeded 5% threshold for 5 consecutive minutes. Check CloudWatch Logs for RequestID: abc-123." },
    { id: "alert-002", severity: "P2 (Warning)", service: "AWS SageMaker", metric: "Endpoint Latency p90 > 500ms", resource: "hvac-lstm-v2-endpoint", time: "5m ago", status: "Active", details: "SageMaker endpoint 'hvac-lstm-v2-endpoint' p90 latency is 550ms, exceeding the 500ms threshold. Possible model drift or resource contention." },
    { id: "alert-003", severity: "P2 (Warning)", service: "AWS Athena", metric: "Query Scan > 1TB", resource: "User: 'data_analyst_01'", time: "15m ago", status: "Active", details: "Athena query initiated by 'data_analyst_01' scanned 1.2TB of data. Review query for optimization."},
    { id: "alert-004", severity: "P3 (Info)", service: "Data Pipeline", metric: "S3 Ingestion Latency > 1min", resource: "s3://hvac-data/raw/", time: "30m ago", status: "Resolved", details: "Data ingestion from S3 to preprocessing Lambda experienced a temporary latency spike, now resolved."},
];

const commonLayoutOptions: Partial<Layout> = {
  paper_bgcolor: 'hsl(var(--card))',
  plot_bgcolor: 'hsl(var(--card))',
  font: { color: 'hsl(var(--card-foreground))' },
  xaxis: { gridcolor: 'hsl(var(--border))', linecolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--border))', type: 'category' },
  yaxis: { gridcolor: 'hsl(var(--border))', linecolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--border))'},
  margin: { l: 40, r: 20, b: 30, t: 30 },
  showlegend: true,
  legend: { bgcolor: 'hsla(var(--card), 0.5)', bordercolor: 'hsl(var(--border))' }
};

// Placeholder WebSocket URL - replace with your actual API Gateway WebSocket URL
const CHAT_WEBSOCKET_URL = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL || 'wss://your-chat-api-gateway-endpoint.example.com/production';


export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState("last_1_hour");
  const [timePoints, setTimePoints] = useState<string[]>([]);
  const [lambdaMetricsData, setLambdaMetricsData] = useState<Data[]>([]);
  const [athenaQueryLog, setAthenaQueryLog] = useState<string[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatConnected, setIsChatConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();


  useEffect(() => {
    const now = Date.now();
    let points: string[] = [];
    const interval = timeRange === 'last_15_min' ? 1 : timeRange === 'last_1_hour' ? 5 : 30; // minutes
    const numPoints = timeRange === 'last_15_min' ? 15 : timeRange === 'last_1_hour' ? 12 : 12;
    
    for (let i = numPoints -1; i >=0; i--) {
        points.push(new Date(now - i * interval * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}));
    }
    setTimePoints(points);
  }, [timeRange]);

  useEffect(() => {
    if (timePoints.length > 0) {
      setLambdaMetricsData([
        generateLambdaMetrics('Invocations', timePoints),
        generateLambdaMetrics('Errors', timePoints),
        generateLambdaMetrics('Duration', timePoints),
      ]);
    }
  }, [timePoints]);

  // WebSocket connection for chat
  useEffect(() => {
    if (!CHAT_WEBSOCKET_URL.includes('your-chat-api-gateway-endpoint.example.com')) {
      ws.current = new WebSocket(CHAT_WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('Chat WebSocket connected');
        setIsChatConnected(true);
        toast({ title: "Chat Connected", description: "Successfully connected to the real-time chat server.", variant: "default" });
        // Example: send a join message or authentication token if required by backend
        // ws.current?.send(JSON.stringify({ action: 'join', user: 'Engineer-IDE' }));
      };

      ws.current.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data as string);
          // Assuming the server sends messages in ChatMessage format or similar
          // You might need to adapt this based on your backend's message structure
          if (messageData.user && messageData.text && messageData.time) {
             setChatMessages(prev => [...prev, { ...messageData, id: messageData.id || Date.now().toString() + Math.random().toString() }]);
          } else {
            console.warn("Received malformed message from WebSocket:", messageData);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
           setChatMessages(prev => [...prev, { id: Date.now().toString(), user: 'System', text: event.data as string, time: new Date().toLocaleTimeString(), isLocalUser: false }]);
        }
      };

      ws.current.onclose = () => {
        console.log('Chat WebSocket disconnected');
        setIsChatConnected(false);
        toast({ title: "Chat Disconnected", description: "Connection to the chat server was closed.", variant: "destructive" });
      };

      ws.current.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        setIsChatConnected(false);
        toast({ title: "Chat Connection Error", description: "Could not connect to the chat server. Please check the console.", variant: "destructive" });
      };

      return () => {
        ws.current?.close();
      };
    } else {
        console.warn("Chat WebSocket URL is a placeholder. Real-time chat will not function.");
        toast({ title: "Chat Offline", description: "Chat server URL is not configured. Real-time chat disabled.", variant: "default"});
    }
  }, [toast]);
  
  // Auto-scroll chat messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatMessages]);


  const handleRefresh = () => {
    const now = Date.now();
    let points: string[] = [];
    const interval = timeRange === 'last_15_min' ? 1 : timeRange === 'last_1_hour' ? 5 : 30;
    const numPoints = timeRange === 'last_15_min' ? 15 : timeRange === 'last_1_hour' ? 12 : 12;
    for (let i = numPoints -1; i >=0; i--) {
        points.push(new Date(now - i * interval * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}));
    }
    setTimePoints(points);
    setAthenaQueryLog(prev => [...prev, `Refreshed Athena Query log at ${new Date().toLocaleTimeString()}`]);
    toast({ title: "Dashboard Refreshed", description: "Monitoring data has been updated.", variant: "default"});
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const message: ChatMessage = {
        id: Date.now().toString() + Math.random().toString(), // Temporary client-side ID
        user: 'Engineer-IDE', // Replace with actual username
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLocalUser: true,
      };
      // Backend should ideally assign final ID and broadcast.
      // For now, add to local state immediately for responsiveness.
      setChatMessages(prev => [...prev, message]);
      
      // Send to WebSocket server
      // The server should then broadcast this message to other connected clients.
      // The server might also echo the message back to this client, in which case
      // you'd need logic to avoid duplicating messages (e.g., by checking message IDs).
      ws.current.send(JSON.stringify({ action: 'sendMessage', data: { user: message.user, text: message.text } })); // Example action format
      setChatInput('');
    } else if (!isChatConnected) {
        toast({ title: "Chat Offline", description: "Cannot send message. Not connected to chat server.", variant: "destructive" });
    }
  };

  const lambdaChartLayout: Partial<Layout> = { ...commonLayoutOptions, title: { text: 'Lambda Performance Over Time', font: { size: 14}} };
  const athenaChartLayout: Partial<Layout> = { ...commonLayoutOptions, title: { text: 'Athena Query Performance (Simulated)', font: { size: 14}}, yaxis: { ...commonLayoutOptions.yaxis, title: { text: 'Runtime (s) / Data Scanned (MB)'}} };
  const sagemakerChartLayout: Partial<Layout> = { ...commonLayoutOptions, title: { text: 'SageMaker Endpoint Performance (Simulated)', font: {size: 14}}, yaxis: { ...commonLayoutOptions.yaxis, title: { text: 'Latency (ms) / Invocation Rate'}} };
  const dataPipelineLayout: Partial<Layout> = { ...commonLayoutOptions, title: { text: 'Data Pipeline Throughput (Simulated)', font: {size: 14}}, yaxis: { ...commonLayoutOptions.yaxis, title: { text: 'Objects/min / Success Rate (%)'}} };


  return (
    <div className="flex flex-col h-full gap-6 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Activity className="mr-2 h-6 w-6 text-primary"/>IDE Real-Time Monitoring Dashboard</CardTitle>
          <CardDescription>Monitor code execution, data analytics pipelines, AWS resource utilization, and alerts for the HVAC Optimizer system. Data is sourced from CloudWatch, Athena (for S3 logs), SageMaker Monitoring, and AWS Health Dashboard (conceptual).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="timeRangeSelectMonitoring" className="text-sm">Time Range:</Label>
            <Select value={timeRange} onValueChange={setTimeRange} name="timeRangeSelectMonitoring">
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
          <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCcw className="mr-2 h-4 w-4"/>Refresh Dashboard</Button>
        </CardContent>
      </Card>

      {/* Metrics Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Activity className="h-5 w-5 text-purple-500 mr-2" /> AWS Lambda Execution Metrics</CardTitle>
            <CardDescription className="text-xs">CloudWatch metrics for core functions (e.g., `preprocess-hvac-data`, `control-algo-heuristic`). Showing Invocations, Errors, Avg. Duration. Memory usage and other detailed metrics available via CloudWatch console link (conceptual).</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
            <PlotlyChart data={lambdaMetricsData} layout={lambdaChartLayout} />
            <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2">
                <div><Cpu className="mx-auto h-4 w-4 mb-1 text-muted-foreground" />Avg CPU: 35%</div>
                <div><MemoryStick className="mx-auto h-4 w-4 mb-1 text-muted-foreground" />Avg Mem: 150MB</div>
                <div><AlertTriangle className="mx-auto h-4 w-4 mb-1 text-destructive" />Cold Starts: 5</div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><DatabaseZap className="h-5 w-5 text-blue-500 mr-2" /> AWS Athena Query Analytics</CardTitle>
            <CardDescription className="text-xs">Monitor query performance on S3-stored logs/data. Metrics: execution time, data scanned, cost. Example: Analyzing Lambda error logs stored in S3.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
            <PlotlyChart 
                data={[{ x: mockAthenaQueries.map(q=>q.id), y: mockAthenaQueries.map(q=>parseFloat(q.runtime)), type: 'bar', name: 'Runtime (s)', marker: { color: 'hsl(var(--chart-4))'} },
                       { x: mockAthenaQueries.map(q=>q.id), y: mockAthenaQueries.map(q=>parseFloat(q.dataScanned)), type: 'bar', name: 'Data Scanned (MB)', yaxis:'y2', marker: { color: 'hsl(var(--chart-5))'} }]} 
                layout={{...athenaChartLayout, yaxis2: { overlaying: 'y', side: 'right', title: 'Data Scanned (MB)'}}} 
            />
            <ScrollArea className="h-[100px] text-xs border p-1 rounded-md bg-muted/20">
                {mockAthenaQueries.map(q => <div key={q.id} className="truncate"><strong>{q.id} ({q.status}):</strong> {q.query}</div>)}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><BrainCircuit className="h-5 w-5 text-orange-500 mr-2" /> SageMaker Endpoint Performance</CardTitle>
            <CardDescription className="text-xs">CloudWatch metrics for deployed ML models: latency (avg, p90), invocations, error rates (4xx, 5xx), CPU/Memory utilization. Example: LSTM model for energy prediction.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
             <PlotlyChart 
                data={[{ x: timePoints, y: timePoints.map(() => Math.random() * 200 + 50), type: 'scatter', name: 'P90 Latency (ms)', marker: {color: 'hsl(var(--chart-1))'}},
                       { x: timePoints, y: timePoints.map(() => Math.random() * 10 + 1), type: 'bar', name: 'Invocations/sec', yaxis: 'y2', marker: {color: 'hsl(var(--chart-2))'}}]} 
                layout={{...sagemakerChartLayout, yaxis2: { overlaying: 'y', side: 'right', title: 'Invocations/sec'}}} 
            />
            <p className="text-xs mt-1">Endpoint: `hvac-lstm-v3-prod` - Status: <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">Healthy</Badge> | Accuracy (last eval): 91.7%</p>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Pipeline className="h-5 w-5 text-cyan-500 mr-2" /> Data Processing Pipeline Metrics</CardTitle>
            <CardDescription className="text-xs">Monitor health of data ingestion (e.g., S3 put events) and preprocessing Lambda success/failure rates. Rows processed, transformation times.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 space-y-2">
            <PlotlyChart 
                data={[{ x: timePoints, y: timePoints.map(() => Math.random() * 1000 + 500), type: 'line', name: 'S3 Objects/min', marker: {color: 'hsl(var(--chart-3))'} },
                       { x: timePoints, y: timePoints.map(() => Math.random() * 5 + 95), type: 'line', name: 'Preprocessing Success (%)', yaxis: 'y2', marker: {color: 'hsl(var(--chart-4))'} }]} 
                layout={{...dataPipelineLayout, yaxis2: { overlaying: 'y', side: 'right', title: 'Success Rate (%)'}}} 
            />
            <p className="text-xs mt-1 text-center">S3 Ingestion (`s3://hvac-data/raw/`): 1200 obj/min | Preprocessing Lambda (`preprocess-hvac-data`): 99.8% success | Avg. Rows Processed/Lambda: 950</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2 flex flex-col shadow-lg">
           <CardHeader>
            <CardTitle className="text-lg flex items-center"><ServerCrash className="h-5 w-5 text-red-500 mr-2" /> Aggregated System & Algorithm Logs</CardTitle>
            <CardDescription className="text-xs">Critical logs from CloudWatch Logs, filterable. For deep analysis, logs are exported to S3 and queried via Athena (see Athena panel). Includes algorithm decision logs, data processing steps, and errors.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 space-y-2 flex flex-col">
            <div className="flex gap-2 items-center">
                <Label htmlFor="logFilterService" className="text-sm shrink-0">Filter by Service/Keyword:</Label>
                <Input id="logFilterService" placeholder="e.g., control-algo-heuristic, ERROR, timeout, sensor_id_123" className="h-8 text-xs flex-grow"/>
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2 text-xs bg-muted/30 flex-grow">
              <pre className="font-mono whitespace-pre-wrap break-all">
                {mockLambdaLogs.join("\n")}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-lg flex items-center"><BellRing className="h-5 w-5 text-yellow-500 mr-2"/>Active & Recent System Alerts (via SNS)</CardTitle>
            <CardDescription className="text-xs">Real-time alerts triggered by CloudWatch Alarms based on predefined metrics and thresholds (e.g., high Lambda latency, SageMaker endpoint errors, Athena query over-spend). Notifications conceptually sent via AWS SNS to email/Slack.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[200px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs w-[80px]">Severity</TableHead>
                            <TableHead className="text-xs w-[120px]">Service</TableHead>
                            <TableHead className="text-xs">Metric / Condition</TableHead>
                            <TableHead className="text-xs w-[150px]">Resource</TableHead>
                            <TableHead className="text-xs w-[80px]">Time</TableHead>
                            <TableHead className="text-xs w-[100px] text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockActiveAlerts.map(alert => (
                            <TableRow key={alert.id} className={alert.status === 'Active' && alert.severity.startsWith("P1") ? 'bg-destructive/10 hover:bg-destructive/20' : alert.status === 'Active' ? 'bg-yellow-500/10 hover:bg-yellow-500/20' : ''}>
                                <TableCell><Badge variant={alert.severity.startsWith("P1") ? "destructive" : "secondary"} className="text-xs">{alert.severity}</Badge></TableCell>
                                <TableCell className="text-xs">{alert.service}</TableCell>
                                <TableCell className="text-xs">{alert.metric} ({alert.details.substring(0,50)}...)</TableCell>
                                <TableCell className="text-xs font-mono">{alert.resource}</TableCell>
                                <TableCell className="text-xs">{alert.time}</TableCell>
                                <TableCell className="text-right text-xs">
                                    <Badge variant={alert.status === 'Active' ? (alert.severity.startsWith("P1") ? "destructive" : "default") : "outline"} 
                                           className={cn(alert.status === 'Active' && !alert.severity.startsWith("P1") && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
                                                        alert.status === 'Resolved' && 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20')}>
                                        {alert.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-indigo-500"/>Collaboration Hub</CardTitle>
          <CardDescription className="text-xs">Tools for team collaboration. Real-time code editing is inherent to Cloud9. Git integration is available via the integrated terminal or Cloud9's Git panel. Automated commits for specific IDE actions (e.g., saving major configurations) can be conceptually set up via CI/CD hooks triggered by S3/DynamoDB events.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-indigo-500"/>Team Chat
                {isChatConnected ? <Wifi className="ml-2 h-4 w-4 text-green-500" /> : <WifiOff className="ml-2 h-4 w-4 text-red-500" />}
            </h3>
            <p className="text-xs text-muted-foreground">
                Real-time chat (client-side implementation). Backend requires AWS API Gateway WebSockets, Lambda, and DynamoDB.
                Current Status: {isChatConnected ? <span className="text-green-600 font-semibold">Connected</span> : <span className="text-red-600 font-semibold">Disconnected</span>}
            </p>
            <ScrollArea className="h-[200px] border rounded-md p-3 bg-muted/30 text-xs space-y-2" ref={scrollAreaRef}>
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn("p-1.5 rounded-md shadow-sm flex flex-col", msg.isLocalUser ? "bg-primary/10 items-end ml-auto" : "bg-background items-start mr-auto")} style={{maxWidth: '80%'}}>
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn("font-semibold", msg.isLocalUser ? "text-primary" : "text-indigo-600")}>{msg.user}</span> 
                    <span className="text-gray-500 text-[10px]">({msg.time})</span>
                  </div>
                  <p className="text-foreground break-words">{msg.text}</p>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet. Start a conversation!</p>}
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea 
                placeholder={isChatConnected ? "Type your message..." : "Chat disconnected..."}
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                className="h-20 text-xs flex-grow resize-none"
                disabled={!isChatConnected}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessage();}}}
              />
              <Button size="sm" className="text-xs h-auto self-end" onClick={handleSendChatMessage} disabled={!isChatConnected || !chatInput.trim()}>Send</Button>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center"><GitFork className="mr-2 h-4 w-4 text-indigo-500"/>Git Workflow & Version Control</h3>
            <p className="text-xs text-muted-foreground">
              Utilize standard Git practices for collaborative development. The IDE integrates with Git (via Cloud9 terminal/UI) for versioning scripts, configurations, and notebooks. Key AWS configurations (CloudFormation, Lambda function code, SageMaker training scripts) should be version-controlled.
            </p>
            <div className="text-xs space-y-1">
              <p><strong>Branching Strategy:</strong></p>
              <ul className="list-disc list-inside pl-4 text-muted-foreground">
                <li><code>main</code>: Production-ready, stable code and configurations. Deploys from here are highly controlled.</li>
                <li><code>develop</code>: Integration branch for features. Staging deployments are made from here.</li>
                <li><code>feature/descriptive-name</code>: For new features or bug fixes (e.g., <code>feature/athena-log-parser</code>, <code>fix/lambda-timeout-heuristic</code>).</li>
              </ul>
              <p className="mt-2"><strong>Commit Practices:</strong></p>
              <ul className="list-disc list-inside pl-4 text-muted-foreground">
                <li>Atomic commits with clear, descriptive messages (e.g., "feat(lambda): Add error handling for S3 event").</li>
                <li>Link commits to Jira issues if applicable.</li>
                <li>Conceptual: Automated commits for certain IDE actions (e.g., saving a CloudFormation stack from the Config Manager) could trigger a Git commit via a backend hook.</li>
              </ul>
              <p className="mt-2"><strong>Pull Requests (PRs):</strong></p>
              <ul className="list-disc list-inside pl-4 text-muted-foreground">
                <li>Required for merging <code>feature/*</code> branches into <code>develop</code>, and <code>develop</code> into <code>main</code>.</li>
                <li>Require at least one reviewer. Automated tests (Pytest, linters) should pass.</li>
              </ul>
              <p className="mt-2"><strong>Example Git commands (via integrated Cloud9 terminal):</strong></p>
                <pre className="mt-1 p-2 bg-gray-800 text-gray-300 rounded text-xs font-mono overflow-x-auto">
{`git checkout develop
git pull origin develop
git checkout -b feature/optim-cost-weight-tuning
# ...make changes to optimization_control.py and related configs...
git add src/python_scripts/optimization_control_template.py src/app/ide/(ide-app)/config-manager/page.tsx
git commit -m "feat(optim): Tune cost vs comfort weights for optimization algorithm"
git push origin feature/optim-cost-weight-tuning
# ...then create PR on GitHub/CodeCommit...`}
                </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

