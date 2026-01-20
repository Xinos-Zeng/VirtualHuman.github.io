import { AgentNode, InteractionEdge, SimulationState, Literature } from '../types/Agent';
import { AppConfig } from '../config/appConfig';

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
      { id: 'organ-heart', name: 'Heart' },
      { id: 'organ-liver', name: 'Liver' },
      { id: 'organ-kidney', name: 'Kidney' },
      { id: 'organ-Intestine', name: 'Intestine' },
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
        description: `${organ.name} is operating normally with stable metrics.`,
        literature: mockLiterature[organ.id] || []
      };

      // 2. 为每个器官创建组织 (Level 2)
      const tissueCount = Math.max(1, AppConfig.hierarchy.tissuesPerOrgan);
      for (let i = 1; i <= tissueCount; i++) {
        const tissueId = `${organ.id}-tissue-${i}`;
        nodes[tissueId] = {
          id: tissueId,
          name: `${organ.name} Tissue-${i}`,
          level: 'TISSUE',
          status: 'NORMAL',
          metrics: { activity: 0.5, stress: 0.1 },
          parentId: organ.id,
          childrenIds: [],
          description: `Tissue structure of ${organ.name}, coordinating cellular activities.`,
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
        const cellCount = Math.max(1, AppConfig.hierarchy.cellsPerTissue);
        for (let j = 1; j <= cellCount; j++) {
            const cellId = `${tissueId}-cell-${j}`;
            nodes[cellId] = {
                id: cellId,
                name: `${organ.name} Cell-${i}-${j}`,
                level: 'CELL',
                status: 'NORMAL',
                metrics: { activity: 0.5, stress: 0.1 },
                parentId: tissueId,
                childrenIds: [],
                description: `Functional cell unit of ${organ.name}, performing specific physiological functions.`,
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
      description: 'Liver provides metabolic support to heart'
    });
    
    edges.push({
        id: 'edge-2',
        sourceId: 'organ-kidney',
        targetId: 'organ-liver',
        type: 'DAMAGE',
        intensity: 'LOW',
        description: 'Kidney metabolic load may impact liver function'
      });

    return {
      nodes,
      edges,
      selectedNodeId: null
    };
  }
};

