// 定义节点层级类型
export type AgentLevel = 'ORGAN' | 'TISSUE' | 'CELL' | 'TARGET';

// 定义健康状态（对应视觉设计的颜色）
export type HealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface AgentNode {
  id: string;                // 唯一标识 (e.g., "organ-liver-01")
  name: string;              // 显示名称 (e.g., "肝脏")
  level: AgentLevel;         // 层级
  status: HealthStatus;      // 状态，决定颜色和特效
  
  // 核心数值 (不直接显示，但驱动 UI 表现，如跳动频率、透明度)
  metrics: {
    activity: number;        // 0-1.0，活跃度
    stress: number;          // 0-1.0，压力值/受损程度
  };

  description?: string;      // 简短描述 (Hover 时显示)
  
  // 层级关系 (Level 1 点击进入 Level 2 的依据)
  childrenIds?: string[];    // 下级节点 ID 列表
  parentId?: string;         // 上级节点 ID
}

export interface InteractionEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'SUPPORT' | 'DAMAGE'; // 决定流光颜色 (绿/红)
  intensity: 'LOW' | 'MEDIUM' | 'HIGH'; // 决定粗细 (1px/3px/6px)
  description?: string;       // 悬停在线上时显示的因果解释
}

// 模拟状态容器
export interface SimulationState {
  nodes: Record<string, AgentNode>;
  edges: InteractionEdge[];
  selectedNodeId: string | null; // 当前聚焦的节点
}

