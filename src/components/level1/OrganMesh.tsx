// @ts-nocheck
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { AgentNode } from '../../types/Agent';

interface OrganMeshProps {
  node: AgentNode;
  position: [number, number, number];
  isSelected: boolean;
  onClick: (id: string) => void;
}

const statusColor = (status: AgentNode['status']) => {
  switch (status) {
    case 'CRITICAL':
      return '#ef4444'; // Red
    case 'WARNING':
      return '#facc15'; // Yellow
    default:
      return '#38bdf8'; // Cyan/Blue
  }
};

export const OrganMesh: React.FC<OrganMeshProps> = ({ node, position, isSelected, onClick }) => {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  
  const emissive = useMemo(() => statusColor(node.status), [node.status]);
  
  // 基础大小：如果是选中状态，稍微变大
  const baseScale = node.level === 'ORGAN' ? (node.id.includes('brain') ? 0.5 : 0.4) : 0.2; 

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    // 呼吸动效：正常态平缓，危急态急促
    const speed = node.status === 'CRITICAL' ? 8 : node.status === 'WARNING' ? 4 : 2;
    const amplitude = node.status === 'CRITICAL' ? 0.05 : 0.02;
    
    // 悬停时也会稍微放大
    const hoverScale = hovered ? 1.1 : 1.0;
    const selectScale = isSelected ? 1.15 : 1.0;
    
    const pulse = 1 + Math.sin(t * speed) * amplitude;
    const finalScale = baseScale * pulse * hoverScale * selectScale;
    
    meshRef.current.scale.set(finalScale, finalScale, finalScale);
    
    // 如果是危急状态，还可以增加自转
    if (node.status === 'CRITICAL') {
       meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef} 
        onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {/* 使用更复杂的几何体或保持球体但调整细分 */}
        <sphereGeometry args={[1, 32, 32]} />
        
        {/* 物理材质实现玻璃/果冻感 */}
        <meshPhysicalMaterial
          color={emissive}
          emissive={emissive}
          emissiveIntensity={isSelected || hovered ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.1}
          transmission={0.4} // 透光
          thickness={1.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* 悬停时显示的标签 */}
      {(hovered || isSelected) && (
        <Html position={[0, baseScale + 0.2, 0]} center distanceFactor={10}>
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.9)', 
            color: '#fff', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: `1px solid ${statusColor(node.status)}`,
            boxShadow: `0 0 10px ${statusColor(node.status)}`
          }}>
            {node.name}
          </div>
        </Html>
      )}
    </group>
  );
};

