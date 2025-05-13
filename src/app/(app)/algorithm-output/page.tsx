import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, SlidersHorizontal, AirVent, Thermometer } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Assuming cn is in lib/utils

// TODO: Implement Vis.js component for Decision Flow
// const DecisionFlowChart = ({ data }) => { /* ... Vis.js implementation ... */ return <div>Decision Flow Placeholder</div>; };

// TODO: Implement Plotly.js component for Optimization Results
// const OptimizationPlot = ({ data }) => { /* ... Plotly.js implementation ... */ return <div>Optimization Plot Placeholder</div>; };

interface AlgorithmAction {
  id: string;
  timestamp: string;
  zone: string;
  decision: string;
  action: string;
  reason: string;
  status: 'Executed' | 'Pending' | 'Failed';
  algorithmType?: 'Heuristic' | 'Optimization' | 'AI/ML';
  inputs?: Record<string, any>;
}

const mockActions: AlgorithmAction[] = [
  { id: '1', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString(), zone: 'Meeting Room A', decision: 'Reduce Cooling', action: 'Setpoint to 24°C', reason: 'Low occupancy detected', status: 'Executed', algorithmType: 'Heuristic', inputs: { temp: 26, occupancy: 1 } },
  { id: '2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), zone: 'Open Office Area', decision: 'Increase Ventilation', action: 'Fan speed to High', reason: 'CO2 levels > 800ppm', status: 'Executed', algorithmType: 'Optimization', inputs: { currentCO2: 850 } },
  { id: '3', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleString(), zone: 'Lobby', decision: 'Pre-cool for peak hours', action: 'Setpoint to 21°C', reason: 'Anticipated high traffic', status: 'Pending', algorithmType: 'AI/ML', inputs: { prediction: 'high_traffic_upcoming' } },
  { id: '4', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(), zone: 'Server Room', decision: 'Maintain Temperature', action: 'Setpoint to 18°C', reason: 'Critical equipment protection', status: 'Executed', algorithmType: 'Heuristic', inputs: { temp: 18.5 } },
  { id: '5', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(), zone: 'Executive Office', decision: 'Optimize for Energy Saving', action: 'Widen deadband to +/- 2°C', reason: 'User preference for efficiency', status: 'Executed', algorithmType: 'Optimization', inputs: { user_setting: 'energy_save' } },
];

const getActionIcon = (action: string) => {
  if (action.toLowerCase().includes('setpoint') || action.toLowerCase().includes('°c')) return <Thermometer className="h-4 w-4 mr-2" />;
  if (action.toLowerCase().includes('fan') || action.toLowerCase().includes('ventilation')) return <AirVent className="h-4 w-4 mr-2" />;
  if (action.toLowerCase().includes('mode') || action.toLowerCase().includes('deadband')) return <SlidersHorizontal className="h-4 w-4 mr-2" />;
  return <Lightbulb className="h-4 w-4 mr-2" />;
}

export default function AlgorithmOutputPage() {
  // TODO: Fetch actual data from backend API for actions, decision flow, optimization results, ML insights

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Algorithm Output & HVAC Actions</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Manual Override</CardTitle>
          <CardDescription>Temporarily override HVAC settings for a specific zone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="zoneSelect">Zone</Label>
            {/* TODO: Replace with actual zone selector / API powered */}
            <Input id="zoneSelect" placeholder="e.g., Meeting Room A" />
          </div>
          <div>
            <Label htmlFor="overrideAction">Action</Label>
            <Input id="overrideAction" placeholder="e.g., Setpoint to 22°C, Fan to Medium" />
          </div>
          <Button onClick={() => alert('Manual override call to backend API to be implemented.')}>Apply Override</Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">HVAC Action Log</CardTitle>
          <CardDescription>Recent decisions and actions. (Spec: Card-based UI - current: Table. Further refinement may be needed.)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Reason / Inputs</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs caption">{item.timestamp}</TableCell>
                  <TableCell>{item.zone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs caption">{item.algorithmType || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{item.decision}</TableCell>
                  <TableCell className="flex items-center">
                    {getActionIcon(item.action)}
                    {item.action}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.reason}
                    {item.inputs && <pre className="caption mt-1 bg-muted p-1 rounded-sm overflow-x-auto">{JSON.stringify(item.inputs, null, 2)}</pre>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.status === 'Executed' ? 'default' : item.status === 'Pending' ? 'secondary' : 'destructive'}
                           className={cn(
                             'text-xs caption', // ensure badge text uses caption size
                             item.status === 'Executed' && 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
                             item.status === 'Pending' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
                             item.status === 'Failed' && 'bg-red-500/20 text-red-700 border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                           )}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Decision Flow (Heuristic Algorithm)</CardTitle>
          <CardDescription>Visual representation of how heuristic rules are applied.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <DecisionFlowChart data={decisionFlowData} /> */}
          <p className="text-muted-foreground">Decision Flow visualization (using Vis.js or similar) will be implemented here.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Optimization Results</CardTitle>
          <CardDescription>Trade-offs and outcomes from optimization algorithms (e.g., cost vs. comfort plot).</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <OptimizationPlot data={optimizationPlotData} /> */}
          <p className="text-muted-foreground">Optimization results plot (using Plotly.js) will be implemented here.</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">ML Model Insights</CardTitle>
          <CardDescription>Information about the AI/ML model's predictions and feature importance.</CardHeader>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">ML insights (e.g., feature importance, prediction accuracy graphs/text) will be displayed here.</p>
        </CardContent>
      </Card>

    </div>
  );
}

// cn function should be imported from "@/lib/utils"
// function cn(...inputs: Array<string | undefined | null | false>): string {
//   return inputs.filter(Boolean).join(' ');
// }
