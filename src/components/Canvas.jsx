import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as LucideIcons from 'lucide-react';

const IconRenderer = ({ name }) => {
  const pascal = (name || 'box').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const Icon = LucideIcons[pascal] || LucideIcons.Box;
  return <Icon />;
};

export default function Canvas({ architecture, selectedNode, onNodeSelect, activeNodes, activeLines }) {
  const containerRef = useRef(null);
  const [paths, setPaths] = useState([]);

  // Re-measure after the nodes have been painted
  const computePaths = () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.getBoundingClientRect();

    const newPaths = architecture.lines.map(link => {
      const fromEl = document.getElementById(`node-${link.from}`);
      const toEl   = document.getElementById(`node-${link.to}`);
      if (!fromEl || !toEl) return null;

      const fR = fromEl.getBoundingClientRect();
      const tR = toEl.getBoundingClientRect();

      // centres relative to the canvas div
      const x1 = fR.left + fR.width  / 2 - canvas.left;
      const y1 = fR.top  + fR.height / 2 - canvas.top;
      const x2 = tR.left + tR.width  / 2 - canvas.left;
      const y2 = tR.top  + tR.height / 2 - canvas.top;

      const cx = (x1 + x2) / 2;
      const d  = Math.abs(y2 - y1) < 15
        ? `M ${x1} ${y1} L ${x2} ${y2}`
        : `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;

      return { id: link.id, d };
    }).filter(Boolean);

    setPaths(newPaths);
  };

  // Run after every paint when architecture changes
  useLayoutEffect(() => {
    computePaths();
  }, [architecture]);

  useEffect(() => {
    const handle = () => computePaths();
    window.addEventListener('resize', handle);
    // extra pass after fonts/layout settle
    const t = setTimeout(computePaths, 120);
    return () => { window.removeEventListener('resize', handle); clearTimeout(t); };
  }, [architecture]);

  return (
    <main className="canvas-container">
      <div className="canvas-inner" id="canvas-inner" ref={containerRef}>
        {/* SVG overlay — drawn on top but pointer-events: none */}
        <svg className="svg-layer">
          {paths.map(p => (
            <path
              key={p.id}
              className={`connection-line ${activeLines.includes(p.id) ? 'active' : ''}`}
              d={p.d}
            />
          ))}
        </svg>

        {/* Region bounding boxes */}
        {architecture.regions.map(r => (
          <div key={r.id} className="region" style={{ left: r.left, top: r.top, width: r.width, height: r.height }}>
            <div className="region-label">{r.label}</div>
          </div>
        ))}

        {/* Nodes */}
        {Object.values(architecture.nodes).map(node => (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={[
              'node',
              'mini',
              selectedNode  === node.id            ? 'active-node'  : '',
              activeNodes.includes(node.id)        ? 'processing'   : '',
            ].join(' ')}
            style={{ left: node.left, top: node.top }}
            onClick={() => onNodeSelect(node.id)}
          >
            <div className="icon"><IconRenderer name={node.icon} /></div>
            <div className="label">{node.label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
