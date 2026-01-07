import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

interface DebugPanelProps {
  onBack?: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ onBack }) => {
  const { state, updateNodeStatus, selectNode } = useSimulation();

  return (
    <div className="page fade-in">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button className="btn btn-secondary" onClick={onBack}>
              ← BACK
            </button>
          )}
          <h1 className="title">Debug Console <span style={{fontSize: '0.6em', opacity: 0.5}}>// NODE STATUS CONTROL</span></h1>
        </div>
      </div>

      <div className="panel" style={{ flex: 1, overflow: 'hidden' }}>
        <h2 className="section-title">ALL SYSTEM NODES</h2>
        <div className="list">
          {Object.values(state.nodes).map(node => (
            <div 
              key={node.id}
              onClick={() => selectNode(node.id)}
              className={`card card-${node.status.toLowerCase()} ${state.selectedNodeId === node.id ? 'card-selected' : ''}`}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{node.name}</div>
              <div className="info-row" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>{node.level}</span>
                <span style={{ fontSize: '11px' }}>Act: {node.metrics.activity.toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '2px 8px', fontSize: '10px' }} 
                  onClick={(e) => { e.stopPropagation(); updateNodeStatus(node.id, 'NORMAL'); }}
                >
                  NORMAL
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '2px 8px', fontSize: '10px' }} 
                  onClick={(e) => { e.stopPropagation(); updateNodeStatus(node.id, 'WARNING'); }}
                >
                  WARNING
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '2px 8px', fontSize: '10px' }} 
                  onClick={(e) => { e.stopPropagation(); updateNodeStatus(node.id, 'CRITICAL'); }}
                >
                  CRITICAL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

