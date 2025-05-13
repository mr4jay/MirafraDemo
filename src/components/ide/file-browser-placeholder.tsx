
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, Table2 } from "lucide-react";

interface FileBrowserPlaceholderProps {
  title: string;
  browserType: "s3" | "dynamodb";
}

const mockS3Files = [
  { name: "hvac-data/", type: "folder", children: [
    { name: "2025/", type: "folder", children: [
      { name: "05/", type: "folder", children: [
        { name: "13/", type: "folder", children: [
          { name: "temp_sensor001.json", type: "file" },
          { name: "occupancy_sensor002.parquet", type: "file" },
        ]},
      ]},
    ]},
  ]},
  { name: "query-results/", type: "folder" },
  { name: "lambda-code/", type: "folder", children: [
    { name: "preprocess.py", type: "file"},
    { name: "control_algo.py", type: "file"},
  ] },
];

const mockDynamoDBTables = [
  { name: "SensorData", icon: Table2 },
  { name: "AlgorithmOutputs", icon: Table2 },
  { name: "UserPreferences", icon: Table2 },
];


const renderS3Tree = (items: any[], level = 0) => {
  return (
    <ul className={`space-y-1 ${level > 0 ? "pl-4" : ""}`}>
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2 p-1 hover:bg-accent/50 rounded-sm cursor-pointer">
          {item.type === "folder" ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm">{item.name}</span>
          {/* Add simple expand/collapse for folders if item.children exists - out of scope for placeholder */}
        </li>
      ))}
    </ul>
  );
};

const renderDynamoDBList = (items: any[]) => {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2 p-1 hover:bg-accent/50 rounded-sm cursor-pointer">
          <item.icon className="h-4 w-4 text-primary" />
          <span className="text-sm">{item.name}</span>
        </li>
      ))}
    </ul>
  );
};


export function FileBrowserPlaceholder({ title, browserType }: FileBrowserPlaceholderProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full p-2">
          {browserType === "s3" && renderS3Tree(mockS3Files)}
          {browserType === "dynamodb" && renderDynamoDBList(mockDynamoDBTables)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
