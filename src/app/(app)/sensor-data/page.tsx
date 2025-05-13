
"use client";

import React, { useState, useMemo, useEffect } from 'react'; // Added React for full import
import { SensorChart } from '@/components/sensor-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import type { TimeseriesData } from '@/types'; // SensorDataPoint removed as it's part of TimeseriesData

import ThermostatIcon from '@mui/icons-material/Thermostat';
import PeopleIcon from '@mui/icons-material/People';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DownloadIcon from '@mui/icons-material/Download';

// Placeholder GaugeWidget component
const GaugeWidget = ({ value, unit, title, min, max }: { value: number, unit: string, title: string, min: number, max: number }) => {
  // In a real scenario, this would use HTML5 Canvas or a charting library like Plotly.js for gauges
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
      // For 1h view, generate minute-by-minute data for the last hour
      let timestamp: Date;
      if (days === 1 && pointsPerDay === 60) { // Special case for "Last 1 Hour" with 1-min data
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
  return { name, data: data.sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()) };
};

const SENSOR_TYPES = [
  { id: 'temperature', name: 'Temperature', unit: '°C', icon: ThermostatIcon, min: 15, max: 30, color: "hsl(var(--chart-1))" },
  { id: 'occupancy', name: 'Occupancy', unit: '%', icon: PeopleIcon, min: 0, max: 100, color: "hsl(var(--chart-2))" },
  { id: 'energy', name: 'Energy Usage', unit: 'kW', icon: FlashOnIcon, min: 0.1, max: 10, color: "hsl(var(--chart-3))" },
];

export default function SensorDataPage() {
  const [selectedSensorId, setSelectedSensorId] = useState<string>(SENSOR_TYPES[0].id);
  const [timeRange, setTimeRange] = useState<string>("7d"); 
  // TODO: Fetch actual sensor data and stats from backend API based on selectedSensorId and timeRange

  const selectedSensor = useMemo(() => SENSOR_TYPES.find(s => s.id === selectedSensorId) || SENSOR_TYPES[0], [selectedSensorId]);

  // Mock stats, to be replaced by API data
  const [stats, setStats] = useState({ mean: 22.5, min: 18.0, max: 28.5, std: 2.1 });

  const chartData: TimeseriesData[] = useMemo(() => {
    let days = 7;
    let points = 24; // points per day
    if (timeRange === "1h") { days = 1; points = 60; } // 60 points for 1 hour (1 per minute)
    else if (timeRange === "24h") { days = 1; points = 24; } // 24 points for 24 hours (1 per hour)
    else if (timeRange === "30d") { days = 30; points = 24; } // 24 points per day for 30 days
    
    // This should be replaced by fetched data from an API endpoint like /api/sensor-data?sensorId=...&timeRange=...
    const rawData = generateHistoricalTimeseries(selectedSensor.id, days, points, selectedSensor.min, selectedSensor.max);
    
    // Update mock stats based on generated data for better demo
    if(rawData.data.length > 0) {
      const values = rawData.data.map(d => d.value);
      const newMean = values.reduce((a,b) => a+b, 0) / values.length;
      const newMin = Math.min(...values);
      const newMax = Math.max(...values);
      const variance = values.reduce((a,b) => a + Math.pow(b - newMean, 2), 0) / values.length;
      setStats({ mean: newMean, min: newMin, max: newMax, std: Math.sqrt(variance) });
    }
    return [rawData];
  }, [selectedSensor, timeRange]);
  
  const currentRealTimeValue = chartData[0]?.data[chartData[0]?.data.length -1]?.value ?? selectedSensor.min;

  const chartConfig = useMemo(() => ({
    [selectedSensor.id]: { label: selectedSensor.name, color: selectedSensor.color },
  } satisfies ChartConfig), [selectedSensor]);

  const handleExportCSV = () => {
    // TODO: Implement CSV export. This would call a backend API.
    // e.g. /api/export-sensor-data?sensorId=...&timeRange=...
    alert(`CSV Export for ${selectedSensor.name} (${timeRange}) to be implemented.`);
  };
  
  const timeRangeLabel = useMemo(() => {
    if (timeRange === "1h") return "Last 1 Hour";
    if (timeRange === "24h") return "Last 24 Hours";
    if (timeRange === "7d") return "Last 7 Days";
    if (timeRange === "30d") return "Last 30 Days";
    return "Select Range";
  }, [timeRange]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Sensor Data Timeseries Analysis</h1>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <DownloadIcon className="mr-2 h-4 w-4" />
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

      <SensorChart
        title={`${selectedSensor.name} Trend - ${timeRangeLabel}`}
        description={`Historical ${selectedSensor.name.toLowerCase()} data (${selectedSensor.unit}). (Note: Spec prefers Plotly.js for interactivity & zoom)`}
        data={chartData}
        config={chartConfig}
        chartType="line"
        valueFormatter={(value) => `${value}${selectedSensor.unit}`}
      />
    </div>
  );
}
