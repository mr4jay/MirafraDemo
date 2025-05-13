
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

interface OutputPanelPlaceholderProps {
  title?: string;
  initialOutput?: string[];
}

export function OutputPanelPlaceholder({ title = "Output / Logs", initialOutput = [] }: OutputPanelPlaceholderProps) {
  const [outputLines, setOutputLines] = useState<string[]>(initialOutput.length > 0 ? initialOutput : ["IDE Output Panel initialized."]);

  // Example function to add a line to output
  // const addOutputLine = (line: string) => {
  //   setOutputLines(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  // };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <pre className="p-2 text-xs font-mono whitespace-pre-wrap break-all">
            {outputLines.join("\n")}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Need to import useState for this component
import { useState } from "react";
