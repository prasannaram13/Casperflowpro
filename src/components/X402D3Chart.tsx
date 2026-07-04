import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartDataPoint {
  id: string;
  index: number;
  cost: number;
  endpoint: string;
}

interface X402D3ChartProps {
  receipts: {
    id: string;
    endpoint: string;
    timestamp: string;
    costCspr: number;
    hash: string;
    status: 'PROVED' | 'VERIFYING' | 'EXPIRED';
    apiResponseSize: string;
  }[];
}

export const X402D3Chart: React.FC<X402D3ChartProps> = ({ receipts }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || receipts.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare chronological data
    const sortedData: ChartDataPoint[] = receipts
      .slice()
      .reverse()
      .map((rcpt, idx) => ({
        id: rcpt.id,
        index: idx + 1,
        cost: rcpt.costCspr,
        endpoint: rcpt.endpoint,
      }));

    // Setup margins and size dynamically
    const margin = { top: 15, right: 15, bottom: 25, left: 35 };
    const width = containerRef.current.clientWidth || 400;
    const height = 120;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add visual definitions (gradients)
    const defs = svg.append('defs');

    // Create area gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'emerald-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.25);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.0);

    // Setup Scales
    const xScale = d3
      .scaleLinear()
      .domain([1, Math.max(sortedData.length, 4)])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.cost) || 0.006])
      .nice()
      .range([chartHeight, 0]);

    // Gridlines (horizontal)
    const yGrid = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickSize(-chartWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid-lines')
      .attr('stroke', 'rgba(0, 0, 0, 0.05)')
      .call(yGrid)
      .selectAll('.tick line')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(sortedData.length, 5))
      .tickFormat((d) => `req-${d}`);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `${d} CSPR`);

    // Render X Axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#6B7280')
      .style('font-size', '8px')
      .style('font-family', 'monospace');

    // Render Y Axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#6B7280')
      .style('font-size', '8px')
      .style('font-family', 'monospace');

    // Remove domain lines for minimal look
    g.selectAll('.domain').attr('stroke', 'rgba(0, 0, 0, 0.08)');
    g.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.08)');

    // Line Generator
    const lineGenerator = d3
      .line<ChartDataPoint>()
      .x((d) => xScale(d.index))
      .y((d) => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    // Area Generator
    const areaGenerator = d3
      .area<ChartDataPoint>()
      .x((d) => xScale(d.index))
      .y0(chartHeight)
      .y1((d) => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    // Append Area Path
    g.append('path')
      .datum(sortedData)
      .attr('fill', 'url(#emerald-area-gradient)')
      .attr('d', areaGenerator);

    // Append Line Path
    g.append('path')
      .datum(sortedData)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Add interactive data points
    g.selectAll('.dot')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.index))
      .attr('cy', (d) => yScale(d.cost))
      .attr('r', 3.5)
      .attr('fill', '#10B981')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 5.5)
          .attr('fill', '#059669');

        // Render mini tooltip text
        g.append('text')
          .attr('id', `t-${d.id}`)
          .attr('x', xScale(d.index))
          .attr('y', yScale(d.cost) - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1A1A2E')
          .style('font-size', '8px')
          .style('font-weight', 'bold')
          .style('background', '#FFFFFF')
          .text(`${d.cost} CSPR`);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 3.5)
          .attr('fill', '#10B981');

        d3.select(`#t-${d.id}`).remove();
      });

  }, [receipts]);

  return (
    <div ref={containerRef} className="w-full h-[120px] relative mt-2 mb-3 bg-black/[0.01] rounded-xl border border-black/[0.02] p-1.5 overflow-hidden">
      <svg ref={svgRef} className="overflow-visible" />
    </div>
  );
};
