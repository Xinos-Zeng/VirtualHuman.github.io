import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { AgentNode } from '../../types/Agent';
import bodyImg from '../../assets/body.png';
import { AppConfig } from '../../config/appConfig';

interface HumanBodyProps {
  organs: AgentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDoubleClick?: (id: string, origin?: { x: number; y: number }) => void;
}

type Position = { x: number; y: number };

// 以图片百分比标注的节点坐标
// 调整这些坐标可以移动节点位置，连线会自动跟随
// x: 水平位置 (0-100), y: 垂直位置 (0-100)
const organPositions: Record<string, Position> = {
  'organ-brain': { x: 51, y: 7 },
  'organ-heart': { x: 52, y: 28 },
  'organ-liver': { x: 45, y: 34 },
  'organ-kidney': { x: 59, y: 36 },
  'organ-Intestine': { x: 51, y: 46 },
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

export const HumanBody: React.FC<HumanBodyProps> = ({ organs, selectedId, onSelect, onDoubleClick }) => {
  const [ratio, setRatio] = useState({ w: 441, h: 1104 }); // 默认尺寸，用于保持纵横比
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<AgentNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // 鼠标拖动
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 重置视图
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 处理节点悬停
  const handleNodeHover = useCallback((node: AgentNode, e: React.MouseEvent) => {
    setHoveredNode(node);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // 生成从心脏到其他器官的连线
  const links = useMemo(() => {
    const heartNode = organs.find(n => n.id === 'organ-heart');
    if (!heartNode) return [];
    
    const heartPos = organPositions['organ-heart'];
    return organs
      .filter(n => n.id !== 'organ-heart')
      .map(node => {
        const targetPos = organPositions[node.id] || { x: 50, y: 50 };
        return {
          id: `link-${heartNode.id}-${node.id}`,
          x1: heartPos.x,
          y1: heartPos.y,
          x2: targetPos.x,
          y2: targetPos.y,
        };
      });
  }, [organs]);

  const markers = useMemo(() => organs.map(node => {
    const pos = organPositions[node.id] || { x: 50, y: 50 };
    const color = statusColor(node.status);
    const isSelected = selectedId === node.id;
    const statusClass = `body-${node.status.toLowerCase()}`;

    return (
      <div
        key={node.id}
        className={`body-marker ${statusClass} ${isSelected ? 'body-marker-selected' : ''}`}
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onDoubleClick) {
            onDoubleClick(node.id, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseEnter={(e) => handleNodeHover(node, e)}
        onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={handleNodeLeave}
      >
        <span className="body-marker-glow" style={{ boxShadow: `0 0 22px 6px ${color}55` }} />
        <span className="body-marker-dot" />
        <span className="body-marker-label" style={{ color }}>
          {node.name}
        </span>
      </div>
    );
  }), [organs, onSelect, selectedId, handleNodeHover, handleNodeLeave, onDoubleClick]);

  return (
    <div className="body-stage" onWheel={handleWheel}>
      <div
        ref={containerRef}
        className="body-image-wrapper"
        style={{
          aspectRatio: `${ratio.w} / ${ratio.h}`,
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={bodyImg}
          alt="人体底图"
          className="body-image"
          draggable={false}
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth && naturalHeight) {
              setRatio({ w: naturalWidth, h: naturalHeight });
            }
          }}
        />
        
        {/* 连线层 */}
        <svg 
          className="body-links-layer" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {links.map(link => (
            <g key={link.id}>
              <line
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke={AppConfig.links.strokeColor}
                strokeWidth={AppConfig.links.strokeWidth / 8}
                strokeOpacity={AppConfig.links.strokeOpacity}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                className="body-link-particle"
                r={AppConfig.links.particleSize / 8}
                fill={AppConfig.links.particleColor}
                style={{
                  filter: `drop-shadow(${AppConfig.links.particleGlow})`,
                }}
              >
                <animateMotion
                  dur={`${AppConfig.links.particleSpeed}s`}
                  repeatCount="indefinite"
                  path={`M ${link.x1},${link.y1} L ${link.x2},${link.y2}`}
                />
              </circle>
            </g>
          ))}
        </svg>
        
        {markers}
      </div>
      
      {/* 控制按钮 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
      }}>
        <button
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '12px' }}
          title="Reset view"
        >
          Reset
        </button>
        <div style={{
          background: 'rgba(8, 12, 22, 0.9)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {(scale * 100).toFixed(0)}%
        </div>
      </div>

      {/* 悬停弹窗 */}
      {hoveredNode && (
        <div
          className="hover-tooltip"
          style={{
            left: `${tooltipPos.x + 20}px`,
            top: `${tooltipPos.y + 10}px`,
          }}
        >
          <h3>{hoveredNode.name}</h3>
          <div
            className="status-badge"
            style={{
              color: hoveredNode.status === 'NORMAL' ? 'var(--primary)' :
                     hoveredNode.status === 'WARNING' ? 'var(--warning)' : 'var(--critical)',
              background: hoveredNode.status === 'NORMAL' ? 'rgba(56, 189, 248, 0.15)' :
                          hoveredNode.status === 'WARNING' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: hoveredNode.status === 'NORMAL' ? '1px solid rgba(56, 189, 248, 0.3)' :
                      hoveredNode.status === 'WARNING' ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            ● {hoveredNode.status} STATUS
          </div>
          <div className="tooltip-row">
            <span>Activity Level</span>
            <span className="value">{(hoveredNode.metrics.activity * 100).toFixed(1)}%</span>
          </div>
          <div className="tooltip-row">
            <span>Stress Load</span>
            <span className="value">{(hoveredNode.metrics.stress * 100).toFixed(1)}%</span>
          </div>
          {hoveredNode.description && (
            <div className="tooltip-description">
              {hoveredNode.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
