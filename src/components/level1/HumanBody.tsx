// @ts-nocheck
/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AgentNode } from '../../types/Agent';
import { OrganMesh } from './OrganMesh';

interface HumanBodyProps {
  organs: AgentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// 简单的器官摆放坐标（抽象位置，模拟人体躯干）
const organPositions: Record<string, [number, number, number]> = {
  'organ-heart': [0.2, 1.2, 0.2],    // 心脏：胸腔左侧（视觉右侧）
  'organ-liver': [-0.3, 0.5, 0],     // 肝脏：腹部右侧（视觉左侧）
  'organ-kidney': [0.4, 0, -0.2],    // 肾脏：后腹部
  'organ-Intestine': [0, -0.8, 0],   // 肠道：下腹部
  'organ-brain': [0, 2.8, 0],        // 大脑：头部
};

export const HumanBody: React.FC<HumanBodyProps> = ({ organs, selectedId, onSelect }) => {
  const organMeshes = useMemo(() => {
    return organs.map(node => {
      // 如果没有预定义坐标，则随机分布在躯干区域内
      const pos = organPositions[node.id] || [
        (Math.random() - 0.5) * 1, 
        (Math.random() - 0.5) * 2, 
        (Math.random() - 0.5) * 1
      ];
      return (
        <OrganMesh
          key={node.id}
          node={node}
          position={pos}
          isSelected={selectedId === node.id}
          onClick={onSelect}
        />
      );
    });
  }, [organs, selectedId, onSelect]);

  return (
    <Canvas camera={{ position: [0, 1, 6], fov: 50 }} style={{ height: '70vh', borderRadius: '12px' }}>
      <color attach="background" args={['#02030a']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.0} color="#ffffff" />
      <pointLight position={[-5, -2, -5]} intensity={0.8} color="#38bdf8" />
      
      {/* 聚光灯模拟手术台/科技扫描台效果 */}
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} color="#6366f1" />

      {/* 背景星空，增加科技感 */}
      <Stars radius={50} depth={20} count={3000} factor={3} fade speed={0.5} />

      <group position={[0, -1, 0]}>
        {/* 抽象人体轮廓 - 玻璃胶囊体 */}
        {/* 躯干 */}
        <mesh position={[0, 0.5, 0]}>
          <capsuleGeometry args={[1.2, 4, 4, 16]} />
          <meshPhysicalMaterial 
            color="#a5f3fc"
            transmission={0.6}
            opacity={0.1}
            transparent
            roughness={0.1}
            metalness={0.1}
            thickness={1} // 模拟玻璃厚度
          />
        </mesh>
        
        {/* 头部 (简单球体模拟) */}
        <mesh position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshPhysicalMaterial 
            color="#a5f3fc"
            transmission={0.6}
            opacity={0.1}
            transparent
            roughness={0.1}
            metalness={0.1}
            thickness={1}
          />
        </mesh>

        {organMeshes}
      </group>

      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 1.5} />
    </Canvas>
  );
};

