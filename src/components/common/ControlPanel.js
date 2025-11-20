import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useVirtualHuman } from '../../context/VirtualHumanContext';

const PanelContainer = styled.div`
  position: fixed;
  left: ${props => props.collapsed ? '-280px' : '0'};
  top: 0;
  bottom: 0;
  width: 280px;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 60px;
  z-index: 1001;
`;

const ToggleButton = styled.button`
  width: 100%;
  height: 100%;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 0 10px 10px 0;
  cursor: pointer;
  box-shadow: 2px 0 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  writing-mode: vertical-lr;
  text-orientation: upright;
  padding: 5px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #303f9f;
  }
`;

const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f9f9f9;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.2em;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PanelContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 0.9em;
  color: #666;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragging ? '#3f51b5' : '#ccc'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background-color: ${props => props.isDragging ? '#f0f4ff' : '#fafafa'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;

  &:hover {
    border-color: #3f51b5;
    background-color: #f0f4ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 2em;
  margin-bottom: 8px;
`;

const UploadText = styled.div`
  font-size: 0.9em;
  color: #666;
  margin-bottom: 4px;
`;

const UploadHint = styled.div`
  font-size: 0.75em;
  color: #999;
`;

const FileInfo = styled.div`
  background-color: #e3f2fd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85em;
`;

const FileName = styled.div`
  color: #1976d2;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 4px;
  line-height: 1;
  
  &:hover {
    color: #d32f2f;
  }
`;

const SimulationButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  background-color: ${props => props.disabled ? '#e0e0e0' : props.primary ? '#4caf50' : '#3f51b5'};
  color: ${props => props.disabled ? '#999' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 12px;

  &:hover {
    background-color: ${props => props.disabled ? '#e0e0e0' : props.primary ? '#388e3c' : '#303f9f'};
  }
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  background-color: ${props => props.simulating ? '#4caf50' : '#757575'};
  color: white;
  margin-bottom: 12px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.85em;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const ControlPanel = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState(null);
  const fileInputRef = useRef(null);

  const { 
    isSimulating,
    startSimulation,
    stopSimulation,
    startUploadedSimulation,
    simulationMode
  } = useVirtualHuman();

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.json')) {
      setParseError('请上传 JSON 文件');
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // 基本验证
      if (!json.logs || !Array.isArray(json.logs)) {
        setParseError('JSON 文件格式不正确，缺少 logs 数组');
        return;
      }

      setUploadedFile({ name: file.name, data: json });
      setParseError(null);
    } catch (error) {
      console.error('解析文件失败:', error);
      setParseError('文件解析失败: ' + error.message);
      setUploadedFile(null);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMockSimulation = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const handleUploadedSimulation = () => {
    if (!uploadedFile) return;
    
    if (isSimulating) {
      stopSimulation();
    } else {
      startUploadedSimulation(uploadedFile.data);
    }
  };

  return (
    <PanelContainer collapsed={collapsed}>
      <ButtonContainer>
        <ToggleButton onClick={handleToggle}>
          {collapsed ? '展开' : '收起'}
        </ToggleButton>
      </ButtonContainer>

      <PanelHeader>
        <PanelTitle>
          <span>⚙️</span>
          模拟控制
        </PanelTitle>
      </PanelHeader>

      <PanelContent>
        <Section>
          <SectionTitle>上传数据</SectionTitle>
          
          <UploadArea
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
          >
            <UploadIcon>📁</UploadIcon>
            <UploadText>点击或拖拽上传 JSON 文件</UploadText>
            <UploadHint>支持 agent_logs 格式</UploadHint>
          </UploadArea>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
          />

          {uploadedFile && (
            <FileInfo>
              <FileName title={uploadedFile.name}>
                📄 {uploadedFile.name}
              </FileName>
              <RemoveButton onClick={handleRemoveFile}>×</RemoveButton>
            </FileInfo>
          )}

          {parseError && (
            <ErrorMessage>{parseError}</ErrorMessage>
          )}
        </Section>

        <Section>
          <SectionTitle>模拟操作</SectionTitle>
          
          {isSimulating && (
            <StatusBadge simulating={isSimulating}>
              {simulationMode === 'uploaded' ? '上传数据模拟中...' : '模拟数据模拟中...'}
            </StatusBadge>
          )}

          <SimulationButton
            primary
            onClick={handleMockSimulation}
          >
            {isSimulating && simulationMode === 'mock' ? '停止模拟' : '使用模拟数据模拟'}
          </SimulationButton>

          <SimulationButton
            disabled={!uploadedFile}
            onClick={handleUploadedSimulation}
          >
            {isSimulating && simulationMode === 'uploaded' ? '停止模拟' : '使用上传数据模拟'}
          </SimulationButton>
        </Section>
      </PanelContent>
    </PanelContainer>
  );
};

export default ControlPanel;

