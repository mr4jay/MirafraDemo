import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Settings2, Wind, ThermometerIcon } from "lucide-react";

interface AlgorithmAction {
  id: string;
  timestamp: string;
  zone: string;
  decision: string;
  action: string;
  reason: string;
  status: 'Executed' | 'Pending' | 'Failed';
}

const mockActions: AlgorithmAction[] = [
  { id: '1', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString(), zone: 'Meeting Room A', decision: 'Reduce Cooling', action: 'Setpoint to 24°C', reason: 'Low occupancy detected', status: 'Executed' },
  { id: '2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), zone: 'Open Office Area', decision: 'Increase Ventilation', action: 'Fan speed to High', reason: 'CO2 levels > 800ppm', status: 'Executed' },
  { id: '3', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleString(), zone: 'Lobby', decision: 'Pre-cool for peak hours', action: 'Setpoint to 21°C', reason: 'Anticipated high traffic', status: 'Pending' },
  { id: '4', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(), zone: 'Server Room', decision: 'Maintain Temperature', action: 'Setpoint to 18°C', reason: 'Critical equipment protection', status: 'Executed' },
  { id: '5', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(), zone: 'Executive Office', decision: 'Optimize for Energy Saving', action: 'Widen deadband to +/- 2°C', reason: 'User preference for efficiency', status: 'Executed' },
];

const getActionIcon = (action: string) => {
  if (action.toLowerCase().includes('setpoint') || action.toLowerCase().includes('°c')) return <ThermometerIcon className="h-4 w-4 mr-2" />;
  if (action.toLowerCase().includes('fan') || action.toLowerCase().includes('ventilation')) return <Wind className="h-4 w-4 mr-2" />;
  if (action.toLowerCase().includes('mode')) return <Settings2 className="h-4 w-4 mr-2" />;
  return <Lightbulb className="h-4 w-4 mr-2" />;
}

export default function AlgorithmOutputPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Algorithm Output & HVAC Actions</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">HVAC Action Log</CardTitle>
          <CardDescription>Recent decisions and actions taken by the HVAC control algorithm.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs">{item.timestamp}</TableCell>
                  <TableCell>{item.zone}</TableCell>
                  <TableCell>{item.decision}</TableCell>
                  <TableCell className="flex items-center">
                    {getActionIcon(item.action)}
                    {item.action}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.status === 'Executed' ? 'default' : item.status === 'Pending' ? 'secondary' : 'destructive'}
                           className={cn(
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
    </div>
  );
}

function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(' ');
}
