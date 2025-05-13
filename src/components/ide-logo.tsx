
import type { SVGProps } from 'react';
import { CodeXml } from 'lucide-react'; // Example icon

export function IDELogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="Cloud IDE Logo">
       <CodeXml className="h-8 w-8 text-primary" />
      <span className="text-xl font-semibold text-primary">Data Analytics IDE</span>
    </div>
  );
}
