import { KpiCard } from '@/components/kpi-card';
import { SensorChart } from '@/components/sensor-chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { TimeseriesData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card for placeholder
import { Button } from '@/components/ui/button'; // For CSV export
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For time range selector
import { Label } from '@/components/ui/label'; // For time range selector
import { Zap, DollarSign, Smile, AlertTriangle, ArrowRightLeft, Download } from 'lucide-react';


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
  // TODO: Fetch actual data from backend for KPIs and charts based on selected time range
  // TODO: Implement CSV export functionality (triggered by button, calls backend)
  // const [timeRange, setTimeRange] = React.useState("24h"); // Example state for time range

  const handleExportCSV = () => {
    alert("CSV Export for dashboard data to be implemented.");
    // This would typically make a request to the backend with current filters/time range
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">HVAC Performance Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* TODO: Implement Time Range Selector functionality */}
          {/* <Label htmlFor="timeRangeDashboard" className="text-sm">Time Range:</Label>
          <Select defaultValue="24h" onValueChange={setTimeRange} name="timeRangeDashboard">
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select> */}
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
          description="Current period" // Updated description
          trend="down"
          trendValue="5%"
        />
        <KpiCard 
          title="Energy vs Baseline" 
          value="-150" // Example: (Actual - Baseline)
          unit="kWh" 
          icon={ArrowRightLeft} 
          description="Deviation from baseline"
          trend="down" // Negative is good (less than baseline)
          trendValue="10%"
        />
        <KpiCard 
          title="Cost Savings" 
          value="$250.75" // Removed unit prop, included in value
          icon={DollarSign} 
          description="Estimated this period" // Updated description
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
          trend="neutral" // Or based on change if applicable
          trendValue="Unchanged"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        {/* Note: SensorChart uses Recharts. Spec mentions Plotly.js for visualizations. 
            These might need to be replaced or SensorChart adapted for Plotly.js. */}
        <SensorChart 
          title="Real-time Temperature"
          description="Average temperature across zones (°C). Spec: Plotly.js"
          data={temperatureData}
          config={temperatureChartConfig}
          valueFormatter={(value) => `${value}°C`}
        />
        <SensorChart 
          title="Real-time Occupancy"
          description="Building occupancy levels (%). Spec: Plotly.js"
          data={occupancyData}
          config={occupancyChartConfig}
          chartType="bar"
          valueFormatter={(value) => `${value}%`}
        />
      </div>
      <div>
        <SensorChart
            title="Energy Usage Pattern"
            description="Total energy consumption (kW). Spec: Plotly.js"
            data={energyUsageData}
            config={energyChartConfig}
            valueFormatter={(value) => `${value} kW`}
          />
      </div>
      <Card className="shadow-lg mt-6">
        <CardHeader>
            <CardTitle>Performance Trend Lines (Plotly.js)</CardTitle>
            <CardDescription>Key metrics over time, visualized with Plotly.js for interactivity.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Plotly.js trend line charts for Energy Consumption, Cost Savings, and Comfort Score will be implemented here, including comparisons against baselines.</p>
            {/* Example: <PlotlyTrendChart type="energy" data={historicalEnergyData} baseline={baselineEnergyData} /> */}
        </CardContent>
      </Card>
    </div>
  );
}
