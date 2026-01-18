import React, { useMemo, useRef, useState } from 'react';
import { AgentNode, Literature } from '../../types/Agent';
import { AppConfig } from '../../config/appConfig';

interface HierarchyViewProps {
  currentNode: AgentNode;
  childNodes: AgentNode[];
  onNodeDoubleClick: (nodeId: string) => void;
  onBack: () => void;
  // 用于保持背景器官图（即使当前节点已深入到组织/细胞层）
  backgroundOrganId?: string;
}

// 器官背景图路径映射（使用相对路径以兼容 GitHub Pages）
const organBackgrounds: Record<string, string> = {
  'organ-heart': './assets/organs/heart-bg.jpg',
  'organ-liver': './assets/organs/liver-bg.jpg',
  'organ-kidney': './assets/organs/kidney-bg.jpg',
  'organ-Intestine': './assets/organs/intestine-bg.jpg',
  'organ-brain': './assets/organs/brain-bg.jpg',
};

const statusColor = (status: AgentNode['status']) => {
  switch (status) {
    case 'CRITICAL':
      return '#ef4444';
    case 'WARNING':
      return '#facc15';
    default:
      return '#38bdf8';
  }
};

// 基于字符串生成稳定的伪随机数（0~1）
const hash01 = (input: string) => {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 转为 0~1
  return (h >>> 0) / 4294967295;
};

// 生成围绕中心的圆形分布位置（基于索引和总数）
const circularPosition = (index: number, total: number, radius: number = 30) => {
  // 从顶部开始，顺时针分布
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
};

export const HierarchyView: React.FC<HierarchyViewProps> = ({
  currentNode,
  childNodes,
  onNodeDoubleClick,
  onBack,
  backgroundOrganId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const positionCacheRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const fallbackLiterature: Literature[] = useMemo(() => {
    const nodeName = currentNode?.name || 'Node';
    const organId = backgroundOrganId || (currentNode.level === 'ORGAN' ? currentNode.id : 'organ');
    return [
      {
        title: `${nodeName} 的结构与功能综述（模拟）`,
        authors: 'Virtual Human Lab',
        journal: 'Simulated Systems Biology',
        year: 2025,
        summary: `用于演示的模拟引用：概述 ${nodeName} 在层级网络中的结构位置与功能角色（organ=${organId}）。`,
        doi: '10.0000/sim.vh.2025.001',
      },
      {
        title: `${nodeName} 指标波动与稳定性分析（模拟）`,
        authors: 'Virtual Human Lab',
        journal: 'Digital Physiology',
        year: 2024,
        summary: `用于演示的模拟引用：讨论 activity/stress 等指标在实时更新下的可视化策略与稳定布局方法。`,
        doi: '10.0000/sim.vh.2024.008',
      },
    ];
  }, [backgroundOrganId, currentNode.id, currentNode.level, currentNode.name]);

  // 获取背景图（如果当前是器官的话）
  const backgroundImage = useMemo(() => {
    const organId = backgroundOrganId || (currentNode.level === 'ORGAN' ? currentNode.id : undefined);
    if (!organId) return undefined;
    return organBackgrounds[organId];
  }, [currentNode.id, currentNode.level, backgroundOrganId]);

  // 为每个子节点生成围绕中心的圆形分布位置
  const visualNodes = useMemo(() => {
    return childNodes.map((node, index) => {
      const pos = circularPosition(index, childNodes.length, 32);
      return { node, x: pos.x, y: pos.y, key: node.id };
    });
  }, [childNodes]);

  const selectedNode = selectedNodeId ? childNodes.find(n => n.id === selectedNodeId) : undefined;
  const selectedNodeLiterature: Literature[] =
    selectedNode?.literature && selectedNode.literature.length > 0 ? selectedNode.literature : fallbackLiterature;

  return (
    <div 
      className="hierarchy-container"
    >
      <div className="hierarchy-view-wrapper">
        <div className="hierarchy-view">
          {/* 连线层：中心到子节点，带流动光点 */}
          <svg 
            className="hierarchy-links" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 2,
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {visualNodes.map(({ node, x, y, key }) => (
              <g key={`link-${key}`}>
                <line
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke={AppConfig.links.strokeColor}
                  strokeWidth={AppConfig.links.strokeWidth / 10}
                  strokeOpacity={AppConfig.links.strokeOpacity}
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  className="hierarchy-link-particle"
                  r={AppConfig.links.particleSize / 10}
                  fill={AppConfig.links.particleColor}
                  style={{
                    filter: `drop-shadow(${AppConfig.links.particleGlow})`,
                  }}
                >
                  <animateMotion
                    dur={`${AppConfig.links.particleSpeed}s`}
                    repeatCount="indefinite"
                    path={`M 50,50 L ${x},${y}`}
                  />
                </circle>
              </g>
            ))}
          </svg>

          {/* 背景图层 */}
          {backgroundImage && (
            <div 
              className="hierarchy-background"
              style={{
                backgroundImage: `url(${backgroundImage})`,
              }}
            />
          )}
          
          {/* 虚化遮罩层 */}
          <div className="hierarchy-overlay" />

        {/* 返回按钮 */}
        <div className="hierarchy-header">
          <button className="btn btn-secondary" onClick={onBack}>
            ← BACK
          </button>
          <div className="hierarchy-title">
            <h2>{currentNode.name}</h2>
            <p className="hierarchy-subtitle">{currentNode.level} LEVEL VIEW</p>
          </div>
        </div>

        {/* 节点层 */}
        <div className="hierarchy-nodes">
          {/* 中心节点（当前层级的父节点） */}
          <div
            className={`hierarchy-node hierarchy-center-node hierarchy-node-${currentNode.status.toLowerCase()}`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) scale(1.3)',
              '--node-color': statusColor(currentNode.status),
              zIndex: 10,
            } as React.CSSProperties}
            onClick={() => setSelectedNodeId(null)}
          >
            <span className="hierarchy-node-glow" />
            <span className="hierarchy-node-dot" />
            <span className="hierarchy-node-label" style={{ color: statusColor(currentNode.status) }}>
              {currentNode.name}
            </span>
          </div>

          {/* 围绕中心的子节点 */}
          {visualNodes.map(({ node, x, y, key }) => {
            const color = statusColor(node.status);
            const isHovered = hoveredId === node.id;
            const isSelected = selectedNodeId === node.id;
            
            return (
              <div
                key={key}
                className={`hierarchy-node hierarchy-node-${node.status.toLowerCase()} ${isSelected ? 'hierarchy-node-selected' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: isHovered ? `translate(-50%, -50%) scale(${AppConfig.hierarchy.hoverScale})` : 'translate(-50%, -50%)',
                  '--node-color': color,
                } as React.CSSProperties}
                onClick={() => setSelectedNodeId(node.id)}
                onDoubleClick={() => onNodeDoubleClick(node.id)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span className="hierarchy-node-glow" />
                <span className="hierarchy-node-dot" />
                {isHovered && (
                  <span className="hierarchy-node-label" style={{ color }}>
                    {node.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 提示信息 */}
        <div className="hierarchy-hint">
          单击选择节点 • 双击继续放大
        </div>
      </div>

      {/* 右侧信息卡片 */}
      <div className="hierarchy-info-panel panel">
        <h3 className="section-title">NODE DETAILS</h3>
        
        {selectedNode ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{selectedNode.name}</h2>
              <div className={`status-badge ${selectedNode.status === 'CRITICAL' ? 'critical' : ''}`} 
                   style={{ 
                     color: selectedNode.status === 'NORMAL' ? 'var(--primary)' : 
                            selectedNode.status === 'WARNING' ? 'var(--warning)' : 'var(--critical)',
                     background: selectedNode.status === 'NORMAL' ? 'rgba(56, 189, 248, 0.15)' :
                                selectedNode.status === 'WARNING' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                     border: selectedNode.status === 'NORMAL' ? '1px solid rgba(56, 189, 248, 0.3)' :
                            selectedNode.status === 'WARNING' ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                   }}>
                ● {selectedNode.status} STATUS
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
                    <div className="status-metric-value">{(selectedNode.metrics.activity * 100).toFixed(1)}%</div>
                  </div>
                  <div className="status-metric">
                    <div className="status-metric-label">Stress</div>
                    <div className="status-metric-value">{(selectedNode.metrics.stress * 100).toFixed(1)}%</div>
                  </div>
                </div>
                {selectedNode.description && (
                  <div className="status-description">
                    {selectedNode.description}
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
                {selectedNodeLiterature && selectedNodeLiterature.length > 0 ? (
                  <div className="literature-list">
                    {selectedNodeLiterature.map((lit, idx) => (
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
              {selectedNode.childrenIds && selectedNode.childrenIds.length > 0 && (
                <>
                  <button 
                    className="btn" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                    onClick={() => onNodeDoubleClick(selectedNode.id)}
                  >
                    <span>Zoom In Deeper</span>
                    <span>→</span>
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Double-click node or click here to explore sub-level
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ height: '100%' }}>
            <div className="empty-state-icon">👆</div>
          <div>点击节点查看详情</div>
        </div>
        )}
      </div>
      {/* 右侧卡片弹窗 */}
      {showDetailModal && selectedNode && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>节点详情</span>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }} onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{selectedNode.name}</h2>
              <div className={`status-badge ${selectedNode.status === 'CRITICAL' ? 'critical' : ''}`} 
                   style={{ 
                     color: selectedNode.status === 'NORMAL' ? 'var(--primary)' : 
                            selectedNode.status === 'WARNING' ? 'var(--warning)' : 'var(--critical)',
                     background: selectedNode.status === 'NORMAL' ? 'rgba(56, 189, 248, 0.15)' :
                                selectedNode.status === 'WARNING' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                     border: selectedNode.status === 'NORMAL' ? '1px solid rgba(56, 189, 248, 0.3)' :
                            selectedNode.status === 'WARNING' ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                   }}>
                ● {selectedNode.status} STATUS
              </div>
              {selectedNode.description && (
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '16px' }}>{selectedNode.description}</p>
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
                      <div className="status-metric-value">{(selectedNode.metrics.activity * 100).toFixed(1)}%</div>
                    </div>
                    <div className="status-metric">
                      <div className="status-metric-label">Stress</div>
                      <div className="status-metric-value">{(selectedNode.metrics.stress * 100).toFixed(1)}%</div>
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
                  {selectedNodeLiterature.map((lit, idx) => (
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
