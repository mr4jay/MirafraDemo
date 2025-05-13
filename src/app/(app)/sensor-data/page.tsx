"use client";

import { useState, useMemo } from 'react';
import { SensorChart } from '@/components/sensor-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimeseriesData } from '@/types';
import { Thermometer, Users, Zap } from 'lucide-react';

// Mock data generation
const generateHistoricalTimeseries = (name: string, days = 7, pointsPerDay = 24, minVal = 10, maxVal = 30): TimeseriesData => {
  const data = [];
  const now = new Date();
  for (let day = days - 1; day >= 0; day--) {
    for (let hour = pointsPerDay - 1; hour >= 0; hour--) {
      const timestamp = new Date(now.getTime() - day * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000);
      data.push({
        time: timestamp.toISOString(),
        value: parseFloat((Math.random() * (maxVal - minVal) + minVal).toFixed(1)),
      });
    }
  }
  return { name, data: data.sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()) }; // Ensure sorted by time
};

const SENSOR_TYPES = [
  { id: 'temperature', name: 'Temperature', unit: '°C', icon: Thermometer, min: 15, max: 30, color: "hsl(var(--chart-1))" },
  { id: 'occupancy', name: 'Occupancy', unit: '%', icon: Users, min: 0, max: 100, color: "hsl(var(--chart-2))" },
  { id: 'energy', name: 'Energy Usage', unit: 'kW', icon: Zap, min: 0.1, max: 10, color: "hsl(var(--chart-3))" },
];

export default function SensorDataPage() {
  const [selectedSensorId, setSelectedSensorId] = useState<string>(SENSOR_TYPES[0].id);

  const selectedSensor = useMemo(() => SENSOR_TYPES.find(s => s.id === selectedSensorId) || SENSOR_TYPES[0], [selectedSensorId]);

  const chartData: TimeseriesData[] = useMemo(() => {
    return [generateHistoricalTimeseries(selectedSensor.id, 7, 24, selectedSensor.min, selectedSensor.max)];
  }, [selectedSensor]);

  const chartConfig = useMemo(() => ({
    [selectedSensor.id]: { label: selectedSensor.name, color: selectedSensor.color },
  } satisfies ChartConfig), [selectedSensor]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Sensor Data Analysis</h1>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Select Sensor</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSensorId} onValueChange={setSelectedSensorId}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select a sensor" />
            </SelectTrigger>
            <SelectContent>
              {SENSOR_TYPES.map(sensor => (
                <SelectItem key={sensor.id} value={sensor.id}>
                  <div className="flex items-center gap-2">
                    <sensor.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{sensor.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <SensorChart
        title={`${selectedSensor.name} - Last 7 Days`}
        description={`Historical ${selectedSensor.name.toLowerCase()} data (${selectedSensor.unit})`}
        data={chartData}
        config={chartConfig}
        chartType="line"
        valueFormatter={(value) => `${value}${selectedSensor.unit}`}
      />
    </div>
  );
}
