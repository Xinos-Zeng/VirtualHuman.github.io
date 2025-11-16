import React, { useState } from 'react';
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

const TextPreview = styled.div`
  max-height: 140px;
  overflow: hidden;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 0.9em;
  position: relative;
`;

const ViewMoreButton = styled.button`
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #3f51b5;
  background-color: white;
  color: #3f51b5;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3f51b5;
    color: white;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  width: 70%;
  max-width: 840px;
  max-height: 80vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h4`
  margin: 0;
  font-size: 1.1em;
  color: #333;
`;

const ModalCloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 1.4em;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #000;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 0.95em;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  background-color: #f1f3f5;
  color: #555;
  font-size: 0.8em;
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
    case 'inactive': return '未激活';
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
    setSelectedNode,
    getAgentLogById
  } = useVirtualHuman();
  
  const node = getNodeById(selectedNode);
  const [modalContent, setModalContent] = useState(null);
  
  // 检查是否应该显示按钮（只有在有选中节点时才显示）
  const shouldShowButton = !!node;

  const handleRelatedNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
  };

  const openModal = (title, content) => {
    setModalContent({ title, content });
  };

  const closeModal = () => setModalContent(null);

  const renderTextPreview = (label, content) => {
    if (!content) return null;
    const shouldTruncate = content.length > 400;

    return (
      <InfoItem>
        <Label>{label}</Label>
        <TextPreview style={{ maxHeight: shouldTruncate ? '140px' : 'unset' }}>
          {content}
        </TextPreview>
        {shouldTruncate && (
          <ViewMoreButton onClick={() => openModal(label, content)}>
            查看完整内容
          </ViewMoreButton>
        )}
      </InfoItem>
    );
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
    const agentLog = getAgentLogById(node.id);
    const outputs = agentLog?.outputs;
    const isNodeActivated = node.isActivated;
    const riskLabelMap = {
      low: '低风险',
      medium: '中风险',
      high: '高风险'
    };

    return (
      <>
        <Title>
          {node.name}
          <TypeBadge>{getNodeTypeName(node.type)}</TypeBadge>
        </Title>

        <InfoSection>
          <SectionTitle>基本信息</SectionTitle>
          <InfoItem>
            <Label>节点名称</Label>
            <Value>{node.name || node.id}</Value>
          </InfoItem>

          {node.status && (
            <InfoItem>
              <Label>状态</Label>
              <Value>
                <StatusBadge $status={node.status}>{getNodeStatusName(node.status)}</StatusBadge>
              </Value>
            </InfoItem>
          )}

          <InfoItem>
            <Label>风险等级</Label>
            <Value>{riskLabelMap[node.riskLevel] || '未定义'}</Value>
          </InfoItem>

          <InfoItem>
            <Label>激活状态</Label>
            <Value>{isNodeActivated ? '已激活' : '未激活'}</Value>
          </InfoItem>
        </InfoSection>

        {outputs && (
          <InfoSection>
            <SectionTitle>Agent输出</SectionTitle>
            
            {node.shouldActivate ? (
              isNodeActivated ? (
                <>
                  {renderTextPreview('首轮分析', outputs.primaryText)}
                  {renderTextPreview('第二轮分析', outputs.secondaryText)}
                  {renderTextPreview('工具总结', outputs.toolSummary)}

                  {outputs.toolQueries && outputs.toolQueries.length > 0 && (
                    <InfoItem>
                      <Label>工具查询</Label>
                      <TagList>
                        {outputs.toolQueries.map((query, index) => (
                          <Tag key={`${node.id}-query-${index}`}>{query}</Tag>
                        ))}
                      </TagList>
                    </InfoItem>
                  )}
                </>
              ) : (
                <InfoItem>
                  <Value>节点尚未激活，暂无输出</Value>
                </InfoItem>
              )
            ) : (
              <InfoItem>
                <Value>该节点未纳入本次模拟</Value>
              </InfoItem>
            )}

          </InfoSection>
        )}

        {node.type === 'root' && (
          (() => {
            const agentData = node.agentData || {};
            const hasPatientInfo =
              agentData.patientSummary ||
              (agentData.patientConditions && agentData.patientConditions.length > 0) ||
              agentData.patientDisease;
            const hasDrugInfo = agentData.drugName || agentData.drugPlan || agentData.drugIndication;

            if (!hasPatientInfo && !hasDrugInfo) {
              return null;
            }

            return (
              <InfoSection>
                <SectionTitle>患者 / 药物信息</SectionTitle>
                {agentData.patientDisease && (
                  <InfoItem>
                    <Label>疾病</Label>
                    <Value>{agentData.patientDisease}</Value>
                  </InfoItem>
                )}
                {agentData.patientSummary && (
                  <InfoItem>
                    <Label>患者概述</Label>
                    <Value>{agentData.patientSummary}</Value>
                  </InfoItem>
                )}
                {agentData.patientConditions?.length > 0 && (
                  <InfoItem>
                    <Label>关键特征</Label>
                    <Value>{agentData.patientConditions.join('，')}</Value>
                  </InfoItem>
                )}
                {agentData.drugName && (
                  <InfoItem>
                    <Label>药物</Label>
                    <Value>{agentData.drugName}</Value>
                  </InfoItem>
                )}
                {agentData.drugPlan && (
                  <InfoItem>
                    <Label>用药计划</Label>
                    <Value>{agentData.drugPlan}</Value>
                  </InfoItem>
                )}
              </InfoSection>
            );
          })()
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
    <>
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

      {modalContent && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{modalContent.title}</ModalTitle>
              <ModalCloseButton onClick={closeModal}>×</ModalCloseButton>
            </ModalHeader>
            <ModalBody>{modalContent.content}</ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default InfoPanel;