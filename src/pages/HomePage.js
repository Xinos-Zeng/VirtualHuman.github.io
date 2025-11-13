import React from 'react';
import styled from 'styled-components';
import NodeGraph from '../components/visualization/NodeGraph';
import InfoPanel from '../components/common/InfoPanel';
import { useVirtualHuman } from '../context/VirtualHumanContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
  flex-grow: 1;
  height: calc(100vh - 40px);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleIcon = styled.span`
  font-size: 1.2em;
`;

const SimulationStatus = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.simulating ? '#4caf50' : '#757575'};
  color: white;
  font-size: 0.9em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  animation: ${props => props.simulating ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
`;

const VisualizationArea = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const PatientDrugInfo = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 15px;
  flex: 1;
`;

const InfoCardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 1.1em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoCardIcon = styled.span`
  color: #3f51b5;
`;

const InfoList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.div`
  font-size: 0.8em;
  color: #757575;
`;

const InfoValue = styled.div`
  font-size: 0.95em;
  font-weight: 500;
  color: #333;
`;

const HomePage = () => {
  const { 
    data, 
    selectedNode, 
    infoPanelVisible, 
    setInfoPanelVisible,
    isSimulating
  } = useVirtualHuman();
  
  const { patient, drug } = data;

  // 切换信息面板显示/隐藏
  const toggleInfoPanel = () => {
    setInfoPanelVisible(!infoPanelVisible);
  };

  return (
    <Container>
      <Header>
        <Title>
          <TitleIcon>🧬</TitleIcon>
          虚拟人类
        </Title>
        
        {/* 显示模拟状态 */}
        <SimulationStatus simulating={isSimulating}>
          <StatusDot simulating={isSimulating} />
          {isSimulating ? "模拟进行中..." : "模拟未开始"}
        </SimulationStatus>
      </Header>

      <PatientDrugInfo>
        <InfoCard>
          <InfoCardTitle>
            <InfoCardIcon>👤</InfoCardIcon>
            患者信息
          </InfoCardTitle>
          <InfoList>
            <InfoItem>
              <InfoLabel>ID</InfoLabel>
              <InfoValue>{patient.id}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>姓名</InfoLabel>
              <InfoValue>{patient.name}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>年龄</InfoLabel>
              <InfoValue>{patient.age}岁</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>性别</InfoLabel>
              <InfoValue>{patient.gender === 'male' ? '男' : '女'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>体重</InfoLabel>
              <InfoValue>{patient.weight}kg</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>身高</InfoLabel>
              <InfoValue>{patient.height}cm</InfoValue>
            </InfoItem>
          </InfoList>
        </InfoCard>

        <InfoCard>
          <InfoCardTitle>
            <InfoCardIcon>💊</InfoCardIcon>
            药物信息
          </InfoCardTitle>
          <InfoList>
            <InfoItem>
              <InfoLabel>ID</InfoLabel>
              <InfoValue>{drug.id}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>名称</InfoLabel>
              <InfoValue>{drug.name}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>剂量</InfoLabel>
              <InfoValue>{drug.dosage}{drug.unit}</InfoValue>
            </InfoItem>
          </InfoList>
        </InfoCard>
      </PatientDrugInfo>

      <MainContent>
        <VisualizationArea>
          <NodeGraph />
        </VisualizationArea>
        
        {/* 使用Context中的状态控制InfoPanel */}
        <InfoPanel 
          visible={infoPanelVisible && selectedNode} 
          onToggle={toggleInfoPanel} 
        />
      </MainContent>
    </Container>
  );
};

export default HomePage;