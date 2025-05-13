import { KpiCard } from '@/components/kpi-card';
import { SensorChart } from '@/components/sensor-chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { TimeseriesData } from '@/types';
import { Zap, DollarSign, Smile, AlertTriangle, Thermometer, Users, TrendingUp } from 'lucide-react';

// Mock data generation
const generateMockTimeseries = (name: string, numPoints = 20, minVal = 10, maxVal = 30): TimeseriesData => {
  const data = [];
  const now = new Date();
  for (let i = numPoints - 1; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(), // Hourly data for last numPoints hours
      value: parseFloat((Math.random() * (maxVal - minVal) + minVal).toFixed(1)),
    });
  }
  return { name, data };
};

const temperatureData: TimeseriesData[] = [generateMockTimeseries('temperature', 24, 18, 26)];
const occupancyData: TimeseriesData[] = [generateMockTimeseries('occupancy', 24, 0, 100)];
const energyUsageData: TimeseriesData[] = [generateMockTimeseries('energy', 24, 0.5, 5)];

const temperatureChartConfig = {
  temperature: { label: "Temperature", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const occupancyChartConfig = {
  occupancy: { label: "Occupancy", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const energyChartConfig = {
  energy: { label: "Energy Usage", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">HVAC Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Energy Consumption" 
          value="1,234" 
          unit="kWh" 
          icon={Zap} 
          description="Current month"
          trend="down"
          trendValue="5%"
        />
        <KpiCard 
          title="Cost Savings" 
          value="250.75" 
          unit="$" 
          icon={DollarSign} 
          description="Estimated this month"
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

      {/* Sensor Data Charts */}
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        <SensorChart 
          title="Real-time Temperature"
          description="Average temperature across zones (°C)"
          data={temperatureData}
          config={temperatureChartConfig}
          valueFormatter={(value) => `${value}°C`}
        />
        <SensorChart 
          title="Real-time Occupancy"
          description="Building occupancy levels (%)"
          data={occupancyData}
          config={occupancyChartConfig}
          chartType="bar"
          valueFormatter={(value) => `${value}%`}
        />
      </div>
      <div>
        <SensorChart
            title="Energy Usage Pattern"
            description="Total energy consumption (kW)"
            data={energyUsageData}
            config={energyChartConfig}
            valueFormatter={(value) => `${value} kW`}
          />
      </div>
    </div>
  );
}
