import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgentNode } from '../../types/Agent';
import bodyImg from '../../assets/body.png';

interface HumanBodyProps {
  organs: AgentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDoubleClick?: (id: string, origin?: { x: number; y: number }) => void;
}

type Position = { x: number; y: number };

// 以图片百分比标注的节点坐标，后续可根据真实标注微调
const organPositions: Record<string, Position> = {
  'organ-brain': { x: 56, y: 8 },
  'organ-heart': { x: 58, y: 28 },
  'organ-liver': { x: 50, y: 34 },
  'organ-kidney': { x: 65, y: 36 },
  'organ-Intestine': { x: 55, y: 46 },
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
  }), [organs, onSelect, selectedId, handleNodeHover, handleNodeLeave]);

  return (
    <div className="body-stage">
      <div
        ref={containerRef}
        className="body-image-wrapper"
        style={{
          aspectRatio: `${ratio.w} / ${ratio.h}`,
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onWheel={handleWheel}
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
          title="重置视图"
        >
          重置
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
