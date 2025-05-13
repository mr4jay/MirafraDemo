import type {Metadata} from 'next';
// Geist Sans and Mono removed, Roboto will be imported via globals.css
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'HVAC Optimizer',
  description: 'Optimize HVAC systems with real-time data and AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Removed Geist font classes from body */}
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
