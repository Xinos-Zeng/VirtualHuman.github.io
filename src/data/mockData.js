// 根据设计文档创建的模拟数据
const mockData = {
  "patient": {
    "id": "P001",
    "name": "测试患者",
    "age": 45,
    "gender": "male",
    "weight": 70,
    "height": 175
  },
  "drug": {
    "id": "D001",
    "name": "测试药物",
    "dosage": 100,
    "unit": "mg"
  },
  // 添加根节点
  "rootNode": {
    "id": "R001",
    "name": "患者/药物信息",
    "type": "root",
    "position": {"x": 500, "y": 50},
    "status": "normal",
    "agentData": {
      "patientId": "P001",
      "drugId": "D001",
      "administrationTime": "2025-11-13T10:00:00"
    }
  },
  "organs": [
    {
      "id": "O001",
      "name": "肠道",
      "position": {"x": 100, "y": 100},
      "status": "affected",
      "agentData": {
        "drugConcentration": 0.8,
        "absorptionRate": 0.9,
        "effectIntensity": 0.7
      },
      "tissues": [
        {
          "id": "T001",
          "name": "肠道组织",
          "status": "affected",
          "agentData": {
            "drugConcentration": 0.85,
            "absorptionRate": 0.95,
            "effectIntensity": 0.75
          },
          "cells": [
            {
              "id": "C001",
              "name": "肠道细胞",
              "status": "affected",
              "agentData": {
                "drugConcentration": 0.9,
                "metabolismRate": 0.8,
                "effectIntensity": 0.8
              },
              "targets": [
                {
                  "id": "TG001",
                  "name": "肠道靶点1",
                  "status": "inhibited",
                  "agentData": {
                    "bindingAffinity": 0.9,
                    "inhibitionRate": 0.8,
                    "activityLevel": 0.1
                  }
                },
                {
                  "id": "TG002",
                  "name": "肠道靶点2",
                  "status": "affected",
                  "agentData": {
                    "bindingAffinity": 0.7,
                    "inhibitionRate": 0.6,
                    "activityLevel": 0.3
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "O002",
      "name": "肝脏",
      "position": {"x": 200, "y": 150},
      "status": "normal",
      "agentData": {
        "drugConcentration": 0.5,
        "metabolismRate": 0.8,
        "effectIntensity": 0.3
      },
      "tissues": [
        {
          "id": "T002",
          "name": "肝脏组织",
          "status": "normal",
          "agentData": {
            "drugConcentration": 0.45,
            "metabolismRate": 0.85,
            "effectIntensity": 0.25
          },
          "cells": [
            {
              "id": "C002",
              "name": "肝脏细胞",
              "status": "processing",
              "agentData": {
                "drugConcentration": 0.4,
                "metabolismRate": 0.9,
                "effectIntensity": 0.2
              },
              "targets": [
                {
                  "id": "TG003",
                  "name": "肝脏靶点1",
                  "status": "normal",
                  "agentData": {
                    "bindingAffinity": 0.5,
                    "inhibitionRate": 0.4,
                    "activityLevel": 0.6
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "O003",
      "name": "肾脏",
      "position": {"x": 300, "y": 200},
      "status": "normal",
      "agentData": {
        "drugConcentration": 0.3,
        "filtrationRate": 0.9,
        "effectIntensity": 0.2
      },
      "tissues": [
        {
          "id": "T003",
          "name": "肾脏组织",
          "status": "normal",
          "agentData": {
            "drugConcentration": 0.25,
            "filtrationRate": 0.95,
            "effectIntensity": 0.15
          },
          "cells": [
            {
              "id": "C003",
              "name": "肾脏细胞",
              "status": "normal",
              "agentData": {
                "drugConcentration": 0.2,
                "filtrationRate": 0.97,
                "effectIntensity": 0.1
              },
              "targets": [
                {
                  "id": "TG004",
                  "name": "肾脏靶点1",
                  "status": "normal",
                  "agentData": {
                    "bindingAffinity": 0.3,
                    "inhibitionRate": 0.2,
                    "activityLevel": 0.8
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "O004",
      "name": "心脏",
      "position": {"x": 400, "y": 100},
      "status": "normal",
      "agentData": {
        "drugConcentration": 0.2,
        "bloodFlow": 1.0,
        "effectIntensity": 0.1
      },
      "tissues": [
        {
          "id": "T004",
          "name": "心脏组织",
          "status": "normal",
          "agentData": {
            "drugConcentration": 0.15,
            "bloodFlow": 0.98,
            "effectIntensity": 0.08
          },
          "cells": [
            {
              "id": "C004",
              "name": "心脏细胞",
              "status": "normal",
              "agentData": {
                "drugConcentration": 0.1,
                "bloodFlow": 0.95,
                "effectIntensity": 0.05
              },
              "targets": [
                {
                  "id": "TG005",
                  "name": "心脏靶点1",
                  "status": "normal",
                  "agentData": {
                    "bindingAffinity": 0.2,
                    "inhibitionRate": 0.1,
                    "activityLevel": 0.9
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "O005",
      "name": "CNS",
      "position": {"x": 500, "y": 50},
      "status": "normal",
      "agentData": {
        "drugConcentration": 0.1,
        "bloodBarrier": 0.2,
        "effectIntensity": 0.05
      },
      "tissues": [
        {
          "id": "T005",
          "name": "CNS组织",
          "status": "normal",
          "agentData": {
            "drugConcentration": 0.08,
            "bloodBarrier": 0.15,
            "effectIntensity": 0.03
          },
          "cells": [
            {
              "id": "C005",
              "name": "CNS细胞",
              "status": "normal",
              "agentData": {
                "drugConcentration": 0.05,
                "bloodBarrier": 0.1,
                "effectIntensity": 0.02
              },
              "targets": [
                {
                  "id": "TG006",
                  "name": "CNS靶点1",
                  "status": "normal",
                  "agentData": {
                    "bindingAffinity": 0.1,
                    "inhibitionRate": 0.05,
                    "activityLevel": 0.95
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  // 修改连接关系，根节点连接到所有器官
  "connections": [
    {
      "from": "R001", // 根节点
      "to": "O001", // 肠道
      "strength": 1.0,
      "direction": "unidirectional"
    },
    {
      "from": "R001", // 根节点
      "to": "O002", // 肝脏
      "strength": 1.0,
      "direction": "unidirectional"
    },
    {
      "from": "R001", // 根节点
      "to": "O003", // 肾脏
      "strength": 1.0,
      "direction": "unidirectional"
    },
    {
      "from": "R001", // 根节点
      "to": "O004", // 心脏
      "strength": 1.0,
      "direction": "unidirectional"
    },
    {
      "from": "R001", // 根节点
      "to": "O005", // CNS
      "strength": 1.0,
      "direction": "unidirectional"
    }
  ]
};

export default mockData;