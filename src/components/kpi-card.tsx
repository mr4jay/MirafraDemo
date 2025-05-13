import type { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's not used here
import { cn } from '@/lib/utils';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import type { KpiCardProps } from '@/types';

export function KpiCard({ title, value, unit, icon: Icon, description, trend, trendValue }: KpiCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpwardIcon : trend === 'down' ? ArrowDownwardIcon : RemoveIcon;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-6 w-6 text-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">
          {value}
          {unit && <span className="text-xl font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="caption text-muted-foreground pt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className="caption flex items-center pt-2">
            <TrendIcon className={cn("h-4 w-4 mr-1", trendColor)} />
            <span className={cn(trendColor)}>{trendValue}</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
