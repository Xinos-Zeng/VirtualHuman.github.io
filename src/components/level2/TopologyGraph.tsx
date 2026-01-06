import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AgentNode, InteractionEdge } from '../../types/Agent';

interface TopologyGraphProps {
  centerNode: AgentNode;
  relatedNodes: AgentNode[];
  edges: InteractionEdge[];
  width?: number;
  height?: number;
  onNodeClick: (nodeId: string) => void;
}

// 扩展 D3 Node 类型
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  r: number;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  type: 'SUPPORT' | 'DAMAGE';
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string | SimulationNode;
  target: string | SimulationNode;
}

export const TopologyGraph: React.FC<TopologyGraphProps> = ({
  centerNode,
  relatedNodes,
  edges,
  width = 800,
  height = 600,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 使用 Ref 保存 D3 对象，避免在 React 重渲染中丢失状态
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);
  const nodesRef = useRef<SimulationNode[]>([]);
  const linksRef = useRef<SimulationLink[]>([]);

  // 1. 生成稳定的依赖 Key，只有当拓扑结构真正改变时（节点ID变了），才触发布局重置
  const structureKey = [
    centerNode.id,
    ...relatedNodes.map(n => n.id).sort(),
    ...edges.map(e => e.id).sort()
  ].join('|');

  // Effect 1: 处理拓扑结构变化 (初始化/重置 Simulation)
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 清理旧画布

    // --- 准备数据 ---
    const centerSimNode: SimulationNode = {
      id: centerNode.id,
      group: 'CENTER',
      r: 60,
      fx: width / 2, // 固定中心节点
      fy: height / 2,
      x: width / 2,
      y: height / 2
    };

    const otherSimNodes: SimulationNode[] = relatedNodes.map(node => ({
      id: node.id,
      group: node.parentId === centerNode.id ? 'INTERNAL' : 'EXTERNAL',
      r: node.level === 'TISSUE' ? 30 : 15,
      x: width / 2 + (Math.random() - 0.5) * 50, 
      y: height / 2 + (Math.random() - 0.5) * 50
    }));

    nodesRef.current = [centerSimNode, ...otherSimNodes];

    // 筛选有效连线
    const nodeIds = new Set(nodesRef.current.map(n => n.id));
    const relevantEdges = edges.filter(e => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));

    linksRef.current = relevantEdges.map(e => ({
      source: e.sourceId,
      target: e.targetId,
      type: e.type,
      intensity: e.intensity
    }));

    // --- 渲染静态元素 (Group, Defs) ---
    const g = svg.append("g");
    
    // 箭头定义
    svg.append("defs").selectAll("marker")
      .data(["SUPPORT", "DAMAGE"])
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => d === 'SUPPORT' ? '#0f0' : '#f00')
      .attr("d", "M0,-5L10,0L0,5");

    // --- 启动 Simulation (调整了参数以增加稳定性) ---
    simulationRef.current = d3.forceSimulation<SimulationNode>(nodesRef.current)
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(linksRef.current).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide().radius(d => (d as SimulationNode).r + 10))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05); // 加快冷却速度，让它们更快停下来

    // --- 初始渲染 DOM ---
    // Links
    g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linksRef.current)
      .join("line")
      .attr("stroke-width", d => d.intensity === 'HIGH' ? 4 : d.intensity === 'MEDIUM' ? 2 : 1)
      .attr("marker-end", d => `url(#arrow-${d.type})`);

    // Nodes (移除了 drag behavior)
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, SimulationNode>("g")
      .data(nodesRef.current)
      .join("g");

    node.append("circle")
      .attr("r", d => d.r)
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", d => d.r + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // --- Tick Update ---
    simulationRef.current.on("tick", () => {
      svg.selectAll(".links line")
        .attr("x1", d => (d as any).source.x)
        .attr("y1", d => (d as any).source.y)
        .attr("x2", d => (d as any).target.x)
        .attr("y2", d => (d as any).target.y);

      svg.selectAll(".nodes g")
        .attr("transform", d => {
            const node = d as SimulationNode;
            // 简单限制边界，防止飞出画布太远
            return `translate(${node.x},${node.y})`;
        });
    });

    return () => {
      simulationRef.current?.stop();
    };
  // eslint-disable-next-line
  }, [structureKey, width, height]);

  // Effect 2: 处理外观/属性变化 (颜色、文字、连线颜色)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const allNodesMap = new Map<string, AgentNode>();
    allNodesMap.set(centerNode.id, centerNode);
    relatedNodes.forEach(n => allNodesMap.set(n.id, n));

    svg.selectAll<SVGGElement, SimulationNode>(".nodes g")
      .each(function(d) {
          const latestData = allNodesMap.get(d.id);
          if (latestData) {
              const g = d3.select(this);
              
              g.select("circle")
               .attr("fill", () => {
                   switch (latestData.status) {
                       case 'CRITICAL': return '#ff0000';
                       case 'WARNING': return '#ffff00';
                       default: return '#00aaff';
                   }
               })
               .attr("fill-opacity", 0.2 + latestData.metrics.activity * 0.3)
               .attr("stroke", () => {
                   switch (latestData.status) {
                       case 'CRITICAL': return '#ff0000';
                       case 'WARNING': return '#ffff00';
                       default: return '#00aaff';
                   }
               })
               .style("cursor", "pointer")
               .on("click", (event) => {
                   onNodeClick(latestData.id);
                   event.stopPropagation();
               }); // 确保点击事件一直有效

              g.select("text").text(latestData.name);
          }
      });

    svg.selectAll(".links line")
       .attr("stroke", (d: any) => d.type === 'SUPPORT' ? '#00ff00' : '#ff0000')
       .attr("stroke-opacity", 0.6);

  }, [centerNode, relatedNodes, edges, onNodeClick]);

  return (
    <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        style={{ background: '#050510', border: '1px solid #333', borderRadius: '8px' }}
    />
  );
};
