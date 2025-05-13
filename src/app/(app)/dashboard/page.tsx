"use client";

import React from 'react';
import { KpiCard } from '@/components/kpi-card';
import type { TimeseriesData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Zap, DollarSign, Smile, AlertTriangle, ArrowRightLeft, Download } from 'lucide-react';
import PlotlyChart from '@/components/ide/plotly-chart'; // Import PlotlyChart
import type { Data, Layout } from 'plotly.js-dist-min';


// Mock data generation
const generateMockTimeseries = (name: string, numPoints = 20, minVal = 10, maxVal = 30): TimeseriesData => {
  const data = [];
  const now = new Date();
  for (let i = numPoints - 1; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
      value: parseFloat((Math.random() * (maxVal - minVal) + minVal).toFixed(1)),
    });
  }
  return { name, data, color: getRandomColor() }; // Assign a color for Plotly
};

// Helper to get a random color for chart series
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


const temperatureDataRaw: TimeseriesData[] = [generateMockTimeseries('temperature', 24, 18, 26)];
const occupancyDataRaw: TimeseriesData[] = [generateMockTimeseries('occupancy', 24, 0, 100)];
const energyUsageDataRaw: TimeseriesData[] = [generateMockTimeseries('energy', 24, 0.5, 5)];


const transformToPlotlyData = (timeseriesArray: TimeseriesData[], chartType: 'scatter' | 'bar' = 'scatter'): Data[] => {
  return timeseriesArray.map(series => ({
    x: series.data.map(dp => dp.time),
    y: series.data.map(dp => dp.value),
    type: chartType,
    mode: chartType === 'scatter' ? 'lines+markers' : undefined,
    name: series.name, // Original name, PlotlyChart layout can handle label if needed via config
    marker: { color: series.color }
  }));
};

const temperaturePlotlyData: Data[] = transformToPlotlyData(temperatureDataRaw);
const occupancyPlotlyData: Data[] = transformToPlotlyData(occupancyDataRaw, 'bar');
const energyPlotlyData: Data[] = transformToPlotlyData(energyUsageDataRaw);

const commonLayoutOptions: Partial<Layout> = {
  xaxis: { type: 'date', gridcolor: 'hsl(var(--border))', linecolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--border))' },
  yaxis: { gridcolor: 'hsl(var(--border))', linecolor: 'hsl(var(--border))', zerolinecolor: 'hsl(var(--border))', tickformat: '.1f' },
  paper_bgcolor: 'hsl(var(--card))',
  plot_bgcolor: 'hsl(var(--card))',
  font: { color: 'hsl(var(--card-foreground))' }
};

const temperatureLayout: Partial<Layout> = {
  ...commonLayoutOptions,
  title: { text: 'Real-time Temperature', font: { color: 'hsl(var(--card-foreground))' } },
  yaxis: { ...commonLayoutOptions.yaxis, title: { text: 'Temperature (°C)', font: { color: 'hsl(var(--card-foreground))' } } },
};

const occupancyLayout: Partial<Layout> = {
  ...commonLayoutOptions,
  title: { text: 'Real-time Occupancy', font: { color: 'hsl(var(--card-foreground))' } },
  yaxis: { ...commonLayoutOptions.yaxis, title: { text: 'Occupancy (%)', font: { color: 'hsl(var(--card-foreground))' } } },
};

const energyLayout: Partial<Layout> = {
  ...commonLayoutOptions,
  title: { text: 'Energy Usage Pattern', font: { color: 'hsl(var(--card-foreground))' } },
  yaxis: { ...commonLayoutOptions.yaxis, title: { text: 'Energy (kW)', font: { color: 'hsl(var(--card-foreground))' } } },
};


export default function DashboardPage() {
  const [timeRange, setTimeRange] = React.useState("24h");

  const handleExportCSV = () => {
    alert("CSV Export for dashboard data to be implemented.");
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">HVAC Performance Dashboard</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="timeRangeDashboard" className="text-sm">Time Range:</Label>
          <Select defaultValue="24h" onValueChange={setTimeRange} name="timeRangeDashboard">
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Energy Consumption" 
          value="1,234" 
          unit="kWh" 
          icon={Zap} 
          description="Current period"
          trend="down"
          trendValue="5%"
        />
        <KpiCard 
          title="Energy vs Baseline" 
          value="-150" 
          unit="kWh" 
          icon={ArrowRightLeft} 
          description="Deviation from baseline"
          trend="down"
          trendValue="10%"
        />
        <KpiCard 
          title="Cost Savings" 
          value="$250.75"
          icon={DollarSign} 
          description="Estimated this period"
          trend="up"
          trendValue="12%"
        />
        <KpiCard 
          title="Comfort Score" 
          value="92" 
          unit="%" 
          icon={Smile} 
          description="Average across zones"
          trend="up"
          trendValue="2 pts"
        />
         <KpiCard 
          title="Active Alerts" 
          value="3" 
          icon={AlertTriangle} 
          description="Require attention"
          trend="neutral"
          trendValue="Unchanged"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Real-time Temperature</CardTitle>
            <CardDescription>Average temperature across zones (°C). Using Plotly.js.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart data={temperaturePlotlyData} layout={temperatureLayout} />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Real-time Occupancy</CardTitle>
            <CardDescription>Building occupancy levels (%). Using Plotly.js.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart data={occupancyPlotlyData} layout={occupancyLayout} />
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Energy Usage Pattern</CardTitle>
            <CardDescription>Total energy consumption (kW). Using Plotly.js.</CardDescription>
        </CardHeader>
        <CardContent>
            <PlotlyChart data={energyPlotlyData} layout={energyLayout} />
        </CardContent>
      </Card>
      <Card className="shadow-lg mt-6">
        <CardHeader>
            <CardTitle>Performance Trend Lines (Plotly.js)</CardTitle>
            <CardDescription>Key metrics over time, visualized with Plotly.js for interactivity.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md data-ai-hint='trend line graph'">
                 <p className="text-muted-foreground text-center">Plotly.js trend line charts for Energy Consumption, Cost Savings, and Comfort Score will be implemented here, including comparisons against baselines.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}