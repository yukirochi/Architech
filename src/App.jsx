import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { useSimulation } from './hooks/useSimulation';
import { architectures } from './data/architectures';
import { Play, Zap, Check, Code2, Maximize2, X, Sun, Moon, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

export default function App() {
  const [currentArchId, setCurrentArchId] = useState('webapp');
  const [isProMode, setIsProMode]         = useState(false);
  const [selectedNode, setSelectedNode]   = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [theme, setTheme]                 = useState('dark');
  const [logs, setLogs] = useState([
    { msg: 'System initialised — select an architecture.', type: 'info', time: new Date() }
  ]);

  const addLog = (msg, type = 'info') =>
    setLogs(prev => [...prev, { msg, type, time: new Date() }]);

  const { isSimulating, activeNodes, activeLines, startSimulation, simulateCacheHit } =
    useSimulation(currentArchId, isProMode, setSelectedNode, addLog);

  const architecture = architectures[currentArchId];

  const handleArchChange = (id) => {
    if (isSimulating) return;
    setCurrentArchId(id);
    setSelectedNode(null);
    setSidebarOpen(false);
    addLog(`Switched to: ${architectures[id].name}`, 'info');
  };

  return (
    <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
      <Sidebar
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        currentArchId={currentArchId}
        architectures={architectures}
        onArchChange={handleArchChange}
        isProMode={isProMode}
        setIsProMode={setIsProMode}
        selectedNodeId={selectedNode}
        nodeData={architecture.nodes[selectedNode]}
        onSimulate={startSimulation}
        onSimulateCache={simulateCacheHit}
        isSimulating={isSimulating}
        logs={logs}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Canvas
        architecture={architecture}
        selectedNode={selectedNode}
        onNodeSelect={(id) => {
          if (!isSimulating) {
            setSelectedNode(id);
            setSidebarOpen(true);   // auto-open panel on node tap (mobile UX)
          }
        }}
        activeNodes={activeNodes}
        activeLines={activeLines}
      />

      {/* Mobile FAB toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle info panel"
      >
        {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
      </button>
    </div>
  );
}
