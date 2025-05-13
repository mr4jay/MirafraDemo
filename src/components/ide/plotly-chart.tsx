"use client";

import React, { useEffect, useRef } from 'react';
import Plotly, { type Data, type Layout } from 'plotly.js-dist-min'; // Using dist-min for smaller bundle

interface PlotlyChartProps {
  data: Data[];
  layout: Partial<Layout>;
  title?: string;
  className?: string;
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, layout, title, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data && data.length > 0) {
      const defaultLayout: Partial<Layout> = {
        title: title || 'Chart',
        margin: { t: 50, b: 50, l: 60, r: 30 },
        paper_bgcolor: 'hsl(var(--card))', // Match card background
        plot_bgcolor: 'hsl(var(--card))',  // Match card background
        font: {
          color: 'hsl(var(--card-foreground))', // Match card text color
          family: 'Roboto, Arial, Helvetica, sans-serif',
        },
        xaxis: {
          gridcolor: 'hsl(var(--border))',
          linecolor: 'hsl(var(--border))',
          zerolinecolor: 'hsl(var(--border))',
        },
        yaxis: {
          gridcolor: 'hsl(var(--border))',
          linecolor: 'hsl(var(--border))',
          zerolinecolor: 'hsl(var(--border))',
        },
        legend: {
          bgcolor: 'hsla(var(--card), 0.5)',
          bordercolor: 'hsl(var(--border))',
        }
      };

      Plotly.react(chartRef.current, data, { ...defaultLayout, ...layout }, { responsive: true });
    } else if (chartRef.current) {
      Plotly.purge(chartRef.current); // Clear chart if no data
    }

    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [data, layout, title]);

  return <div ref={chartRef} className={className || "w-full h-[300px]"} />;
};

export default PlotlyChart;
