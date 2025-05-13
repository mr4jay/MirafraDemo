"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { TimeseriesData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SensorChartProps {
  title: string;
  description?: string;
  data: TimeseriesData[];
  chartType?: 'line' | 'bar';
  config: ChartConfig;
  valueFormatter?: (value: number) => string;
}

export function SensorChart({ title, description, data, chartType = 'line', config, valueFormatter }: SensorChartProps) {
  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const SeriesComponent = chartType === 'line' ? Line : Bar;

  // Assuming all TimeseriesData in the array share the same x-axis (time points)
  // We need to merge data if multiple series are present
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const timeMap = new Map<string, Record<string, any>>();
    data.forEach(series => {
      series.data.forEach(point => {
        if (!timeMap.has(point.time)) {
          timeMap.set(point.time, { time: point.time });
        }
        timeMap.get(point.time)![series.name] = point.value;
      });
    });
    return Array.from(timeMap.values()).sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [data]);
  
  if (!data || data.length === 0 || chartData.length === 0) {
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available for this sensor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={valueFormatter}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
               {data.map((series) => (
                <SeriesComponent
                  key={series.name}
                  dataKey={series.name}
                  type="monotone"
                  stroke={series.color || `var(--color-${series.name})`} // Use provided color or CSS variable
                  fill={series.color || `var(--color-${series.name})`}   // For Bar charts
                  strokeWidth={2}
                  dot={chartType === 'line' ? { r: 4, fill: series.color || `var(--color-${series.name})`, strokeWidth:2, stroke: "var(--background)" } : false}
                  activeDot={chartType === 'line' ? { r: 6 } : false}
                  name={config[series.name]?.label || series.name}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </ChartComponent>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
