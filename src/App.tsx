import React, { useMemo, useState, useEffect } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { TopologyGraph } from './components/level2/TopologyGraph';
import { HumanBody } from './components/level1/HumanBody';
import './App.css';

type ViewMode = 'LEVEL1' | 'LEVEL2';

const CriticalModal: React.FC<{
  nodeName: string;
  onClose: () => void;
}> = ({ nodeName, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <span style={{ fontWeight: 600, color: '#fca5a5' }}>CRITICAL ALERT</span>
          <button style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '16px' }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <h2 style={{ margin: '0 0 12px 0', color: '#fff' }}>{nodeName} Malfunction</h2>
          <p style={{ color: '#9ca3af', lineHeight: 1.6, marginBottom: 24 }}>
            Critical instability detected in {nodeName}. Immediate intervention is recommended. 
            Please examine the causal topology graph to identify the root cause (e.g., viral agents or tissue damage).
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-critical" onClick={onClose}>ACKNOWLEDGE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Level 1: 3D 宏观人体
const Level1View: React.FC<{ switchToL2: () => void }> = ({ switchToL2 }) => {
  const { state, selectNode } = useSimulation();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const organs = useMemo(() => Object.values(state.nodes).filter(n => n.level === 'ORGAN'), [state.nodes]);
  const selectedOrganId = state.selectedNodeId || null;
  const selectedOrgan = selectedOrganId ? state.nodes[selectedOrganId] : null;

  const showModal = selectedOrgan && selectedOrgan.status === 'CRITICAL' && !dismissedIds.includes(selectedOrgan.id);
  const closeModal = () => {
    if (selectedOrgan) setDismissedIds(prev => [...prev, selectedOrgan.id]);
  };

  useEffect(() => {
    if (selectedOrgan && selectedOrgan.status === 'CRITICAL') {
      setDismissedIds(prev => prev.filter(id => id !== selectedOrgan.id));
    }
  }, [selectedOrgan]);

  return (
    <div className="page fade-in">
      <div className="topbar">
        <h1 className="title">Virtual Human <span style={{fontSize: '0.6em', opacity: 0.5}}>// LEVEL 1: MACRO</span></h1>
        {/* Topbar actions if needed */}
      </div>

      <div className="grid grid-2">
        <div className="panel" style={{ padding: 0, overflow: 'hidden', background: '#000' }}>
          <HumanBody organs={organs} selectedId={selectedOrganId} onSelect={selectNode} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            INTERACTION: LEFT CLICK TO SELECT • RIGHT CLICK TO ROTATE • SCROLL TO ZOOM
          </div>
        </div>

        <div className="panel">
          <h3 className="section-title">DIAGNOSTIC REPORT</h3>
          
          {selectedOrgan ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{selectedOrgan.name}</h2>
                <div className={`status-badge ${selectedOrgan.status === 'CRITICAL' ? 'critical' : ''}`} 
                     style={{ 
                       color: selectedOrgan.status === 'NORMAL' ? 'var(--primary)' : 
                              selectedOrgan.status === 'WARNING' ? 'var(--warning)' : 'var(--critical)' 
                     }}>
                  ● {selectedOrgan.status} STATUS
                </div>
              </div>

              <div className="info-row">
                <span>Activity Level</span>
                <span className="info-value">{(selectedOrgan.metrics.activity * 100).toFixed(1)}%</span>
              </div>
              <div className="info-row">
                <span>Stress Load</span>
                <span className="info-value">{(selectedOrgan.metrics.stress * 100).toFixed(1)}%</span>
              </div>
              
              <div className="report-box">
                <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '12px' }}>CLINICAL CONTEXT</div>
                {selectedOrgan.description || 'No specific clinical description available for this organ.'}
                <br /><br />
                <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '12px' }}>RECENT FINDINGS</div>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={switchToL2}>
                  <span>Analyze Causality</span>
                  <span>→</span>
                </button>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  Enter Level 2 to view cellular topology
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Select an organ from the 3D view to see details.
            </div>
          )}
        </div>
      </div>

      {showModal && selectedOrgan && (
        <CriticalModal nodeName={selectedOrgan.name} onClose={closeModal} />
      )}
    </div>
  );
};

// Level 2: 拓扑视图
const Level2View: React.FC<{ switchToL1: () => void }> = ({ switchToL1 }) => {
  const { state, updateNodeStatus, selectNode } = useSimulation();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const activeCenterId = state.selectedNodeId || Object.keys(state.nodes).find(id => state.nodes[id].level === 'ORGAN');

  const topologyData = useMemo(() => {
    if (!activeCenterId || !state.nodes[activeCenterId]) return null;

    const centerNode = state.nodes[activeCenterId];
    const relatedNodeIds = new Set<string>();
    centerNode.childrenIds?.forEach(id => relatedNodeIds.add(id));
    state.edges.forEach(edge => {
      if (edge.sourceId === activeCenterId) relatedNodeIds.add(edge.targetId);
      if (edge.targetId === activeCenterId) relatedNodeIds.add(edge.sourceId);
    });

    const relatedNodes = Array.from(relatedNodeIds)
      .map(id => state.nodes[id])
      .filter(Boolean);

    return { centerNode, relatedNodes, edges: state.edges };
  }, [state, activeCenterId]);

  const selectedNode = state.selectedNodeId ? state.nodes[state.selectedNodeId] : null;
  const showModal = selectedNode && selectedNode.status === 'CRITICAL' && !dismissedIds.includes(selectedNode.id);
  const closeModal = () => {
    if (selectedNode) setDismissedIds(prev => [...prev, selectedNode.id]);
  };

  useEffect(() => {
    if (selectedNode && selectedNode.status === 'CRITICAL') {
      setDismissedIds(prev => prev.filter(id => id !== selectedNode.id));
    }
  }, [selectedNode]);

  return (
    <div className="page fade-in">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={switchToL1}>← BACK</button>
          <h1 className="title">Level 2 <span style={{fontSize: '0.6em', opacity: 0.5}}>// MICRO TOPOLOGY</span></h1>
        </div>
      </div>
      
      <div className="grid grid-2r">
        <div className="panel">
          <h2 className="section-title">SYSTEM NODES</h2>
          <div className="list">
            {Object.values(state.nodes).map(node => (
              <div 
                key={node.id}
                onClick={() => selectNode(node.id)}
                className={`card card-${node.status.toLowerCase()} ${state.selectedNodeId === node.id ? 'card-selected' : ''}`}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{node.name}</div>
                <div className="info-row" style={{ marginBottom: '8px' }}>
                  <span>{node.level}</span>
                  <span>Act: {node.metrics.activity.toFixed(2)}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); updateNodeStatus(node.id, 'NORMAL'); }}>N</button>
                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); updateNodeStatus(node.id, 'WARNING'); }}>W</button>
                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); updateNodeStatus(node.id, 'CRITICAL'); }}>C</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          {topologyData ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <h3 className="section-title" style={{ fontSize: '18px' }}>{topologyData.centerNode.name}</h3>
                <p style={{ color: 'var(--text-dim)', margin: 0 }}>{topologyData.centerNode.description}</p>
              </div>
              <TopologyGraph 
                centerNode={topologyData.centerNode}
                relatedNodes={topologyData.relatedNodes}
                edges={topologyData.edges}
                width={800} // Consider dynamic width
                height={600} // Consider dynamic height
                onNodeClick={selectNode}
              />
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              Select a node to view topology
            </div>
          )}
        </div>
      </div>

      {showModal && selectedNode && (
        <CriticalModal nodeName={selectedNode.name} onClose={closeModal} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('LEVEL1');

  return (
    <SimulationProvider>
      {view === 'LEVEL1' ? (
        <Level1View switchToL2={() => setView('LEVEL2')} />
      ) : (
        <Level2View switchToL1={() => setView('LEVEL1')} />
      )}
    </SimulationProvider>
  );
};

export default App;
