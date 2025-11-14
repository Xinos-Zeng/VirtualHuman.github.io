import React, { createContext, useState, useContext, useRef } from 'react';
import flattenedData from '../data/flattenedData';

const VirtualHumanContext = createContext();

// 节点状态常量
export const NODE_STATES = {
  INACTIVE: 'inactive', // 灰色未激活状态
  NORMAL: 'normal',     // 绿色正常状态
  LOW_RISK: 'low_risk', // 绿色低风险
  MID_RISK: 'affected', // 橙色中风险
  HIGH_RISK: 'inhibited', // 红色高风险
  PROCESSING: 'processing' // 蓝色处理中
};

// 模拟步骤常量
export const SIMULATION_STEPS = {
  READY: 0,                // 准备开始
  ROOT_MESSAGE: 1,         // 根节点产生消息（并激活）
  ORGAN_MESSAGE: 2,        // 器官层产生消息（并激活）
  TISSUE_MESSAGE: 3,       // 组织层产生消息（并激活）
  CELL_MESSAGE: 4,         // 细胞层产生消息（并激活）
  TARGET_MESSAGE: 5,       // 靶点层产生消息（并激活）
  COMPLETED: 6            // 模拟完成
};

export const VirtualHumanProvider = ({ children }) => {
  // 初始化时保存节点的原始状态
  const initialData = React.useMemo(() => {
    return {
      ...flattenedData,
      nodes: flattenedData.nodes.map(node => ({
        ...node,
        originalStatus: node.status // 保存原始状态
      }))
    };
  }, []);
  
  const [data, setData] = useState(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [infoPanelVisible, setInfoPanelVisible] = useState(false);
  
  // 模拟相关状态
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(SIMULATION_STEPS.READY);
  const [activeConnections, setActiveConnections] = useState([]);
  const [nodeBubbles, setNodeBubbles] = useState({});
  
  // 使用ref存储定时器ID，便于清除
  const timerRef = useRef(null);
  
  // 可见节点类型
  const [visibleNodeTypes, setVisibleNodeTypes] = useState({
    root: true,
    organ: true,
    tissue: true,
    cell: true,
    target: true,
  });

  // 切换节点类型可见性
  const toggleNodeTypeVisibility = (type) => {
    setVisibleNodeTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // 获取可见节点
  const getVisibleNodes = () => {
    return data.nodes.filter(node => visibleNodeTypes[node.type]);
  };

  // 获取可见连接
  const getVisibleConnections = () => {
    const visibleNodes = getVisibleNodes();
    const visibleNodeIds = visibleNodes.map(node => node.id);
    
    return data.connections.filter(conn => 
      visibleNodeIds.includes(conn.from) && visibleNodeIds.includes(conn.to)
    );
  };

  // 获取当前激活的连接
  const getActiveConnections = () => {
    if (!isSimulating) return [];
    return activeConnections;
  };

  // 通过ID获取节点
  const getNodeById = (id) => {
    return data.nodes.find(node => node.id === id);
  };

  // 获取父节点
  const getParentNode = (nodeId) => {
    const node = getNodeById(nodeId);
    if (!node || !node.parentId) return null;
    return getNodeById(node.parentId);
  };

  // 获取子节点
  const getChildNodes = (nodeId) => {
    return data.nodes.filter(node => node.parentId === nodeId);
  };

  // 获取连接的节点
  const getConnectedNodes = (nodeId) => {
    const connections = data.connections.filter(
      conn => conn.from === nodeId || conn.to === nodeId
    );
    const connectedNodeIds = connections.map(conn =>
      conn.from === nodeId ? conn.to : conn.from
    );
    return connectedNodeIds.map(id => getNodeById(id)).filter(Boolean);
  };

  // 设置选中节点
  const setSelectedNode = (nodeId) => {
    setSelectedNodeId(nodeId);
    if (!nodeId) {
      setInfoPanelVisible(false);
    }
  };

  // 激活特定类型的节点
  const activateNodesOfType = (nodeType) => {
    console.log(`激活节点类型: ${nodeType}`);
    
    setData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        // 只处理指定类型的节点，其他节点保持不变
        if (node.type === nodeType) {
          console.log(`激活节点: ${node.id} (${node.name})`);
          
          // 只有当节点状态为未激活时才进行状态更新
          if (node.status === NODE_STATES.INACTIVE) {
            return {
              ...node,
              status: node.originalStatus || NODE_STATES.NORMAL
            };
          }
        }
        return node;
      })
    }));
  };
  
  // 为特定类型的节点生成消息
  const generateNodeMessages = (nodeType) => {
    console.log(`为节点类型生成消息: ${nodeType}`);
    
    const newBubbles = { ...nodeBubbles };
    
    setData(prev => {
      const updatedNodes = prev.nodes.map(node => {
        // 只处理指定类型的节点
        if (node.type === nodeType) {
          let message;
          let nodeStatus;
          
          // 根节点固定消息
          if (node.type === 'root') {
            nodeStatus = NODE_STATES.NORMAL;
            message = "开始药物信息传递";
          } else {
            // 始终使用原始状态来确定风险级别，确保状态正确
            const statusToCheck = node.originalStatus || node.status;
            
            switch (statusToCheck) {
              case "normal":
              case NODE_STATES.NORMAL:
                nodeStatus = NODE_STATES.NORMAL;
                message = "状态正常";
                break;
              case "low_risk":
              case NODE_STATES.LOW_RISK:
                nodeStatus = NODE_STATES.LOW_RISK;
                message = "低风险: 一切正常";
                break;
              case "affected":
              case NODE_STATES.MID_RISK:
                nodeStatus = NODE_STATES.MID_RISK;
                message = "中风险: 需要注意";
                break;
              case "inhibited":
              case NODE_STATES.HIGH_RISK:
                nodeStatus = NODE_STATES.HIGH_RISK;
                message = "高风险: 需要处理";
                break;
              case "processing":
              case NODE_STATES.PROCESSING:
                nodeStatus = NODE_STATES.PROCESSING;
                message = "处理中";
                break;
              default:
                nodeStatus = NODE_STATES.NORMAL;
                message = "状态正常";
            }
          }
          
          // 更新节点状态，保持原始状态不变
          console.log(`节点 ${node.id} (${node.name}) 生成消息: ${message}, 状态: ${nodeStatus} (原始状态: ${node.originalStatus})`);
          
          // 添加气泡消息
          newBubbles[node.id] = message;
          
          return {
            ...node,
            status: nodeStatus // 设置为正确的状态，不再使用INACTIVE
          };
        }
        return node;
      });
      
      return {
        ...prev,
        nodes: updatedNodes
      };
    });
    
    setNodeBubbles(newBubbles);
  };

  // 激活从一种类型节点到另一种类型节点的连接
  const activateConnectionsFromType = (fromType, toType) => {
    console.log(`激活从 ${fromType} 到 ${toType} 的连接`);
    
    const fromNodes = data.nodes.filter(node => node.type === fromType);
    const toNodes = data.nodes.filter(node => node.type === toType);
    
    const newActiveConnections = [];
    
    data.connections.forEach(conn => {
      const fromNode = fromNodes.find(node => node.id === conn.from);
      const toNode = toNodes.find(node => node.id === conn.to);
      
      if (fromNode && toNode) {
        newActiveConnections.push(conn);
        console.log(`激活连接: ${fromNode.id} -> ${toNode.id}`);
      }
    });
    
    setActiveConnections(newActiveConnections);
  };

  // 获取节点气泡消息，考虑当前模拟步骤和已激活的节点
  const getNodeBubble = (nodeId) => {
    // 如果没有消息，直接返回null
    if (!nodeBubbles[nodeId]) return null;
    
    // 获取节点类型
    const node = getNodeById(nodeId);
    if (!node) return null;
    
    // 根据当前模拟步骤，决定哪些类型的节点可以显示气泡
    const nodeType = node.type;
    let shouldShowBubble = false;
    
    // 当前步骤正在显示消息的节点类型
    let currentMessageNodeType = null;
    
    switch (simulationStep) {
      case SIMULATION_STEPS.ROOT_MESSAGE:
        currentMessageNodeType = 'root';
        break;
      case SIMULATION_STEPS.ORGAN_MESSAGE:
        currentMessageNodeType = 'organ';
        break;
      case SIMULATION_STEPS.TISSUE_MESSAGE:
        currentMessageNodeType = 'tissue';
        break;
      case SIMULATION_STEPS.CELL_MESSAGE:
        currentMessageNodeType = 'cell';
        break;
      case SIMULATION_STEPS.TARGET_MESSAGE:
      case SIMULATION_STEPS.COMPLETED:
        currentMessageNodeType = 'target';
        break;
    }
    
    // 如果节点类型与当前消息节点类型匹配，则显示气泡
    shouldShowBubble = (nodeType === currentMessageNodeType);
    
    return shouldShowBubble ? nodeBubbles[nodeId] : null;
  };

  // 跟踪已激活的节点类型，确保它们保持激活状态
  const [activatedNodeTypes, setActivatedNodeTypes] = useState([]);

  // 辅助方法：将节点类型加入已激活列表（避免重复）
  const addActivatedNodeType = (nodeType) => {
    setActivatedNodeTypes(prev => (
      prev.includes(nodeType) ? prev : [...prev, nodeType]
    ));
  };
  
  // 执行模拟步骤的函数
  const executeSimulationStep = (step) => {
    console.log(`执行模拟步骤: ${step}`);
    setSimulationStep(step);
    
    switch (step) {
      case SIMULATION_STEPS.ROOT_MESSAGE:
        activateNodesOfType('root');
        generateNodeMessages('root');
        addActivatedNodeType('root');
        activateConnectionsFromType('root', 'organ');
        break;
        
      case SIMULATION_STEPS.ORGAN_MESSAGE:
        activateNodesOfType('organ');
        generateNodeMessages('organ');
        addActivatedNodeType('organ');
        activateConnectionsFromType('organ', 'tissue');
        break;
        
      case SIMULATION_STEPS.TISSUE_MESSAGE:
        activateNodesOfType('tissue');
        generateNodeMessages('tissue');
        addActivatedNodeType('tissue');
        activateConnectionsFromType('tissue', 'cell');
        break;
        
      case SIMULATION_STEPS.CELL_MESSAGE:
        activateNodesOfType('cell');
        generateNodeMessages('cell');
        addActivatedNodeType('cell');
        activateConnectionsFromType('cell', 'target');
        break;
        
      case SIMULATION_STEPS.TARGET_MESSAGE:
        activateNodesOfType('target');
        generateNodeMessages('target');
        addActivatedNodeType('target');
        // 靶点层没有后续连接
        setActiveConnections([]);
        break;
        
      case SIMULATION_STEPS.COMPLETED:
        console.log("模拟完成");
        setIsSimulating(false);
        setActiveConnections([]);
        break;
        
      default:
        break;
    }
    
    // 如果不是最后一步，安排下一步
    if (step < SIMULATION_STEPS.COMPLETED) {
      console.log(`安排5秒后执行步骤: ${step + 1}`);
      // 保存当前步骤，用于定时器回调
      const nextStep = step + 1;
      timerRef.current = setTimeout(() => {
        console.log(`定时器触发，执行步骤: ${nextStep}`);
        // 移除isSimulating检查，确保定时器触发后一定会执行下一步
        executeSimulationStep(nextStep);
      }, 3000);
    }
  };

  // 开始模拟
  const startSimulation = () => {
    console.log("开始模拟...");
    
    // 清除可能存在的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // 重置所有节点状态为未激活，但保留原始状态
    setData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        status: NODE_STATES.INACTIVE
        // originalStatus 保持不变，不需要重新设置
      }))
    }));
    
    // 重置已激活的节点类型，开始新的模拟
    setActivatedNodeTypes([]);
    
    setIsSimulating(true);
    setSimulationStep(SIMULATION_STEPS.READY);
    setActiveConnections([]);
    setNodeBubbles({});
    
    // 延迟1秒后开始第一步
    console.log("设置定时器，1秒后开始模拟");
    timerRef.current = setTimeout(() => {
      // 再次检查节点状态是否正确设置为未激活
      const currentNodes = data.nodes;
      const allInactive = currentNodes.every(node => node.status === NODE_STATES.INACTIVE);
      console.log(`所有节点是否为未激活状态: ${allInactive}`);
      
      // 开始第一步模拟
      executeSimulationStep(SIMULATION_STEPS.ROOT_MESSAGE);
    }, 1000);
  };

  // 停止模拟
  const stopSimulation = () => {
    console.log("停止模拟");
    setIsSimulating(false);
    setActiveConnections([]);
    
    // 清除定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // 停止模拟时保留节点状态，不再重置为未激活
    // 重置模拟步骤
    setSimulationStep(SIMULATION_STEPS.READY);
    setNodeBubbles({});
  };

  // 在组件卸载时清除定时器
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const value = {
    data,
    selectedNode: selectedNodeId,
    setSelectedNode,
    infoPanelVisible,
    setInfoPanelVisible,
    visibleNodeTypes,
    toggleNodeTypeVisibility,
    getVisibleNodes,
    getVisibleConnections,
    getNodeById,
    getParentNode,
    getChildNodes,
    getConnectedNodes,
    // 模拟相关
    isSimulating,
    activeConnections,
    getActiveConnections,
    startSimulation,
    stopSimulation,
    getNodeBubble,
    simulationStep,
    SIMULATION_STEPS,
    // 暴露已激活的节点类型
    activatedNodeTypes
  };

  return (
    <VirtualHumanContext.Provider value={value}>
      {children}
    </VirtualHumanContext.Provider>
  );
};

export const useVirtualHuman = () => {
  const context = useContext(VirtualHumanContext);
  if (!context) {
    throw new Error('useVirtualHuman must be used within a VirtualHumanProvider');
  }
  return context;
};