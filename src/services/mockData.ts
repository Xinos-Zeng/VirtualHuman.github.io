import { AgentNode, InteractionEdge, SimulationState } from '../types/Agent';

// 初始数据生成器
export const MockDataService = {
  getInitialState(): SimulationState {
    const nodes: Record<string, AgentNode> = {};
    const edges: InteractionEdge[] = [];

    // 1. 创建器官 (Level 1)
    const organs = [
      { id: 'organ-heart', name: '心脏' },
      { id: 'organ-liver', name: '肝脏' },
      { id: 'organ-kidney', name: '肾脏' },
      { id: 'organ-Intestine', name: '肠道' },
      { id: 'organ-brain', name: 'CNS' },
    ];

    organs.forEach(organ => {
      nodes[organ.id] = {
        id: organ.id,
        name: organ.name,
        level: 'ORGAN',
        status: 'NORMAL',
        metrics: { activity: 0.5, stress: 0.1 },
        childrenIds: [],
        description: `${organ.name}运行正常，各项指标平稳。`
      };

      // 2. 为每个器官创建组织 (Level 2)
      // 简化：每个器官 2 个组织
      for (let i = 1; i <= 2; i++) {
        const tissueId = `${organ.id}-tissue-${i}`;
        nodes[tissueId] = {
          id: tissueId,
          name: `${organ.name}组织-${i}`,
          level: 'TISSUE',
          status: 'NORMAL',
          metrics: { activity: 0.5, stress: 0.1 },
          parentId: organ.id,
          childrenIds: []
        };
        nodes[organ.id].childrenIds?.push(tissueId);

        // 3. 为每个组织创建细胞 (Level 3)
        for (let j = 1; j <= 2; j++) {
            const cellId = `${tissueId}-cell-${j}`;
            nodes[cellId] = {
                id: cellId,
                name: `${organ.name}细胞-${i}-${j}`,
                level: 'CELL',
                status: 'NORMAL',
                metrics: { activity: 0.5, stress: 0.1 },
                parentId: tissueId,
                childrenIds: []
            };
            nodes[tissueId].childrenIds?.push(cellId);
        }
      }
    });

    // 4. 创建一些随机连接 (Edges)
    edges.push({
      id: 'edge-1',
      sourceId: 'organ-liver',
      targetId: 'organ-heart',
      type: 'SUPPORT',
      intensity: 'MEDIUM',
      description: '肝脏为心脏提供代谢支持'
    });
    
    edges.push({
        id: 'edge-2',
        sourceId: 'organ-kidney',
        targetId: 'organ-liver',
        type: 'DAMAGE', // 模拟一个潜在风险
        intensity: 'LOW',
        description: '肾脏代谢负担可能影响肝脏'
      });

    return {
      nodes,
      edges,
      selectedNodeId: null
    };
  }
};

