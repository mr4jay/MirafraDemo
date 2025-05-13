
"use client"
import React from 'react'; // Ensure React is imported for useMemo and JSX
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer, TooltipProps } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { TimeseriesData, SensorDataPoint } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface SensorChartProps {
  title: string;
  description?: string;
  data: TimeseriesData[]; 
  chartType?: 'line' | 'bar';
  config: ChartConfig; 
  valueFormatter?: (value: number) => string;
}

// Custom Tooltip Content for better display
const CustomTooltipContent = ({ active, payload, label, config, valueFormatter }: TooltipProps<ValueType, NameType> & { config: ChartConfig, valueFormatter?: (value: number) => string}) => {
  if (active && payload && payload.length) {
    const timeLabel = new Date(label as string).toLocaleString(); // Format timestamp for display
    return (
      <div className="p-2 bg-background border border-border shadow-lg rounded-md text-sm">
        <p className="label text-muted-foreground">{`${timeLabel}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.color || pld.stroke }}>
            {`${config[pld.name as string]?.label || pld.name}: ${valueFormatter ? valueFormatter(pld.value as number) : (pld.value as number).toFixed(1)}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export function SensorChart({ title, description, data, chartType = 'line', config, valueFormatter }: SensorChartProps) {
  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const SeriesComponent = chartType === 'line' ? Line : Bar;

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const timeMap = new Map<string, { time: string } & Record<string, number | null>>();
    data.forEach(series => {
      series.data.forEach(point => {
        const isoTime = new Date(point.time).toISOString();
        if (!timeMap.has(isoTime)) {
          timeMap.set(isoTime, { time: isoTime });
        }
        timeMap.get(isoTime)![series.name] = point.value;
      });
    });
    
    return Array.from(timeMap.values())
      .sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime());

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

  const numDataPoints = chartData.length;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description} (Note: Spec prefers Plotly.js for enhanced interactivity)</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (numDataPoints <= 24) { // Hourly data for a day or less
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (numDataPoints <= 24 * 7) { // Daily data for a week
                     return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' });
                  } else { // Longer ranges
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }
                }}
                // Consider dynamic ticks based on numDataPoints to avoid clutter
                // interval={numDataPoints > 50 ? Math.floor(numDataPoints / 10) : 0} 
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={valueFormatter}
                domain={['auto', 'auto']}
              />
              <ChartTooltip
                cursor={true}
                content={<CustomTooltipContent config={config} valueFormatter={valueFormatter} />}
              />
               {data.map((series) => (
                <SeriesComponent
                  key={series.name}
                  dataKey={series.name}
                  type="monotone"
                  stroke={series.color || config[series.name]?.color || `var(--color-${series.name})`}
                  fill={series.color || config[series.name]?.color || `var(--color-${series.name})`}
                  strokeWidth={2}
                  dot={chartType === 'line' ? { r: numDataPoints > 100 ? 0 : 2, strokeWidth:1 } : false} // Smaller/no dots for many points
                  activeDot={chartType === 'line' ? { r: 5 } : false}
                  name={config[series.name]?.label || series.name}
                  connectNulls={true} // Good for timeseries data
                />
              ))}
              {Object.keys(config).length > 1 && data.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            </ChartComponent>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
