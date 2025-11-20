import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { useVirtualHuman, NODE_STATES } from '../../context/VirtualHumanContext';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 700px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
`;

const FilterContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const FilterButton = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  background-color: ${props => props.active ? '#3f51b5' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#303f9f' : '#bdbdbd'};
  }
`;


// 添加缩放控制器
const ZoomControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
`;

const ZoomButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: white;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ResetButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background-color: white;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin-top: 5px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

// 根据节点类型获取颜色，考虑节点是否已激活
const riskColorMap = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336'
};

const getNodeColor = (node) => {
  if (!node || !node.isActivated) {
    return '#9e9e9e';
  }
  
  if (node.type === 'root') {
    return '#3f51b5';
  }
  
  const baseColor = riskColorMap[node.riskLevel] || '#4caf50';
  
  switch (node.type) {
    case 'organ':
      return d3.color(baseColor).darker(0.5);
    case 'tissue':
      return baseColor;
    case 'cell':
      return d3.color(baseColor).brighter(0.3);
    case 'target':
      return d3.color(baseColor).brighter(0.6);
    default:
      return baseColor;
  }
};

// 根据节点类型获取大小
const getNodeSize = (type) => {
  switch (type) {
    case 'root':
      return 18; // 根节点最大
    case 'organ':
      return 15;
    case 'tissue':
      return 10;
    case 'cell':
      return 8;
    case 'target':
      return 8;
    default:
      return 15;
  }
};

// 所有节点都使用圆形，不再使用D3形状


const NodeGraph = () => {
  const svgRef = useRef(null);
  const {
    data, // 添加data以访问最新节点状态
    visibleNodeTypes,
    toggleNodeTypeVisibility,
    getVisibleNodes,
    getVisibleConnections,
    activeConnections: activeConnectionState,
    getActiveConnections,
    selectedNode: selectedNodeId, // 修正属性名称
    setSelectedNode,
    setInfoPanelVisible,
    // 模拟相关
    isSimulating,
    getNodeBubble,
    simulationStep
  } = useVirtualHuman();
  
  // 存储当前的缩放和平移状态
  const zoomRef = useRef(null);
  // 存储动画元素的引用
  const animationRef = useRef([]);
  // 保存当前的缩放变换状态
  const transformRef = useRef(d3.zoomIdentity);
  
  // 渲染节点图
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 清除之前的内容
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // 创建一个用于缩放和平移的容器
    const g = svg.append("g")
      .attr("class", "zoom-container");
    
    // 定义缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5]) // 允许缩放的范围
      .on("zoom", (event) => {
        // 更新变换状态
        transformRef.current = event.transform;
        g.attr("transform", event.transform);
      });
    
    // 应用缩放行为到SVG
    svg.call(zoom);
    
    // 保存zoom引用以便外部控制
    zoomRef.current = zoom;
    
    // 应用保存的缩放状态，而不是重置为初始状态
    svg.call(zoom.transform, transformRef.current);
    
    const visibleNodes = getVisibleNodes();
    const visibleConnections = getVisibleConnections();
    const activeConnections = getActiveConnections();
    
    // 添加水平分隔线表示层级
    const levelHeight = 700 / 6; // 分为5层：根节点、器官、组织、细胞、靶点
    
    // 添加背景分隔线和标签
    const levelNames = ['根节点层', '器官层级', '组织层级', '细胞层级', '靶点层级'];
    
    for (let i = 1; i <= 5; i++) {
      // 添加水平分隔线
      g.append("line")
        .attr("x1", 0)
        .attr("y1", levelHeight * i)
        .attr("x2", width)
        .attr("y2", levelHeight * i)
        .attr("stroke", "#f0f0f0")
        .attr("stroke-width", 1);
      
      // 添加层级标签
      g.append("text")
        .attr("x", 20)
        .attr("y", levelHeight * i - 10)
        .text(levelNames[i-1])
        .attr("fill", "#757575")
        .attr("font-size", "14px")
        .attr("font-weight", "500");
    }
    
    // 绘制连接线
    const links = g.selectAll(".link")
      .data(visibleConnections)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", d => {
        const sourceNode = visibleNodes.find(node => node.id === d.from);
        return sourceNode ? sourceNode.position.x : 0;
      })
      .attr("y1", d => {
        const sourceNode = visibleNodes.find(node => node.id === d.from);
        return sourceNode ? sourceNode.position.y : 0;
      })
      .attr("x2", d => {
        const targetNode = visibleNodes.find(node => node.id === d.to);
        return targetNode ? targetNode.position.x : 0;
      })
      .attr("y2", d => {
        const targetNode = visibleNodes.find(node => node.id === d.to);
        return targetNode ? targetNode.position.y : 0;
      })
      .attr("stroke", "#90caf9")
      .attr("stroke-width", d => d.strength * 2)
      .attr("stroke-dasharray", d => d.direction === "bidirectional" ? "0" : "5,5")
      .attr("opacity", 0.6);
    
    // 清除之前的动画引用
    animationRef.current = [];
    
    // 只为激活的连接添加动画光点
    if (isSimulating && activeConnections.length > 0) {
      // 为每条激活的连接线添加动画光点
      activeConnections.forEach(connection => {
        const sourceNode = visibleNodes.find(node => node.id === connection.from);
        const targetNode = visibleNodes.find(node => node.id === connection.to);
        
        if (sourceNode && targetNode) {
          // 创建光点
          const dot = g.append("circle")
            .attr("r", 3)
            .attr("fill", "#2196f3");
          
          // 动画函数
          function animateDot() {
            dot.attr("cx", sourceNode.position.x)
               .attr("cy", sourceNode.position.y)
               .transition()
               .duration(2000 / connection.strength)
               .attr("cx", targetNode.position.x)
               .attr("cy", targetNode.position.y)
               .on("end", () => {
                 if (connection.direction === "bidirectional") {
                   dot.attr("cx", targetNode.position.x)
                      .attr("cy", targetNode.position.y)
                      .transition()
                      .duration(2000 / connection.strength)
                      .attr("cx", sourceNode.position.x)
                      .attr("cy", sourceNode.position.y)
                      .on("end", animateDot);
                 } else {
                   animateDot();
                 }
               });
          }
          
          // 开始动画
          animateDot();
          
          // 保存动画引用
          animationRef.current.push(dot);
        }
      });
    }
    
    // 创建节点组
    const nodeGroups = g.selectAll(".node")
      .data(visibleNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.position.x}, ${d.position.y})`)
      .attr("data-id", d => d.id) // 添加数据ID属性，便于后续查找
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation(); // 防止冒泡到SVG
        setSelectedNode(d.id);
        setInfoPanelVisible(true); // 自动展开信息面板
      })
      .on("mouseover", function() {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", d => getNodeSize(d.type) * 1.2);
      })
      .on("mouseout", function() {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", d => getNodeSize(d.type));
      });
    
    // 为选中的节点添加高亮效果
    if (selectedNodeId) {
      const selected = visibleNodes.find(node => node.id === selectedNodeId);
      if (selected) {
        const selectedGroup = g.append("g")
          .attr("transform", `translate(${selected.position.x}, ${selected.position.y})`);
        
        // 添加脉动动画效果
        const pulse = selectedGroup.append("circle")
          .attr("r", getNodeSize(selected.type) + 5)
          .attr("fill", "none")
          .attr("stroke", "#3f51b5")
          .attr("stroke-width", 2)
          .attr("opacity", 0.8);
        
        // 添加脉动动画
        function pulseAnimation() {
          pulse.transition()
            .duration(1000)
            .attr("r", getNodeSize(selected.type) + 10)
            .attr("opacity", 0.2)
            .transition()
            .duration(1000)
            .attr("r", getNodeSize(selected.type) + 5)
            .attr("opacity", 0.8)
            .on("end", pulseAnimation);
        }
        
        pulseAnimation();
      }
    }
    
    // 添加节点圆形（仅保留一个圆形，移除外围状态圆球）
    nodeGroups.append("circle")
      .attr("r", d => getNodeSize(d.type))
      .attr("fill", d => getNodeColor(d))
      .attr("stroke", d => d.id === selectedNodeId ? "#3f51b5" : "#333")
      .attr("stroke-width", d => d.id === selectedNodeId ? 3 : 1)
      .attr("opacity", d => d.id === selectedNodeId ? 1 : 0.9)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id);
        setInfoPanelVisible(true); // 自动展开信息面板
      });
    
    // 移除节点文字标签，防止节点密集时重叠
    
    // 点击空白处取消选中
    svg.on("click", () => {
      setSelectedNode(null);
    });
    
  // 使用useMemo缓存节点和连接数据，避免不必要的重新计算
  }, [
    visibleNodeTypes, 
    data.nodes,
    data.connections,
    isSimulating,
    activeConnectionState,
    selectedNodeId,
  ]);
  
  // 更新节点气泡 - 使用SVG外部对象直接添加到图形中
  useEffect(() => {
    if (!svgRef.current || !isSimulating) return;
    
    // 获取SVG和缩放容器
    const svg = d3.select(svgRef.current);
    const zoomContainer = svg.select(".zoom-container");
    
    if (!zoomContainer.empty()) {
      // 移除现有气泡
      zoomContainer.selectAll(".message-bubble-group").remove();
      
      // 获取所有可见节点
      const visibleNodes = getVisibleNodes();
      
      // 为每个有消息的节点添加气泡
      visibleNodes.forEach(node => {
        // getNodeBubble已经处理了模拟步骤的逻辑，只会返回当前应该显示的消息
        const message = getNodeBubble(node.id);
        if (message) {
          // 创建气泡组
          const bubbleGroup = zoomContainer.append("g")
            .attr("class", "message-bubble-group")
            .attr("transform", `translate(${node.position.x}, ${node.position.y - getNodeSize(node.type) - 15})`);
          
          // 添加气泡背景
          bubbleGroup.append("rect")
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", 120)
            .attr("height", 40)
            .attr("x", -60) // 居中
            .attr("y", -40)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1)
            .attr("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))");
          
          // 添加小三角形
          bubbleGroup.append("path")
            .attr("d", "M-6,-5 L6,-5 L0,0 Z")
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1);
          
          // 添加文本
          bubbleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -20)
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text(message);
          
          // 自动调整气泡大小以适应文本
          const textNode = bubbleGroup.select("text").node();
          if (textNode) {
            const textWidth = textNode.getBBox().width;
            const padding = 20;
            const rectWidth = Math.max(textWidth + padding, 80);
            
            bubbleGroup.select("rect")
              .attr("width", rectWidth)
              .attr("x", -rectWidth/2);
          }
        }
      });
    }
  // 依赖项包含isSimulating和simulationStep，确保模拟状态变化时更新气泡
  }, [getNodeBubble, simulationStep, isSimulating, getVisibleNodes]);
  
  // 缩放控制函数
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = transformRef.current;
      const newScale = currentTransform.k * 1.2;
      
      // 创建新的变换
      const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(newScale);
      
      // 更新保存的变换状态
      transformRef.current = newTransform;
      
      svg.transition()
        .duration(300)
        .call(zoomRef.current.transform, newTransform);
    }
  };
  
  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = transformRef.current;
      const newScale = currentTransform.k / 1.2;
      
      // 创建新的变换
      const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(newScale);
      
      // 更新保存的变换状态
      transformRef.current = newTransform;
      
      svg.transition()
        .duration(300)
        .call(zoomRef.current.transform, newTransform);
    }
  };
  
  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      
      // 重置变换状态
      transformRef.current = d3.zoomIdentity;
      
      svg.transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };
  
  return (
    <Container>
      <FilterContainer>
        <FilterButton 
          active={visibleNodeTypes.root} 
          onClick={() => toggleNodeTypeVisibility('root')}
        >
          根节点
        </FilterButton>
        <FilterButton 
          active={visibleNodeTypes.organ} 
          onClick={() => toggleNodeTypeVisibility('organ')}
        >
          器官
        </FilterButton>
        <FilterButton 
          active={visibleNodeTypes.tissue} 
          onClick={() => toggleNodeTypeVisibility('tissue')}
        >
          组织
        </FilterButton>
        <FilterButton 
          active={visibleNodeTypes.cell} 
          onClick={() => toggleNodeTypeVisibility('cell')}
        >
          细胞
        </FilterButton>
        <FilterButton 
          active={visibleNodeTypes.target} 
          onClick={() => toggleNodeTypeVisibility('target')}
        >
          靶点
        </FilterButton>
      </FilterContainer>
      
      <SVGContainer ref={svgRef} />
      
      <ZoomControls>
        <ZoomButton onClick={handleZoomIn} title="放大">+</ZoomButton>
        <ZoomButton onClick={handleZoomOut} title="缩小">-</ZoomButton>
        <ResetButton onClick={handleResetZoom}>重置</ResetButton>
      </ZoomControls>
    </Container>
  );
};

export default NodeGraph;