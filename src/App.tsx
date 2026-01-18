import React, { useMemo, useState, useEffect } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { HumanBody } from './components/level1/HumanBody';
import { HierarchyView } from './components/level2/HierarchyView';
import { DebugPanel } from './components/debug/DebugPanel';
import './App.css';
import { AppConfig } from './config/appConfig';

type ViewMode = 'LEVEL1' | 'DEBUG' | 'HIERARCHY';

interface HierarchyState {
  nodeId: string;
  history: string[]; // 用于追踪导航历史
}

type TransitionState =
  | { active: false }
  | { active: true; nodeId: string; origin: { x: number; y: number } };

const buildStarBackground = (count: number, maxSize: number) => {
  const gradients: string[] = [];
  for (let i = 0; i < count; i++) {
    const size = (Math.random() * (maxSize - 1)) + 1; // 1 ~ maxSize px
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    gradients.push(`radial-gradient(circle ${size}px at ${x}% ${y}%, white 0%, transparent 100%)`);
  }
  return gradients.join(',');
};

// 器官背景图路径映射（用于过渡动画与二级窗口背景）
const organBackgrounds: Record<string, string> = {
  'organ-heart': '/assets/organs/heart-bg.jpg',
  'organ-liver': '/assets/organs/liver-bg.jpg',
  'organ-kidney': '/assets/organs/kidney-bg.jpg',
  'organ-Intestine': '/assets/organs/intestine-bg.jpg',
  'organ-brain': '/assets/organs/brain-bg.jpg',
};

const HierarchyTransitionOverlay: React.FC<{ state: TransitionState; zoomScale: number }> = ({ state, zoomScale }) => {
  if (!state.active) return null;
  const bg = organBackgrounds[state.nodeId];
  return (
    <div className="transition-overlay" aria-hidden="true">
      <div className="transition-backdrop" />
      <div
        className="transition-portal"
        style={
          {
            '--x': `${state.origin.x}px`,
            '--y': `${state.origin.y}px`,
            '--transition-zoom-scale': zoomScale,
            backgroundImage: bg ? `url(${bg})` : undefined,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

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
            Please examine the hierarchy view to identify the root cause.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-critical" onClick={onClose}>ACKNOWLEDGE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Level 1: 器官宏观视图
const Level1View: React.FC<{ 
  onDebug: () => void; 
  onEnterHierarchy: (nodeId: string, origin?: { x: number; y: number }) => void;
}> = ({ onDebug, onEnterHierarchy }) => {
  const { state, selectNode } = useSimulation();
  const [criticalAcknowledged, setCriticalAcknowledged] = useState<Set<string>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);

  const organs = useMemo(() => Object.values(state.nodes).filter(n => n.level === 'ORGAN'), [state.nodes]);
  const selectedOrganId = state.selectedNodeId || null;
  const selectedOrgan = selectedOrganId ? state.nodes[selectedOrganId] : null;

  const showModal = selectedOrgan && selectedOrgan.status === 'CRITICAL' && !criticalAcknowledged.has(selectedOrgan.id);
  const closeModal = () => {
    if (selectedOrgan) {
      setCriticalAcknowledged(prev => new Set(prev).add(selectedOrgan.id));
    }
  };

  // 当节点状态变为非CRITICAL时，清除其acknowledged标记
  useEffect(() => {
    const criticalNodeIds = new Set(
      Object.values(state.nodes)
        .filter(n => n.status === 'CRITICAL')
        .map(n => n.id)
    );
    
    setCriticalAcknowledged(prev => {
      const newSet = new Set<string>();
      prev.forEach(id => {
        if (criticalNodeIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [state.nodes]);

  return (
    <div className="page fade-in">
      <div className="topbar">
        <h1 className="title">Virtual Human <span style={{fontSize: '0.6em', opacity: 0.5}}>// LEVEL 1: MACRO</span></h1>
        <button className="btn btn-secondary" onClick={onDebug}>
          DEBUG CONSOLE
        </button>
      </div>

      <div className="grid grid-2">
        <div className="panel panel-ghost">
          <HumanBody 
            organs={organs} 
            selectedId={selectedOrganId} 
            onSelect={selectNode}
            onDoubleClick={onEnterHierarchy}
          />
          <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            单击选择 • 双击放大进入 • 滚轮缩放 • 拖动查看
          </div>
        </div>

        <div className="panel">
          <h3 className="section-title">DIAGNOSTIC REPORT</h3>
          
          {selectedOrgan ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{selectedOrgan.name}</h2>
                <div className={`status-badge ${selectedOrgan.status === 'CRITICAL' ? 'critical' : ''}`} 
                     style={{ 
                       color: selectedOrgan.status === 'NORMAL' ? 'var(--primary)' : 
                              selectedOrgan.status === 'WARNING' ? 'var(--warning)' : 'var(--critical)',
                       background: selectedOrgan.status === 'NORMAL' ? 'rgba(56, 189, 248, 0.15)' :
                                  selectedOrgan.status === 'WARNING' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                       border: selectedOrgan.status === 'NORMAL' ? '1px solid rgba(56, 189, 248, 0.3)' :
                              selectedOrgan.status === 'WARNING' ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                     }}>
                  ● {selectedOrgan.status} STATUS
                </div>
              </div>

              {/* 状态信息区 */}
              <div 
                className="info-section"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowDetailModal(true)}
                title="点击查看详情"
              >
                <div className="info-section-header">
                  <span className="info-section-icon">📊</span>
                  <span className="info-section-title">Status Information</span>
                </div>
                <div className="info-section-content">
                  <div className="status-info-grid">
                    <div className="status-metric">
                      <div className="status-metric-label">Activity</div>
                      <div className="status-metric-value">{(selectedOrgan.metrics.activity * 100).toFixed(1)}%</div>
                    </div>
                    <div className="status-metric">
                      <div className="status-metric-label">Stress</div>
                      <div className="status-metric-value">{(selectedOrgan.metrics.stress * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  {selectedOrgan.description && (
                    <div className="status-description">
                      {selectedOrgan.description}
                    </div>
                  )}
                </div>
              </div>

              {/* 文献信息区 */}
              <div 
                className="info-section"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowDetailModal(true)}
                title="点击查看详情"
              >
                <div className="info-section-header">
                  <span className="info-section-icon">📚</span>
                  <span className="info-section-title">Related Literature</span>
                </div>
                <div className="info-section-content">
                  {selectedOrgan.literature && selectedOrgan.literature.length > 0 ? (
                    <div className="literature-list">
                      {selectedOrgan.literature.map((lit, idx) => (
                        <div key={idx} className="literature-item">
                          <div className="literature-title">{lit.title}</div>
                          <div className="literature-meta">
                            <span className="literature-meta-item">✍️ {lit.authors}</span>
                            <span className="literature-meta-item">📖 {lit.journal}</span>
                            <span className="literature-meta-item">📅 {lit.year}</span>
                          </div>
                          <div className="literature-summary">{lit.summary}</div>
                          {lit.doi && (
                            <a 
                              href={`https://doi.org/${lit.doi}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="literature-doi"
                            >
                              🔗 DOI: {lit.doi}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">📄</div>
                      <div>No literature data available</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button 
                  className="btn" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                  onClick={() => onEnterHierarchy(selectedOrgan.id)}
                >
                  <span>Zoom In (Double-click)</span>
                  <span>→</span>
                </button>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  Enter hierarchy view to explore sub-levels
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <div className="empty-state-icon">👆</div>
              <div>Select an organ to see details.</div>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedOrgan && (
        <CriticalModal nodeName={selectedOrgan.name} onClose={closeModal} />
      )}
      
      {/* 详情弹窗 */}
      {showDetailModal && selectedOrgan && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>器官详情</span>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }} onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{selectedOrgan.name}</h2>
              <div className={`status-badge ${selectedOrgan.status === 'CRITICAL' ? 'critical' : ''}`} 
                   style={{ 
                     color: selectedOrgan.status === 'NORMAL' ? 'var(--primary)' : 
                            selectedOrgan.status === 'WARNING' ? 'var(--warning)' : 'var(--critical)',
                     background: selectedOrgan.status === 'NORMAL' ? 'rgba(56, 189, 248, 0.15)' :
                                selectedOrgan.status === 'WARNING' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                     border: selectedOrgan.status === 'NORMAL' ? '1px solid rgba(56, 189, 248, 0.3)' :
                            selectedOrgan.status === 'WARNING' ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                   }}>
                ● {selectedOrgan.status} STATUS
              </div>
              {selectedOrgan.description && (
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '16px' }}>{selectedOrgan.description}</p>
              )}
              
              {/* 指标信息 */}
              <div className="info-section" style={{ marginTop: '12px' }}>
                <div className="info-section-header">
                  <span className="info-section-icon">📊</span>
                  <span className="info-section-title">Metrics</span>
                </div>
                <div className="info-section-content">
                  <div className="status-info-grid">
                    <div className="status-metric">
                      <div className="status-metric-label">Activity</div>
                      <div className="status-metric-value">{(selectedOrgan.metrics.activity * 100).toFixed(1)}%</div>
                    </div>
                    <div className="status-metric">
                      <div className="status-metric-label">Stress</div>
                      <div className="status-metric-value">{(selectedOrgan.metrics.stress * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="info-section" style={{ marginTop: '12px' }}>
                <div className="info-section-header">
                  <span className="info-section-icon">📚</span>
                  <span className="info-section-title">Related Literature</span>
                </div>
                <div className="info-section-content">
                  {selectedOrgan.literature && selectedOrgan.literature.length > 0 ? (
                    selectedOrgan.literature.map((lit, idx) => (
                      <div key={idx} className="literature-item">
                        <div className="literature-title">{lit.title}</div>
                        <div className="literature-meta">
                          <span className="literature-meta-item">✍️ {lit.authors}</span>
                          <span className="literature-meta-item">📖 {lit.journal}</span>
                          <span className="literature-meta-item">📅 {lit.year}</span>
                        </div>
                        <div className="literature-summary">{lit.summary}</div>
                        {lit.doi && (
                          <a 
                            href={`https://doi.org/${lit.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="literature-doi"
                          >
                            🔗 DOI: {lit.doi}
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">📄</div>
                      <div>No literature data available</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hierarchy View: 递归层级视图
const HierarchyViewWrapper: React.FC<{
  hierarchyState: HierarchyState;
  onBack: () => void;
  onNavigate: (nodeId: string) => void;
}> = ({ hierarchyState, onBack, onNavigate }) => {
  const { state } = useSimulation();
  
  const currentNode = state.nodes[hierarchyState.nodeId];

  // 向上追溯到器官节点，确保二级窗口背景一直是“器官图”
  const backgroundOrganId = useMemo(() => {
    if (!currentNode) return undefined;
    let cursor = currentNode;
    let guard = 0;
    while (cursor.level !== 'ORGAN' && cursor.parentId && guard < 10) {
      const parent = state.nodes[cursor.parentId];
      if (!parent) break;
      cursor = parent;
      guard += 1;
    }
    return cursor.level === 'ORGAN' ? cursor.id : undefined;
  }, [currentNode, state.nodes]);

  const childNodes = useMemo(() => {
    if (!currentNode || !currentNode.childrenIds) return [];
    return currentNode.childrenIds
      .map(id => state.nodes[id])
      .filter(Boolean);
  }, [currentNode, state.nodes]);

  if (!currentNode) {
    return (
      <div className="page fade-in">
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
          Node not found
        </div>
      </div>
    );
  }

  const handleDoubleClick = (childId: string) => {
    const childNode = state.nodes[childId];
    // 只有当子节点还有下级时才允许继续放大
    if (childNode && childNode.childrenIds && childNode.childrenIds.length > 0) {
      onNavigate(childId);
    }
  };

  return (
    <HierarchyView
      currentNode={currentNode}
      childNodes={childNodes}
      onNodeDoubleClick={handleDoubleClick}
      onBack={onBack}
      backgroundOrganId={backgroundOrganId}
    />
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('LEVEL1');
  const [hierarchyState, setHierarchyState] = useState<HierarchyState>({
    nodeId: '',
    history: [],
  });
  const [transition, setTransition] = useState<TransitionState>({ active: false });

  // 初始化全局样式变量（星空、节点尺寸、光晕强度、过渡倍率）
  useEffect(() => {
    const root = document.documentElement;
    const starCount = Math.max(4, Math.round(AppConfig.starfield.baseCount * AppConfig.starfield.density));
    const starBg = buildStarBackground(starCount, AppConfig.starfield.maxSize);
    root.style.setProperty('--star-bg', starBg);
    root.style.setProperty('--hier-node-size', `${AppConfig.hierarchy.nodeSize}px`);
    root.style.setProperty('--hier-node-glow', `${AppConfig.hierarchy.glowScale}`);
    root.style.setProperty('--transition-zoom-scale', `${AppConfig.transition.zoomScale}`);
  }, []);

  const handleEnterHierarchy = (nodeId: string, origin?: { x: number; y: number }) => {
    const fallbackOrigin = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const finalOrigin = origin || fallbackOrigin;
    setTransition({ active: true, nodeId, origin: finalOrigin });

    // 先播放“放大+虚化”过渡，再切换到二级界面
    window.setTimeout(() => {
      setHierarchyState({
        nodeId,
        history: [nodeId],
      });
      setView('HIERARCHY');
    }, AppConfig.transition.switchDelayMs);

    // 过渡层稍后移除（避免硬切）
    window.setTimeout(() => {
      setTransition({ active: false });
    }, AppConfig.transition.durationMs);
  };

  const handleNavigateHierarchy = (nodeId: string) => {
    setHierarchyState(prev => ({
      nodeId,
      history: [...prev.history, nodeId],
    }));
  };

  const handleBackHierarchy = () => {
    setHierarchyState(prev => {
      const newHistory = [...prev.history];
      newHistory.pop();
      
      if (newHistory.length === 0) {
        setView('LEVEL1');
        return { nodeId: '', history: [] };
      }
      
      return {
        nodeId: newHistory[newHistory.length - 1],
        history: newHistory,
      };
    });
  };

  return (
    <SimulationProvider>
      <HierarchyTransitionOverlay state={transition} zoomScale={AppConfig.transition.zoomScale} />
      {view === 'LEVEL1' && (
        <Level1View 
          onDebug={() => setView('DEBUG')}
          onEnterHierarchy={handleEnterHierarchy}
        />
      )}
      {view === 'DEBUG' && (
        <DebugPanel onBack={() => setView('LEVEL1')} />
      )}
      {view === 'HIERARCHY' && (
        <HierarchyViewWrapper
          hierarchyState={hierarchyState}
          onBack={handleBackHierarchy}
          onNavigate={handleNavigateHierarchy}
        />
      )}
    </SimulationProvider>
  );
};

export default App;
