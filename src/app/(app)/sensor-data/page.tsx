
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import type { TimeseriesData } from '@/types';
import { Thermometer, Users, Zap, Download } from 'lucide-react';
// import PlotlyChart from '@/components/ide/plotly-chart'; 
import type { Data, Layout } from 'plotly.js-dist-min';
import dynamic from 'next/dynamic';

const PlotlyChart = dynamic(() => import('@/components/ide/plotly-chart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md"><p className="text-muted-foreground">Loading chart...</p></div>,
});


// Placeholder GaugeWidget component
const GaugeWidget = ({ value, unit, title, min, max }: { value: number, unit: string, title: string, min: number, max: number }) => {
  return (
    <Card className="text-center shadow-md">
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary">{value?.toFixed(1) ?? 'N/A'}</div>
        <div className="text-sm text-muted-foreground">{unit}</div>
        <div className="caption text-muted-foreground mt-2">(Range: {min} - {max} {unit})</div>
      </CardContent>
    </Card>
  );
};

const generateHistoricalTimeseries = (name: string, days = 7, pointsPerDay = 24, minVal = 10, maxVal = 30): TimeseriesData => {
  const data = [];
  const now = new Date();
  for (let day = days - 1; day >= 0; day--) {
    for (let hour = pointsPerDay - 1; hour >= 0; hour--) {
      let timestamp: Date;
      if (days === 1 && pointsPerDay === 60) {
         timestamp = new Date(now.getTime() - (pointsPerDay - 1 - hour) * 60 * 1000);
      } else {
         timestamp = new Date(now.getTime() - day * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000);
      }
      data.push({
        time: timestamp.toISOString(),
        value: parseFloat((Math.random() * (maxVal - minVal) + minVal).toFixed(1)),
      });
    }
  }
  return { name, data: data.sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()), color: getRandomColor() };
};

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];
let colorIndex = 0;
const getRandomColor = () => {
  const color = chartColors[colorIndex % chartColors.length];
  colorIndex++;
  return color;
};

const SENSOR_TYPES = [
  { id: 'temperature', name: 'Temperature', unit: '°C', icon: Thermometer, min: 15, max: 30, color: chartColors[0] },
  { id: 'occupancy', name: 'Occupancy', unit: '%', icon: Users, min: 0, max: 100, color: chartColors[1] },
  { id: 'energy', name: 'Energy Usage', unit: 'kW', icon: Zap, min: 0.1, max: 10, color: chartColors[2] },
];

export default function SensorDataPage() {
  const [selectedSensorId, setSelectedSensorId] = useState<string>(SENSOR_TYPES[0].id);
  const [timeRange, setTimeRange] = useState<string>("7d"); 
  const [stats, setStats] = useState({ mean: 22.5, min: 18.0, max: 28.5, std: 2.1 });

  const selectedSensor = useMemo(() => SENSOR_TYPES.find(s => s.id === selectedSensorId) || SENSOR_TYPES[0], [selectedSensorId]);

  const rawChartData: TimeseriesData[] = useMemo(() => {
    let days = 7;
    let points = 24;
    if (timeRange === "1h") { days = 1; points = 60; }
    else if (timeRange === "24h") { days = 1; points = 24; }
    else if (timeRange === "30d") { days = 30; points = 24; }
    
    const generatedData = generateHistoricalTimeseries(selectedSensor.id, days, points, selectedSensor.min, selectedSensor.max);
    generatedData.color = selectedSensor.color; // Ensure selected sensor color is used
    
    if(generatedData.data.length > 0) {
      const values = generatedData.data.map(d => d.value);
      const newMean = values.reduce((a,b) => a+b, 0) / values.length;
      const newMin = Math.min(...values);
      const newMax = Math.max(...values);
      const variance = values.reduce((a,b) => a + Math.pow(b - newMean, 2), 0) / values.length;
      setStats({ mean: newMean, min: newMin, max: newMax, std: Math.sqrt(variance) });
    }
    return [generatedData];
  }, [selectedSensor, timeRange]);
  
  const currentRealTimeValue = rawChartData[0]?.data[rawChartData[0]?.data.length -1]?.value ?? selectedSensor.min;

  const plotlyData: Data[] = useMemo(() => {
    return rawChartData.map(series => ({
      x: series.data.map(dp => dp.time),
      y: series.data.map(dp => dp.value),
      type: 'scatter', // Default to line chart for sensor trends
      mode: 'lines+markers',
      name: selectedSensor.name,
      marker: { color: series.color }
    }));
  }, [rawChartData, selectedSensor.name]);

  const timeRangeLabel = useMemo(() => {
    if (timeRange === "1h") return "Last 1 Hour";
    if (timeRange === "24h") return "Last 24 Hours";
    if (timeRange === "7d") return "Last 7 Days";
    if (timeRange === "30d") return "Last 30 Days";
    return "Select Range";
  }, [timeRange]);

  const plotlyLayout: Partial<Layout> = useMemo(() => ({
    title: { text: `${selectedSensor.name} Trend - ${timeRangeLabel}`, font: { color: 'hsl(var(--card-foreground))' } },
    xaxis: { type: 'date', gridcolor: 'hsl(var(--border))', linecolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--border))' },
    yaxis: { title: { text: `${selectedSensor.name} (${selectedSensor.unit})`, font: { color: 'hsl(var(--card-foreground))' } }, gridcolor: 'hsl(var(--border))', linecolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--border))', tickformat: '.1f' },
    paper_bgcolor: 'hsl(var(--card))',
    plot_bgcolor: 'hsl(var(--card))',
    font: { color: 'hsl(var(--card-foreground))' },
    showlegend: true,
  }), [selectedSensor, timeRangeLabel]);


  const handleExportCSV = () => {
    alert(`CSV Export for ${selectedSensor.name} (${timeRange}) to be implemented.`);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Sensor Data Timeseries Analysis</h1>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export Data (CSV)
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Data Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sensorSelect">Sensor Type</Label>
              <Select value={selectedSensorId} onValueChange={setSelectedSensorId} name="sensorSelect">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPES.map(sensor => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      <div className="flex items-center gap-2">
                        <sensor.icon className="h-5 w-5 text-muted-foreground" />
                        <span>{sensor.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeRangeSelect">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange} name="timeRangeSelect">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <GaugeWidget 
          title={`${selectedSensor.name} (Real-time)`}
          value={currentRealTimeValue}
          unit={selectedSensor.unit}
          min={selectedSensor.min}
          max={selectedSensor.max}
        />

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Statistical Summary</CardTitle>
            <CardDescription className="caption">{selectedSensor.name} - {timeRangeLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between caption"><span className="text-muted-foreground">Mean:</span> <span>{stats.mean.toFixed(1)} {selectedSensor.unit}</span></div>
            <div className="flex justify-between caption"><span className="text-muted-foreground">Min:</span> <span>{stats.min.toFixed(1)} {selectedSensor.unit}</span></div>
            <div className="flex justify-between caption"><span className="text-muted-foreground">Max:</span> <span>{stats.max.toFixed(1)} {selectedSensor.unit}</span></div>
            <div className="flex justify-between caption"><span className="text-muted-foreground">Std Dev:</span> <span>{stats.std.toFixed(1)} {selectedSensor.unit}</span></div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
           <CardTitle className="text-xl">{`${selectedSensor.name} Trend - ${timeRangeLabel}`}</CardTitle>
           <CardDescription>Historical {selectedSensor.name.toLowerCase()} data ({selectedSensor.unit}). Using Plotly.js for interactivity & zoom.</CardDescription>
        </CardHeader>
        <CardContent>
          {plotlyData.length > 0 && plotlyData[0].x && plotlyData[0].x.length > 0 ? (
            <PlotlyChart data={plotlyData} layout={plotlyLayout} />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
              <p className="text-muted-foreground">No data available for this sensor and time range.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

