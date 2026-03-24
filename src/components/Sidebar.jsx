import React, { useEffect, useRef, useState } from 'react';
import { Play, Check, Code2, Maximize2, X, Sun, Moon } from 'lucide-react';

function CodeModal({ title, code, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="code-modal-backdrop" onClick={onClose}>
      <div className="code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-modal-header">
          <div className="code-modal-dots">
            <div className="code-modal-dot" />
            <div className="code-modal-dot" />
            <div className="code-modal-dot" />
          </div>
          <h4>{title} — Implementation Pseudocode</h4>
          <button className="code-modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div className="code-modal-body">
          <pre>{code}</pre>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  currentArchId, architectures, onArchChange,
  isProMode, setIsProMode, selectedNodeId, nodeData,
  onSimulate, isSimulating, logs,
  isOpen, onClose, theme, onThemeToggle
}) {
  const logsEndRef = useRef(null);
  const [codeModal, setCodeModal] = useState(false);
  // 'python' is the default language
  const [codeLang, setCodeLang] = useState('python');

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Reset on node change but keep user's language preference
  useEffect(() => { setCodeModal(false); }, [selectedNodeId]);

  // Pick the right snippet — fall back gracefully
  const hasPython = Boolean(nodeData?.pseudoCodePython);
  const hasJS = Boolean(nodeData?.pseudoCode);
  const activeCode =
    codeLang === 'python' && hasPython ? nodeData.pseudoCodePython :
      codeLang === 'js' && hasJS ? nodeData.pseudoCode :
        hasPython ? nodeData.pseudoCodePython :
          hasJS ? nodeData.pseudoCode : null;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.5)' }}
          className="sidebar-backdrop"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <h2>System Architecture</h2>
            <button
              className="theme-toggle"
              onClick={onThemeToggle}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={14} />
                </>
              ) : (
                <>
                  <Moon size={14} />
                </>
              )}
            </button>
          </div>
          <select
            className="arch-select"
            value={currentArchId}
            onChange={(e) => onArchChange(e.target.value)}
            disabled={isSimulating}
          >
            {Object.values(architectures).map(arch => (
              <option key={arch.id} value={arch.id}>{arch.name}</option>
            ))}
          </select>
        </div>

        <div className="controls">
          <button className="primary-btn" onClick={onSimulate} disabled={isSimulating}>
            <Play className="btn-icon" />
            {isSimulating ? 'Simulating…' : 'Simulate Data Flow'}
          </button>
        </div>

        <div className="info-panel">
          <div className="panel-header-row">
            <h3>{nodeData ? (nodeData.title || nodeData.label) : 'Select a Node'}</h3>
            <div className="mode-toggle">
              <button className={`toggle-btn ${!isProMode ? 'active' : ''}`} onClick={() => setIsProMode(false)}>Beginner</button>
              <button className={`toggle-btn ${isProMode ? 'active' : ''}`} onClick={() => setIsProMode(true)}>Pro</button>
            </div>
          </div>

          <p>
            {nodeData
              ? (isProMode ? nodeData.descPro : nodeData.descBeginner) || 'No description available.'
              : (isProMode
                ? 'Click any node to read detailed technical documentation.'
                : 'Click any node to see a plain-English explanation of what it does.')
            }
          </p>

          {nodeData?.details?.length > 0 && (
            <div className="status-list">
              {nodeData.details.map((d, i) => (
                <div key={i}><span className="tag"><Check size={12} /></span>{d}</div>
              ))}
            </div>
          )}

          {(hasPython || hasJS) && (
            <div className="pseudo-block">
              <div className="pseudo-header">
                <div className="pseudo-header-text">
                  <Code2 size={12} />
                  <span>Implementation Pseudocode</span>
                </div>
                {/* Language toggle */}
                <div className="code-lang-toggle">
                  {hasPython && (
                    <button
                      className={`code-lang-btn ${codeLang === 'python' ? 'active' : ''}`}
                      onClick={() => setCodeLang('python')}
                    >Python</button>
                  )}
                  {hasJS && (
                    <button
                      className={`code-lang-btn ${codeLang === 'js' ? 'active' : ''}`}
                      onClick={() => setCodeLang('js')}
                    >JS</button>
                  )}
                </div>
                <button
                  className="pseudo-expand-btn"
                  onClick={() => setCodeModal(true)}
                  title="Expand fullscreen"
                >
                  <Maximize2 size={11} />
                </button>
              </div>
              {activeCode && <pre className="pseudo-code">{activeCode}</pre>}
            </div>
          )}
        </div>

        <div className="log-panel">
          <h3>System Logs</h3>
          <div className="logs-container">
            {logs.map((log, i) => (
              <div key={i} className={`log-entry ${log.type}`}>
                [{log.time.toLocaleTimeString()}] {log.msg}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </aside>

      {codeModal && activeCode && (
        <CodeModal
          title={`${nodeData.title || nodeData.label} (${codeLang === 'python' ? 'Python' : 'JavaScript'})`}
          code={activeCode}
          onClose={() => setCodeModal(false)}
        />
      )}
    </>
  );
}
