import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import flattenedData from '../data/flattenedData';
import mockData from '../data/mockData';
import { parseAgentLogs, buildDesignHierarchy } from '../utils/agentLogsParser';

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

const VALID_RISK_LEVELS = ['low', 'medium', 'high'];
const RISK_TO_STATUS = {
  low: NODE_STATES.NORMAL,
  medium: NODE_STATES.MID_RISK,
  high: NODE_STATES.HIGH_RISK
};
const DEFAULT_NODE_META = {
  should_activate: true,
  risk_level: 'low'
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

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 700;
const GRAPH_MARGIN = { top: 80, right: 90, bottom: 50, left: 90 };
const CONTENT_WIDTH = CANVAS_WIDTH - GRAPH_MARGIN.left - GRAPH_MARGIN.right;
const CONTENT_HEIGHT = CANVAS_HEIGHT - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom;
const LEVEL_HEIGHT = CONTENT_HEIGHT / 5;

const splitByComma = (text = '') =>
  text
    .split(/[,，]/)
    .map(segment => segment.trim())
    .filter(Boolean);

const normalizeDosageUnit = (unit = '') => {
  if (!unit) return '';
  const lower = unit.toLowerCase();
  if (lower.includes('毫克') || lower === 'mg') return 'mg';
  if (lower.includes('微克') || lower.includes('μg') || lower.includes('mcg')) return 'μg';
  if (lower.includes('克') || lower === 'g') return 'g';
  return unit;
};

const extractPlanInfo = (text = '') => {
  if (!text) return {};
  const planMatch = text.match(/计划([^，。]*)/);
  if (!planMatch) return {};
  const planSegment = planMatch[1]?.trim();
  if (!planSegment) return {};

  const dosageMatch = planSegment.match(/(\d+(?:\.\d+)?)(\s*(?:mg|g|μg|mcg|毫克|克|微克))/i);
  const dosageValue = dosageMatch ? Number.parseFloat(dosageMatch[1]) : null;
  const rawUnit = dosageMatch ? (dosageMatch[2] || '').trim() : '';
  return {
    planText: `计划${planSegment}`,
    dosageValue: Number.isNaN(dosageValue) ? null : dosageValue,
    dosageUnit: normalizeDosageUnit(rawUnit)
  };
};

const buildPatientInfoFromOriginalInput = (originalInput, sessionId) => {
  if (!originalInput) return null;
  const summary = (originalInput.patient || '').trim();
  const disease = (originalInput.disease || '').trim();
  if (!summary && !disease) return null;

  const ageMatch = summary.match(/(\d+)\s*岁/);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : null;
  const gender = summary.includes('女') ? 'female' : summary.includes('男') ? 'male' : null;

  const conditions = summary
    ? splitByComma(summary.replace(ageMatch ? ageMatch[0] : '', '').trim()).filter(item => !item.includes('计划'))
    : [];

  return {
    id: sessionId || 'virtual_patient',
    name: disease ? `${disease} 患者` : '虚拟患者',
    age,
    gender,
    weight: null,
    height: null,
    summary,
    conditions,
    disease
  };
};

const buildDrugInfoFromOriginalInput = (originalInput) => {
  if (!originalInput) return null;
  const { planText, dosageValue, dosageUnit } = extractPlanInfo(originalInput.patient || '');
  return {
    id: originalInput.drug || 'virtual_drug',
    name: originalInput.drug || '虚拟药物',
    dosage: typeof dosageValue === 'number' && !Number.isNaN(dosageValue) ? dosageValue : null,
    unit: dosageUnit || '',
    indication: (originalInput.disease || '').trim(),
    plan: planText || ''
  };
};

const applyRootAgentData = (nodes = [], patientInfo, drugInfo, originalInput) => {
  if (!nodes || nodes.length === 0) return nodes;
  return nodes.map(node => {
    if (node.type !== 'root') return node;
    return {
      ...node,
      agentData: {
        ...node.agentData,
        originalInput,
        patientSummary: patientInfo?.summary,
        patientConditions: patientInfo?.conditions,
        patientDisease: patientInfo?.disease,
        patientAge: patientInfo?.age,
        drugName: drugInfo?.name,
        drugPlan: drugInfo?.plan,
        drugIndication: drugInfo?.indication
      }
    };
  });
};

const getConnectionStrength = (type) => {
  switch (type) {
    case 'organ':
      return 1.0;
    case 'tissue':
      return 0.85;
    case 'cell':
      return 0.75;
    case 'target':
      return 0.65;
    default:
      return 0.6;
  }
};

const buildGraphDataFromHierarchy = (hierarchy, nodeMeta = {}) => {
  if (!hierarchy) {
    return null;
  }

  const nodes = [];
  const connections = [];

  const sanitizeRiskLevel = (level) => VALID_RISK_LEVELS.includes(level) ? level : 'low';

  const addNode = (baseNode, position, parentId = null) => {
    const meta = nodeMeta[baseNode.id] || DEFAULT_NODE_META;
    const riskLevel = sanitizeRiskLevel(meta.risk_level);
    const shouldActivate = meta.should_activate !== false;

    const graphNode = {
      id: baseNode.id,
      name: baseNode.name || baseNode.id,
      type: baseNode.type,
      position,
      parentId,
      shouldActivate,
      riskLevel,
      originalStatus: RISK_TO_STATUS[riskLevel] || NODE_STATES.NORMAL,
      status: NODE_STATES.INACTIVE,
      isActivated: false,
      isRevealed: baseNode.type === 'root',
      agentData: {}
    };

    nodes.push(graphNode);

    if (parentId) {
      connections.push({
        from: parentId,
        to: graphNode.id,
        strength: getConnectionStrength(graphNode.type),
        direction: 'unidirectional'
      });
    }

    return graphNode;
  };

  const fallbackRoot = hierarchy.root || {
    id: mockData.rootNode?.id || 'root_virtual',
    name: mockData.rootNode?.name || '患者/药物信息',
    type: 'root',
    level: 0,
    levelName: '根节点层'
  };

  const rootX = CANVAS_WIDTH / 2;
  const rootY = GRAPH_MARGIN.top;
  const rootNode = addNode(fallbackRoot, { x: rootX, y: rootY });

  const organs = hierarchy.organs || [];
  const organCount = Math.max(organs.length, 1);
  const organSpacing = CONTENT_WIDTH / (organCount + 1);
  const organY = GRAPH_MARGIN.top + LEVEL_HEIGHT;

  organs.forEach((organGroup, organIndex) => {
    const organX = GRAPH_MARGIN.left + (organIndex + 1) * organSpacing;
    const organNode = addNode(organGroup.node, { x: organX, y: organY }, rootNode.id);

    const tissues = organGroup.tissues || [];
    const tissueCount = Math.max(tissues.length, 1);
    const tissueWidth = organSpacing * 0.8;
    const tissueSpacing = tissueWidth / tissueCount;
    const tissueY = GRAPH_MARGIN.top + LEVEL_HEIGHT * 2;

    tissues.forEach((tissueGroup, tissueIndex) => {
      const tissueX = organX - tissueWidth / 2 + (tissueIndex + 0.5) * tissueSpacing;
      const tissueNode = addNode(tissueGroup.node, { x: tissueX, y: tissueY }, organNode.id);

      const cells = tissueGroup.cells || [];
      const cellCount = Math.max(cells.length, 1);
      const cellWidth = tissueSpacing * 0.8;
      const cellSpacing = cellWidth / cellCount;
      const cellY = GRAPH_MARGIN.top + LEVEL_HEIGHT * 3;

      cells.forEach((cellGroup, cellIndex) => {
        const cellX = tissueX - cellWidth / 2 + (cellIndex + 0.5) * cellSpacing;
        const cellNode = addNode(cellGroup.node, { x: cellX, y: cellY }, tissueNode.id);

        const targets = cellGroup.targets || [];
        if (targets.length === 0) {
          return;
        }

        const targetCount = Math.max(targets.length, 1);
        const targetWidth = cellSpacing * 0.8;
        const targetSpacing = targetWidth / targetCount;
        const targetY = GRAPH_MARGIN.top + LEVEL_HEIGHT * 4;

        targets.forEach((targetGroup, targetIndex) => {
          const targetX = cellX - targetWidth / 2 + (targetIndex + 0.5) * targetSpacing;
          addNode(targetGroup.node, { x: targetX, y: targetY }, cellNode.id);
        });
      });
    });
  });

  return {
    patient: mockData.patient,
    drug: mockData.drug,
    nodes,
    connections,
    rootNodeId: rootNode.id
  };
};

export const VirtualHumanProvider = ({ children }) => {
  // 初始化时保存节点的原始状态
  const initialData = React.useMemo(() => {
    return {
      ...flattenedData,
      nodes: flattenedData.nodes.map(node => ({
        ...node,
        originalStatus: node.status,
        shouldActivate: true,
        riskLevel: 'low',
        isActivated: true,
        isRevealed: true
      }))
    };
  }, []);
  
  const [data, setData] = useState(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [infoPanelVisible, setInfoPanelVisible] = useState(false);
  const [agentLogMap, setAgentLogMap] = useState({});
  const [rootNodeId, setRootNodeId] = useState(null);
  
  // 模拟相关状态
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(SIMULATION_STEPS.READY);
  const [activeConnections, setActiveConnections] = useState([]);
  const [nodeBubbles, setNodeBubbles] = useState({});
  const [simulationMode, setSimulationMode] = useState('mock'); // 'mock' or 'uploaded'
  
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

  useEffect(() => {
    let isMounted = true;

    const loadAgentLogs = async () => {
      try {
        const baseUrl = process.env.PUBLIC_URL || '';
        const response = await fetch(`${baseUrl}/data/agent_logs_vh_session_1762672447.json`);
        if (!response.ok) {
          throw new Error(`加载Agent日志失败: ${response.status}`);
        }

        const json = await response.json();
        if (!isMounted) return;

        const parsed = parseAgentLogs(json);
        const hierarchy = buildDesignHierarchy(parsed);
        const meta = parsed.nodeMeta || {};
        const graphData = buildGraphDataFromHierarchy(hierarchy, meta);
        const originalInput = parsed.originalInput || null;
        const patientInfo = buildPatientInfoFromOriginalInput(originalInput, parsed.sessionId);
        const drugInfo = buildDrugInfoFromOriginalInput(originalInput);
        const nodesWithRootInfo = applyRootAgentData(
          graphData?.nodes || [],
          patientInfo,
          drugInfo,
          originalInput
        );

        setAgentLogMap(parsed.nodeDetails || {});
        if (graphData) {
          const resolvedPatient = patientInfo
            ? { ...graphData.patient, ...patientInfo }
            : graphData.patient;
          const resolvedDrug = drugInfo
            ? { ...graphData.drug, ...drugInfo }
            : graphData.drug;

          const resolvedRootId =
            graphData.rootNodeId ||
            nodesWithRootInfo.find(node => node.type === 'root')?.id ||
            null;

          setData({
            ...graphData,
            patient: resolvedPatient,
            drug: resolvedDrug,
            nodes: nodesWithRootInfo
          });
          setRootNodeId(resolvedRootId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadAgentLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  // 切换节点类型可见性
  const toggleNodeTypeVisibility = (type) => {
    setVisibleNodeTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // 获取可见节点
  const getVisibleNodes = () => {
    return data.nodes.filter(node => node.isRevealed && visibleNodeTypes[node.type]);
  };

  // 获取可见连接
  const getVisibleConnections = () => {
    const visibleIds = new Set(
      data.nodes
        .filter(node => node.isRevealed && visibleNodeTypes[node.type])
        .map(node => node.id)
    );
    
    return data.connections.filter(
      conn => visibleIds.has(conn.from) && visibleIds.has(conn.to)
    );
  };

  // 获取当前激活的连接
  const getActiveConnections = () => {
    if (!isSimulating) return [];
    const visibleIds = new Set(data.nodes.filter(node => node.isRevealed).map(node => node.id));
    return activeConnections.filter(conn => visibleIds.has(conn.from) && visibleIds.has(conn.to));
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

  const getAgentLogById = useCallback((nodeId) => {
    if (!nodeId) return null;
    return agentLogMap[nodeId] || null;
  }, [agentLogMap]);

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
    
    setData(prev => {
      const activatedIds = [];
      const updatedNodes = prev.nodes.map(node => {
        if (node.type !== nodeType || !node.shouldActivate) {
          return node;
        }

        if (!node.isActivated) {
          activatedIds.push(node.id);
          return {
            ...node,
            status: node.originalStatus || NODE_STATES.NORMAL,
            isActivated: true,
            isRevealed: true
          };
        }
        return node;
      });

      if (activatedIds.length === 0) {
        return prev;
      }

      const nodesWithChildren = updatedNodes.map(node => {
        if (node.parentId && activatedIds.includes(node.parentId)) {
          return {
            ...node,
            isRevealed: true
          };
        }
        return node;
      });

      return {
        ...prev,
        nodes: nodesWithChildren
      };
    });
  };
  
  // 为特定类型的节点生成消息
  const generateNodeMessages = (nodeType) => {
    console.log(`为节点类型生成消息: ${nodeType}`);
    
    const newBubbles = { ...nodeBubbles };
    
    setData(prev => {
      const updatedNodes = prev.nodes.map(node => {
        // 只处理允许激活的同类型节点
        if (node.type === nodeType && node.shouldActivate && node.isActivated) {
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
                message = "低风险";
                break;
              case "affected":
              case NODE_STATES.MID_RISK:
                nodeStatus = NODE_STATES.MID_RISK;
                message = "中风险";
                break;
              case "inhibited":
              case NODE_STATES.HIGH_RISK:
                nodeStatus = NODE_STATES.HIGH_RISK;
                message = "高风险";
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
    
    const fromNodeIds = data.nodes
      .filter(node => node.type === fromType && node.shouldActivate)
      .map(node => node.id);
    const toNodeIds = data.nodes
      .filter(node => node.type === toType && node.shouldActivate)
      .map(node => node.id);
    
    if (fromNodeIds.length === 0 || toNodeIds.length === 0) {
      setActiveConnections([]);
      return;
    }
    
    const newActiveConnections = data.connections.filter(conn =>
      fromNodeIds.includes(conn.from) && toNodeIds.includes(conn.to)
    );
    
    setActiveConnections(newActiveConnections);
  };

  // 获取节点气泡消息，考虑当前模拟步骤和已激活的节点
  const getNodeBubble = (nodeId) => {
    // 如果没有消息，直接返回null
    if (!nodeBubbles[nodeId]) return null;
    
    // 获取节点类型
    const node = getNodeById(nodeId);
    if (!node || !node.isActivated || !node.shouldActivate) return null;
    
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

  // 执行模拟步骤的函数
  const executeSimulationStep = (step) => {
    console.log(`执行模拟步骤: ${step}`);
    setSimulationStep(step);
    
    switch (step) {
      case SIMULATION_STEPS.ROOT_MESSAGE:
        activateNodesOfType('root');
        generateNodeMessages('root');
        activateConnectionsFromType('root', 'organ');
        break;
        
      case SIMULATION_STEPS.ORGAN_MESSAGE:
        activateNodesOfType('organ');
        generateNodeMessages('organ');
        activateConnectionsFromType('organ', 'tissue');
        break;
        
      case SIMULATION_STEPS.TISSUE_MESSAGE:
        activateNodesOfType('tissue');
        generateNodeMessages('tissue');
        activateConnectionsFromType('tissue', 'cell');
        break;
        
      case SIMULATION_STEPS.CELL_MESSAGE:
        activateNodesOfType('cell');
        generateNodeMessages('cell');
        activateConnectionsFromType('cell', 'target');
        break;
        
      case SIMULATION_STEPS.TARGET_MESSAGE:
        activateNodesOfType('target');
        generateNodeMessages('target');
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

  // 开始模拟（使用模拟数据）
  const startSimulation = () => {
    console.log("开始模拟数据模拟...");
    
    // 清除可能存在的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // 重置所有节点状态与可见性
    setData(prev => {
      const effectiveRootId = rootNodeId || prev.nodes.find(node => node.type === 'root')?.id;
      return {
        ...prev,
        nodes: prev.nodes.map(node => {
          const isRoot = node.id === effectiveRootId;
          return {
            ...node,
            status: NODE_STATES.INACTIVE,
            isActivated: false,
            isRevealed: Boolean(isRoot)
          };
        })
      };
    });
    
    setIsSimulating(true);
    setSimulationMode('mock');
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

  // 使用上传的数据开始模拟
  const startUploadedSimulation = (uploadedJson) => {
    console.log("开始上传数据模拟...");
    
    try {
      // 清除可能存在的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // 解析上传的数据
      // 注意：上传的JSON可能没有node_meta字段，使用空对象作为默认值
      const parsed = parseAgentLogs(uploadedJson);
      const hierarchy = buildDesignHierarchy(parsed);
      const meta = parsed.nodeMeta || {}; // 兼容没有node_meta的情况
      const graphData = buildGraphDataFromHierarchy(hierarchy, meta);
      const originalInput = parsed.originalInput || null;
      const patientInfo = buildPatientInfoFromOriginalInput(originalInput, parsed.sessionId);
      const drugInfo = buildDrugInfoFromOriginalInput(originalInput);
      const nodesWithRootInfo = applyRootAgentData(
        graphData?.nodes || [],
        patientInfo,
        drugInfo,
        originalInput
      );

      // 更新agentLogMap
      setAgentLogMap(parsed.nodeDetails || {});

      if (graphData) {
        const resolvedPatient = patientInfo
          ? { ...graphData.patient, ...patientInfo }
          : graphData.patient;
        const resolvedDrug = drugInfo
          ? { ...graphData.drug, ...drugInfo }
          : graphData.drug;

        const resolvedRootId =
          graphData.rootNodeId ||
          nodesWithRootInfo.find(node => node.type === 'root')?.id ||
          null;

        // 重置所有节点为未激活状态
        const resetNodes = nodesWithRootInfo.map(node => {
          const isRoot = node.id === resolvedRootId;
          return {
            ...node,
            status: NODE_STATES.INACTIVE,
            isActivated: false,
            isRevealed: Boolean(isRoot)
          };
        });

        setData({
          ...graphData,
          patient: resolvedPatient,
          drug: resolvedDrug,
          nodes: resetNodes
        });
        setRootNodeId(resolvedRootId);
      }

      setIsSimulating(true);
      setSimulationMode('uploaded');
      setSimulationStep(SIMULATION_STEPS.READY);
      setActiveConnections([]);
      setNodeBubbles({});

      // 延迟1秒后开始第一步
      console.log("设置定时器，1秒后开始上传数据模拟");
      timerRef.current = setTimeout(() => {
        executeSimulationStep(SIMULATION_STEPS.ROOT_MESSAGE);
      }, 1000);

    } catch (error) {
      console.error('启动上传数据模拟失败:', error);
      alert('解析上传数据失败: ' + error.message);
    }
  };

  // 在组件卸载时清除定时器
  useEffect(() => {
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
    startUploadedSimulation,
    getNodeBubble,
    simulationStep,
    simulationMode,
    SIMULATION_STEPS,
    getAgentLogById
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