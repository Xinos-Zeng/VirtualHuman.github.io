import React from 'react';
import styled from 'styled-components';
import { useVirtualHuman } from '../../context/VirtualHumanContext';

// 添加滑动动画效果的面板
const PanelContainer = styled.div`
  position: fixed;
  right: ${props => props.visible ? '0' : '-320px'};
  top: 0;
  bottom: 0;
  width: 320px;
  z-index: 900;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: row;
`;

// 修复按钮悬停问题，将按钮放在单独的容器中
const ButtonContainer = styled.div`
  position: absolute;
  left: -24px; /* 按钮宽度 */
  top: 50%;
  transform: translateY(-50%);
  height: 60px;
  width: 24px;
  z-index: 1001;
`;

// 切换按钮样式修复
const ToggleButton = styled.button`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 10px 0 0 10px;
  cursor: pointer;
  box-shadow: -2px 0 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  writing-mode: vertical-lr;
  text-orientation: upright;
  padding: 5px;
  
  &:hover {
    background-color: #303f9f;
  }
`;

const Panel = styled.div`
  background-color: #ffffff;
  border-radius: 8px 0 0 8px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: 80px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  margin-bottom: 20px;
  font-size: 1.4em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// 修改类型标签为统一的绿色
const TypeBadge = styled.span`
  font-size: 0.7em;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #4caf50; /* 统一使用绿色 */
  color: white;
  font-weight: 500;
`;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  color: #555;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: 500;
  border-bottom: 1px dashed #e0e0e0;
  padding-bottom: 5px;
`;

const InfoItem = styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  font-weight: 500;
  font-size: 0.85em;
  color: #757575;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 0.95em;
  color: #333;
  word-break: break-word;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  color: white;
  background-color: ${props => {
    switch (props.$status) {
      case 'normal': return '#4caf50';
      case 'affected': return '#ff9800';
      case 'inhibited': return '#f44336';
      case 'processing': return '#2196f3';
      default: return '#9e9e9e';
    }
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RelatedNodeList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RelatedNodeTag = styled.span`
  background-color: #f5f5f5;
  color: #333;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const NodeTypeIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.type) {
      case 'organ': return '#3f51b5';
      case 'tissue': return '#4caf50';
      case 'cell': return '#ff9800';
      case 'target': return '#f44336';
      default: return '#9e9e9e';
    }
  }};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9e9e9e;
  text-align: center;
  padding: 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 3em;
  margin-bottom: 10px;
`;

// 获取节点类型的中文名称
const getNodeTypeName = (type) => {
  switch(type) {
    case 'organ': return '器官';
    case 'tissue': return '组织';
    case 'cell': return '细胞';
    case 'target': return '靶点';
    default: return '未知';
  }
};

// 获取节点状态的中文名称
const getNodeStatusName = (status) => {
  switch(status) {
    case 'normal': return '正常';
    case 'affected': return '受影响';
    case 'inhibited': return '被抑制';
    case 'processing': return '处理中';
    default: return '未知';
  }
};

const InfoPanel = ({ visible, onToggle }) => {
  const { 
    selectedNode, 
    getNodeById, 
    getParentNode, 
    getChildNodes, 
    getConnectedNodes, 
    setSelectedNode 
  } = useVirtualHuman();
  
  const node = getNodeById(selectedNode);
  
  // 检查是否应该显示按钮（只有在有选中节点时才显示）
  const shouldShowButton = !!node;

  const handleRelatedNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
  };

  // 面板内容
  const renderPanelContent = () => {
    if (!node) {
      return (
        <EmptyState>
          <EmptyStateIcon>🔍</EmptyStateIcon>
          <div>请点击一个节点以查看详细信息</div>
        </EmptyState>
      );
    }

    const parentNode = getParentNode(node.id);
    const childNodes = getChildNodes(node.id);
    const connectedNodes = getConnectedNodes(node.id);

    return (
      <>
        <Title>
          {node.name}
          <TypeBadge>{getNodeTypeName(node.type)}</TypeBadge>
        </Title>

        <InfoSection>
          <SectionTitle>基本信息</SectionTitle>
          <InfoItem>
            <Label>ID</Label>
            <Value>{node.id}</Value>
          </InfoItem>

          {node.status && (
            <InfoItem>
              <Label>状态</Label>
              <Value>
                <StatusBadge $status={node.status}>{getNodeStatusName(node.status)}</StatusBadge>
              </Value>
            </InfoItem>
          )}
        </InfoSection>

        {node.agentData && Object.keys(node.agentData).length > 0 && (
          <InfoSection>
            <SectionTitle>Agent数据</SectionTitle>
            {Object.entries(node.agentData).map(([key, value]) => (
              <InfoItem key={key}>
                <Label>{key}</Label>
                <Value>{typeof value === 'number' ? value.toFixed(2) : value}</Value>
              </InfoItem>
            ))}
          </InfoSection>
        )}

        <InfoSection>
          <SectionTitle>关系节点</SectionTitle>
          
          {parentNode && (
            <InfoItem>
              <Label>父级节点</Label>
              <RelatedNodeList>
                <RelatedNodeTag onClick={() => handleRelatedNodeClick(parentNode.id)}>
                  <NodeTypeIndicator type={parentNode.type} />
                  {parentNode.name}
                </RelatedNodeTag>
              </RelatedNodeList>
            </InfoItem>
          )}

          {childNodes.length > 0 && (
            <InfoItem>
              <Label>子级节点 ({childNodes.length})</Label>
              <RelatedNodeList>
                {childNodes.map(node => (
                  <RelatedNodeTag key={node.id} onClick={() => handleRelatedNodeClick(node.id)}>
                    <NodeTypeIndicator type={node.type} />
                    {node.name}
                  </RelatedNodeTag>
                ))}
              </RelatedNodeList>
            </InfoItem>
          )}

          {connectedNodes.length > 0 && (
            <InfoItem>
              <Label>连接节点 ({connectedNodes.length})</Label>
              <RelatedNodeList>
                {connectedNodes.map(node => (
                  <RelatedNodeTag key={node.id} onClick={() => handleRelatedNodeClick(node.id)}>
                    <NodeTypeIndicator type={node.type} />
                    {node.name}
                  </RelatedNodeTag>
                ))}
              </RelatedNodeList>
            </InfoItem>
          )}
        </InfoSection>
      </>
    );
  };

  // 始终渲染面板容器，但根据visible属性控制其位置
  return (
    <PanelContainer visible={visible}>
      {/* 只有在有选中节点时才显示按钮 */}
      {shouldShowButton && (
        <ButtonContainer>
          <ToggleButton onClick={onToggle}>
            {visible ? "收起" : "展开"}
          </ToggleButton>
        </ButtonContainer>
      )}
      <Panel>
        {renderPanelContent()}
      </Panel>
    </PanelContainer>
  );
};

export default InfoPanel;