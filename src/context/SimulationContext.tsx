import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentNode, SimulationState } from '../types/Agent';
import { MockDataService } from '../services/mockData';

interface SimulationContextType {
  state: SimulationState;
  selectNode: (nodeId: string | null) => void;
  updateNodeStatus: (nodeId: string, status: AgentNode['status']) => void;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>(MockDataService.getInitialState());

  // 模拟心跳/数据波动 (Optional, for life-like effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const newNodes = { ...prev.nodes };
        let hasChanges = false;

        // 遍历所有节点进行微调
        Object.keys(newNodes).forEach(key => {
            const node = newNodes[key];
            // 简单的随机游走算法
            const delta = (Math.random() - 0.5) * 0.05; 
            const newActivity = Math.max(0, Math.min(1, node.metrics.activity + delta));
            
            if (newActivity !== node.metrics.activity) {
                newNodes[key] = {
                    ...node,
                    metrics: {
                        ...node.metrics,
                        activity: newActivity
                    }
                };
                hasChanges = true;
            }
        });

        if (!hasChanges) return prev;
        
        return {
          ...prev,
          nodes: newNodes
        };
      });
    }, 100); // 提高频率到 100ms，且更新所有节点

    return () => clearInterval(interval);
  }, []);

  const selectNode = (nodeId: string | null) => {
    setState(prev => ({ ...prev, selectedNodeId: nodeId }));
  };

  const updateNodeStatus = (nodeId: string, status: AgentNode['status']) => {
    setState(prev => {
      const node = prev.nodes[nodeId];
      if (!node) return prev;

      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          [nodeId]: { ...node, status }
        }
      };
    });
  };

  const resetSimulation = () => {
      setState(MockDataService.getInitialState());
  }

  return (
    <SimulationContext.Provider value={{ state, selectNode, updateNodeStatus, resetSimulation }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

