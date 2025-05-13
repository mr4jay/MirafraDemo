import type { SVGProps } from 'react';
import { ThermometerSnowflake } from 'lucide-react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="HVAC Optimizer Logo">
       <ThermometerSnowflake className="h-8 w-8 text-primary" />
      <span className="text-xl font-semibold text-primary">HVAC Optimizer</span>
    </div>
  );
}
