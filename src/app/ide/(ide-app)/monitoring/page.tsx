
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, DatabaseZap, Layers3, ShieldAlert, ServerCrash } from "lucide-react"; // Layers3 for CloudWatch like icon
import Image from "next/image"; // For chart placeholders

export default function MonitoringPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,8rem))] gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Monitoring Dashboard</CardTitle>
          <CardDescription>Monitor code execution, data analytics, and AWS resource utilization.</CardDescription>
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
          <Button variant="outline">Refresh Dashboard</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
        {/* Lambda Execution Monitoring */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-purple-500" /> Lambda Execution</CardTitle>
            <CardDescription>Invocations, errors, duration.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {/* Placeholder for Lambda metrics chart */}
            <div className="text-center">
                <Image src="https://picsum.photos/300/150?random=1" alt="Lambda Metrics Chart Placeholder" width={300} height={150} className="rounded-md data-ai-hint='lambda chart'" />
                <p className="text-xs text-muted-foreground mt-1">Lambda invocations/errors chart.</p>
            </div>
          </CardContent>
        </Card>

        {/* Athena Query Monitoring */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><DatabaseZap className="h-5 w-5 text-blue-500" /> Athena Queries</CardTitle>
            <CardDescription>Execution time, data scanned, cost.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
             {/* Placeholder for Athena metrics chart */}
            <div className="text-center">
                <Image src="https://picsum.photos/300/150?random=2" alt="Athena Query Metrics Chart Placeholder" width={300} height={150} className="rounded-md data-ai-hint='athena chart'" />
                <p className="text-xs text-muted-foreground mt-1">Athena query performance chart.</p>
            </div>
          </CardContent>
        </Card>

        {/* CloudWatch Resource Utilization */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Layers3 className="h-5 w-5 text-green-500" /> AWS Resource Usage</CardTitle>
            <CardDescription>CPU, memory, network for relevant services.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {/* Placeholder for CloudWatch metrics chart */}
            <div className="text-center">
                <Image src="https://picsum.photos/300/150?random=3" alt="CloudWatch Metrics Chart Placeholder" width={300} height={150} className="rounded-md data-ai-hint='cloudwatch chart'" />
                <p className="text-xs text-muted-foreground mt-1">Resource utilization chart.</p>
            </div>
          </CardContent>
        </Card>

        {/* Logs Viewer */}
        <Card className="md:col-span-2 lg:col-span-3 flex flex-col">
           <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ServerCrash className="h-5 w-5 text-red-500" /> System Logs & Errors</CardTitle>
            <CardDescription>Real-time logs from Lambda, application errors.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-[200px] md:h-full"> {/* Adjust height as needed */}
              <pre className="p-2 text-xs font-mono whitespace-pre-wrap break-all">
                [INFO] 2025-05-13T10:00:00Z Lambda cold start complete.
                [INFO] 2025-05-13T10:00:01Z Processing event for sensor_id: temp_001
                [WARN] 2025-05-13T10:00:05Z sensor_id: occupancy_003 reported unusual value: 255
                [ERROR] 2025-05-13T10:01:00Z Failed to connect to DynamoDB. Retrying...
                [INFO] 2025-05-13T10:01:05Z Successfully processed 10 events.
                {/* More log lines */}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
