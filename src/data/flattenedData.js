import mockData from './mockData';

// 从嵌套数据创建平铺的节点数据，并按树状结构排列
const createFlattenedData = () => {
  const { patient, drug, rootNode, organs } = mockData;
  
  // 存储所有平铺的节点
  const allNodes = [];
  // 存储所有连接关系
  const allConnections = [];
  
  // 设置画布尺寸和边距
  const canvasWidth = 1000;
  const canvasHeight = 700;
  const margin = { top: 50, right: 50, bottom: 50, left: 100 };
  const contentWidth = canvasWidth - margin.left - margin.right;
  const contentHeight = canvasHeight - margin.top - margin.bottom;
  
  // 设置层级高度
  const levelHeight = contentHeight / 5; // 分为5层：根节点、器官、组织、细胞、靶点
  
  // 添加根节点 - 顶层
  const rootX = canvasWidth / 2;
  const rootY = margin.top;
  
  // 添加根节点
  const rootNodeObj = {
    id: rootNode.id,
    name: rootNode.name,
    type: 'root',
    position: { x: rootX, y: rootY },
    status: rootNode.status,
    agentData: rootNode.agentData,
    parentId: null
  };
  
  allNodes.push(rootNodeObj);
  
  // 添加器官节点 - 第二层
  const organCount = organs.length;
  const organSpacing = contentWidth / (organCount + 1);
  
  organs.forEach((organ, organIndex) => {
    // 计算器官在水平方向的位置
    const organX = margin.left + (organIndex + 1) * organSpacing;
    const organY = margin.top + levelHeight; // 第二层
    
    const organNode = {
      id: organ.id,
      name: organ.name,
      type: 'organ',
      position: { x: organX, y: organY },
      status: organ.status,
      agentData: organ.agentData,
      parentId: rootNode.id // 设置根节点为父节点
    };
    
    allNodes.push(organNode);
    
    // 添加根节点到器官的连接
    allConnections.push({
      from: rootNode.id,
      to: organ.id,
      strength: 1.0,
      direction: 'unidirectional'
    });
    
    // 添加组织节点 - 第三层
    if (organ.tissues) {
      const tissueCount = organ.tissues.length;
      // 计算组织节点的水平间距
      const tissueWidth = organSpacing * 0.8; // 组织节点占据器官节点宽度的80%
      const tissueSpacing = tissueWidth / Math.max(tissueCount, 1);
      
      organ.tissues.forEach((tissue, tissueIndex) => {
        // 计算组织节点的位置
        const tissueX = organX - (tissueWidth / 2) + ((tissueIndex + 0.5) * tissueSpacing);
        const tissueY = margin.top + levelHeight * 2; // 第三层
        
        const tissueNode = {
          id: tissue.id,
          name: tissue.name,
          type: 'tissue',
          position: { x: tissueX, y: tissueY },
          status: tissue.status,
          agentData: tissue.agentData,
          parentId: organ.id
        };
        
        allNodes.push(tissueNode);
        
        // 添加器官到组织的连接
        allConnections.push({
          from: organ.id,
          to: tissue.id,
          strength: 0.8,
          direction: 'unidirectional'
        });
        
        // 添加细胞节点 - 第四层
        if (tissue.cells) {
          const cellCount = tissue.cells.length;
          // 计算细胞节点的水平间距
          const cellWidth = tissueSpacing * 0.8; // 细胞节点占据组织节点宽度的80%
          const cellSpacing = cellWidth / Math.max(cellCount, 1);
          
          tissue.cells.forEach((cell, cellIndex) => {
            // 计算细胞节点的位置
            const cellX = tissueX - (cellWidth / 2) + ((cellIndex + 0.5) * cellSpacing);
            const cellY = margin.top + levelHeight * 3; // 第四层
            
            const cellNode = {
              id: cell.id,
              name: cell.name,
              type: 'cell',
              position: { x: cellX, y: cellY },
              status: cell.status,
              agentData: cell.agentData,
              parentId: tissue.id
            };
            
            allNodes.push(cellNode);
            
            // 添加组织到细胞的连接
            allConnections.push({
              from: tissue.id,
              to: cell.id,
              strength: 0.7,
              direction: 'unidirectional'
            });
            
            // 添加靶点节点 - 第五层
            if (cell.targets) {
              const targetCount = cell.targets.length;
              // 计算靶点节点的水平间距
              const targetWidth = cellSpacing * 0.8; // 靶点节点占据细胞节点宽度的80%
              const targetSpacing = targetWidth / Math.max(targetCount, 1);
              
              cell.targets.forEach((target, targetIndex) => {
                // 计算靶点节点的位置
                const targetX = cellX - (targetWidth / 2) + ((targetIndex + 0.5) * targetSpacing);
                const targetY = margin.top + levelHeight * 4; // 第五层
                
                const targetNode = {
                  id: target.id,
                  name: target.name,
                  type: 'target',
                  position: { x: targetX, y: targetY },
                  status: target.status,
                  agentData: target.agentData,
                  parentId: cell.id
                };
                
                allNodes.push(targetNode);
                
                // 添加细胞到靶点的连接
                allConnections.push({
                  from: cell.id,
                  to: target.id,
                  strength: 0.6,
                  direction: 'unidirectional'
                });
              });
            }
          });
        }
      });
    }
  });
  
  // 添加原始连接（不需要了，因为我们已经创建了所有必要的连接）
  
  return {
    patient,
    drug,
    nodes: allNodes,
    connections: allConnections
  };
};

const flattenedData = createFlattenedData();
export default flattenedData;