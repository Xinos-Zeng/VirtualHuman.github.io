import { AgentNode, InteractionEdge, SimulationState, Literature } from '../types/Agent';

// 模拟文献数据
const mockLiterature: Record<string, Literature[]> = {
  'organ-heart': [
    {
      title: 'Cardiac Cell Regeneration and Myocardial Infarction',
      authors: 'Smith J, Johnson R, et al.',
      journal: 'Nature Medicine',
      year: 2023,
      doi: '10.1038/nm.2023.001',
      summary: 'Recent advances in cardiac regeneration show promising results in post-infarction recovery through stem cell therapy.'
    },
    {
      title: 'Mechanisms of Heart Failure: Molecular Insights',
      authors: 'Chen L, Wang X, et al.',
      journal: 'Circulation Research',
      year: 2022,
      summary: 'Novel molecular pathways identified in heart failure progression, highlighting potential therapeutic targets.'
    }
  ],
  'organ-liver': [
    {
      title: 'Hepatic Regeneration and Metabolic Adaptation',
      authors: 'Zhang Y, Liu M, et al.',
      journal: 'Cell Metabolism',
      year: 2023,
      doi: '10.1016/j.cmet.2023.001',
      summary: 'Liver demonstrates remarkable regenerative capacity through metabolic reprogramming and cellular plasticity.'
    }
  ],
  'organ-kidney': [
    {
      title: 'Renal Function and Filtration Dynamics',
      authors: 'Brown A, Davis K, et al.',
      journal: 'Kidney International',
      year: 2023,
      summary: 'Advanced imaging reveals real-time kidney filtration mechanisms and their regulation under stress conditions.'
    }
  ],
  'organ-Intestine': [
    {
      title: 'Gut Microbiome and Systemic Health',
      authors: 'Garcia M, Rodriguez P, et al.',
      journal: 'Science',
      year: 2023,
      doi: '10.1126/science.2023.001',
      summary: 'Intestinal microbiota plays crucial role in immune regulation and metabolic homeostasis.'
    }
  ],
  'organ-brain': [
    {
      title: 'Neural Plasticity and Cognitive Function',
      authors: 'Wilson T, Anderson S, et al.',
      journal: 'Nature Neuroscience',
      year: 2023,
      summary: 'CNS demonstrates adaptive plasticity in response to environmental stimuli and learning experiences.'
    }
  ]
};

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
        description: `${organ.name}运行正常，各项指标平稳。`,
        literature: mockLiterature[organ.id] || []
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
          childrenIds: [],
          description: `${organ.name}的组织层级结构，负责协调细胞活动。`,
          literature: [
            {
              title: `Tissue Organization in ${organ.name}`,
              authors: 'Research Team',
              journal: 'Tissue Biology',
              year: 2023,
              summary: `Study on structural organization and functional coordination of ${organ.name} tissue components.`
            }
          ]
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
                childrenIds: [],
                description: `${organ.name}的功能性细胞单元，执行特定的生理功能。`,
                literature: [
                  {
                    title: `Cellular Mechanisms in ${organ.name}`,
                    authors: 'Cell Biology Lab',
                    journal: 'Cell Research',
                    year: 2023,
                    summary: `Investigation of cellular processes and molecular mechanisms in ${organ.name} cells.`
                  }
                ]
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

