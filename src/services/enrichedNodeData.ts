import { Literature } from '../types/Agent';

/**
 * Enriched Node Data - 丰富的节点模拟信息
 * 为每个节点提供详细的状态描述、文献引用和信号输入模拟响应
 */

export interface EnrichedNodeData {
  statusDetails: string;  // 详细的状态描述
  literature: Literature[];  // 丰富的文献列表
  signalResponse: string;  // 默认的信号输入响应模拟
}

// 器官级别的丰富数据
export const enrichedOrganData: Record<string, EnrichedNodeData> = {
  'organ-heart': {
    statusDetails: `The heart is functioning within normal parameters. Cardiac output is steady at approximately 5.0 L/min. Electrical conduction system shows regular sinus rhythm at 72 bpm. Myocardial oxygen consumption is balanced with coronary blood flow. No arrhythmias detected. Ejection fraction maintains at 60-65%.`,
    literature: [
      {
        title: 'Cardiac Cell Regeneration and Myocardial Infarction Recovery',
        authors: 'Smith J, Johnson R, Williams K, Brown L',
        journal: 'Nature Medicine',
        year: 2023,
        doi: '10.1038/nm.2023.001',
        summary: 'Recent advances in cardiac regeneration show promising results in post-infarction recovery through stem cell therapy. The study demonstrates improved ventricular function and reduced scar tissue formation.'
      },
      {
        title: 'Mechanisms of Heart Failure: Molecular Insights and Therapeutic Targets',
        authors: 'Chen L, Wang X, Zhang Y, Liu M',
        journal: 'Circulation Research',
        year: 2022,
        summary: 'Novel molecular pathways identified in heart failure progression, highlighting potential therapeutic targets including calcium signaling and mitochondrial dysfunction.'
      },
      {
        title: 'Autonomic Regulation of Cardiac Function in Health and Disease',
        authors: 'Davis K, Martinez P, Anderson S',
        journal: 'Cardiovascular Research',
        year: 2023,
        doi: '10.1093/cvr.2023.004',
        summary: 'Comprehensive review of autonomic nervous system influence on cardiac performance, exploring sympathetic and parasympathetic balance in various physiological states.'
      },
      {
        title: 'Exercise-Induced Cardiac Adaptation: Molecular and Cellular Mechanisms',
        authors: 'Taylor R, Thompson J',
        journal: 'Journal of Applied Physiology',
        year: 2024,
        summary: 'Analysis of cardiac remodeling in response to endurance training, revealing enhanced mitochondrial biogenesis and improved calcium handling.'
      }
    ],
    signalResponse: `Signal received: Increased sympathetic stimulation detected. Response initiated:\n• Heart rate increasing from 72 to 95 bpm\n• Contractility enhanced by 35%\n• Coronary vasodilation activated\n• Cardiac output rising to 6.8 L/min\n• Oxygen consumption increased proportionally\n• All parameters within safe operational range\n• Estimated time to stabilization: 45 seconds`
  },
  
  'organ-liver': {
    statusDetails: `Hepatic function is stable with normal metabolic activity. Glucose homeostasis maintained through balanced glycogenolysis and gluconeogenesis. Protein synthesis rates are optimal at 15g/day. Bile production steady at 800ml/day. Detoxification enzymes (CYP450 family) operating at 85% capacity. No signs of steatosis or inflammation.`,
    literature: [
      {
        title: 'Hepatic Regeneration and Metabolic Adaptation Following Injury',
        authors: 'Zhang Y, Liu M, Wang S, Chen X',
        journal: 'Cell Metabolism',
        year: 2023,
        doi: '10.1016/j.cmet.2023.001',
        summary: 'Liver demonstrates remarkable regenerative capacity through metabolic reprogramming and cellular plasticity. Study reveals key signaling pathways involved in hepatocyte proliferation.'
      },
      {
        title: 'Role of Liver in Systemic Glucose Regulation',
        authors: 'Anderson T, White M',
        journal: 'Hepatology',
        year: 2022,
        summary: 'Detailed analysis of hepatic glucose sensing mechanisms and their integration with pancreatic hormone signals for maintaining blood glucose homeostasis.'
      },
      {
        title: 'Mitochondrial Function in Hepatocytes: Energy Metabolism and Beyond',
        authors: 'Rodriguez P, Garcia M, Lopez J',
        journal: 'Journal of Hepatology',
        year: 2024,
        doi: '10.1016/j.jhep.2024.002',
        summary: 'Exploration of mitochondrial roles in hepatic metabolism, including ATP production, fatty acid oxidation, and regulation of apoptotic pathways.'
      }
    ],
    signalResponse: `Signal received: Glucose influx detected. Response initiated:\n• Activating glycogen synthase\n• Glucose-6-phosphate conversion accelerated\n• Glycogen storage increased by 28%\n• Insulin sensitivity enhanced\n• Gluconeogenesis pathway temporarily suppressed\n• Blood glucose stabilization in progress\n• Estimated completion time: 90 seconds`
  },

  'organ-kidney': {
    statusDetails: `Renal function optimal with glomerular filtration rate at 120 ml/min. Electrolyte balance maintained: Na+ 140 mEq/L, K+ 4.2 mEq/L. Urine output steady at 1.5 ml/min. Tubular reabsorption efficiency at 99%. Blood pressure regulation through renin-angiotensin system functioning normally. No proteinuria detected.`,
    literature: [
      {
        title: 'Renal Function and Filtration Dynamics in Physiological Conditions',
        authors: 'Brown A, Davis K, Wilson T',
        journal: 'Kidney International',
        year: 2023,
        summary: 'Advanced imaging reveals real-time kidney filtration mechanisms and their regulation under various stress conditions, highlighting the importance of podocyte integrity.'
      },
      {
        title: 'Electrolyte Homeostasis: Renal Mechanisms and Clinical Implications',
        authors: 'Martinez E, Johnson L',
        journal: 'American Journal of Physiology',
        year: 2022,
        doi: '10.1152/ajprenal.2022.003',
        summary: 'Comprehensive review of renal tubular transport systems responsible for maintaining electrolyte balance and acid-base homeostasis.'
      },
      {
        title: 'Chronic Kidney Disease Prevention: Early Detection Strategies',
        authors: 'Lee S, Kim H, Park J',
        journal: 'Nephrology Dialysis Transplantation',
        year: 2024,
        summary: 'Novel biomarkers for early detection of renal dysfunction, emphasizing the importance of regular monitoring in at-risk populations.'
      }
    ],
    signalResponse: `Signal received: Blood pressure elevation detected. Response initiated:\n• Renin secretion reduced by 40%\n• Angiotensin II levels decreasing\n• Sodium excretion increased\n• Water retention decreased\n• Glomerular filtration rate adjusted to 105 ml/min\n• Blood pressure normalization in progress\n• Estimated time to effect: 3-5 minutes`
  },

  'organ-Intestine': {
    statusDetails: `Gastrointestinal tract functioning normally with peristaltic activity at 12 contractions/minute. Microbial diversity index at 0.85 (healthy range). Nutrient absorption efficiency: 92% for carbohydrates, 88% for proteins, 85% for lipids. Tight junction integrity maintained. No inflammatory markers detected. pH gradient optimal from duodenum (6.5) to colon (7.0).`,
    literature: [
      {
        title: 'Gut Microbiome and Systemic Health: Beyond Digestion',
        authors: 'Garcia M, Rodriguez P, Santos R',
        journal: 'Science',
        year: 2023,
        doi: '10.1126/science.2023.001',
        summary: 'Intestinal microbiota plays crucial role in immune regulation, metabolic homeostasis, and even neurological function through the gut-brain axis.'
      },
      {
        title: 'Intestinal Barrier Function and Permeability Regulation',
        authors: 'Thompson K, Miller D',
        journal: 'Gut',
        year: 2022,
        summary: 'Investigation of tight junction proteins and their role in maintaining intestinal barrier integrity, preventing bacterial translocation.'
      },
      {
        title: 'Nutrient Sensing and Absorption in Small Intestine',
        authors: 'Chen W, Liu Q, Zhang F',
        journal: 'Cell Metabolism',
        year: 2024,
        doi: '10.1016/j.cmet.2024.005',
        summary: 'Molecular mechanisms of nutrient detection and transport across intestinal epithelium, including glucose, amino acid, and fatty acid transporters.'
      },
      {
        title: 'Enteric Nervous System: The Second Brain',
        authors: 'Anderson M, White J',
        journal: 'Nature Reviews Neuroscience',
        year: 2023,
        summary: 'Comprehensive overview of enteric nervous system organization and its independent regulatory functions in gastrointestinal motility and secretion.'
      }
    ],
    signalResponse: `Signal received: Food intake detected. Response initiated:\n• Gastric emptying rate increased\n• Enzyme secretion elevated by 65%\n• Peristaltic activity accelerated to 18 contractions/min\n• Blood flow to mucosa increased by 40%\n• Nutrient transporter expression upregulated\n• Microbiome activation for fermentation\n• Estimated digestion completion: 2-4 hours`
  },

  'organ-brain': {
    statusDetails: `Central nervous system displaying normal neural activity patterns. Cerebral blood flow at 750 ml/min (15% of cardiac output). Neurotransmitter levels balanced: dopamine, serotonin, and GABA within optimal ranges. Synaptic plasticity markers elevated, indicating active learning. No seizure activity. Blood-brain barrier integrity maintained. Glymphatic system clearing metabolic waste efficiently during rest cycles.`,
    literature: [
      {
        title: 'Neural Plasticity and Cognitive Function Across the Lifespan',
        authors: 'Wilson T, Anderson S, Taylor M',
        journal: 'Nature Neuroscience',
        year: 2023,
        summary: 'CNS demonstrates adaptive plasticity in response to environmental stimuli and learning experiences, with age-related changes in synaptic density and connectivity.'
      },
      {
        title: 'Neurovascular Coupling: Linking Brain Activity to Blood Flow',
        authors: 'Martinez R, Lopez C',
        journal: 'Journal of Cerebral Blood Flow & Metabolism',
        year: 2022,
        doi: '10.1177/jcbfm.2022.007',
        summary: 'Investigation of mechanisms coupling neuronal activity to local blood flow changes, essential for functional brain imaging techniques.'
      },
      {
        title: 'Glymphatic System: Brain Waste Clearance Pathway',
        authors: 'Jensen K, Nedergaard M',
        journal: 'Science',
        year: 2023,
        doi: '10.1126/science.2023.008',
        summary: 'Discovery and characterization of brain waste removal system active during sleep, with implications for neurodegenerative disease prevention.'
      },
      {
        title: 'Neurotransmitter Balance and Mental Health',
        authors: 'Brown E, Davis R, Miller P',
        journal: 'Molecular Psychiatry',
        year: 2024,
        summary: 'Comprehensive review of neurotransmitter systems and their dysregulation in various psychiatric and neurological disorders.'
      },
      {
        title: 'Neurogenesis in Adult Brain: Myths and Reality',
        authors: 'Garcia F, Rodriguez A',
        journal: 'Cell Stem Cell',
        year: 2023,
        summary: 'Current understanding of adult neurogenesis in hippocampus and its role in memory formation and mood regulation.'
      }
    ],
    signalResponse: `Signal received: Cognitive task initiated. Response initiated:\n• Prefrontal cortex activation increased\n• Glucose metabolism elevated by 25% in active regions\n• Neurotransmitter release enhanced\n• Synaptic firing rate increased to 120 Hz\n• Working memory circuits engaged\n• Attention networks synchronized\n• Blood flow to active areas increased by 30%\n• Estimated task completion capacity: Optimal`
  }
};

// 组织类型定义
const tissueTypes = [
  { name: 'Epithelial', function: 'barrier protection and secretion', marker: 'E-cadherin', metabolicRate: 82 },
  { name: 'Connective', function: 'structural support and nutrient transport', marker: 'Collagen I', metabolicRate: 65 },
  { name: 'Muscular', function: 'contractile force generation', marker: 'Myosin', metabolicRate: 88 },
  { name: 'Nervous', function: 'signal transmission and processing', marker: 'NeuN', metabolicRate: 92 },
  { name: 'Vascular', function: 'blood flow regulation', marker: 'CD31', metabolicRate: 75 },
  { name: 'Parenchymal', function: 'primary organ function execution', marker: 'Cytokeratin', metabolicRate: 85 },
];

// 细胞类型定义
const cellTypes = [
  { name: 'Progenitor', function: 'self-renewal and differentiation', activity: 0.68, stress: 0.15 },
  { name: 'Mature', function: 'specialized function execution', activity: 0.85, stress: 0.22 },
  { name: 'Senescent', function: 'regulated senescence signaling', activity: 0.42, stress: 0.58 },
  { name: 'Activated', function: 'enhanced metabolic response', activity: 0.92, stress: 0.35 },
  { name: 'Quiescent', function: 'energy conservation mode', activity: 0.35, stress: 0.08 },
  { name: 'Regenerating', function: 'tissue repair and remodeling', activity: 0.78, stress: 0.28 },
];

// 文献作者池
const authorPools = [
  ['Smith A', 'Johnson B', 'Williams C'],
  ['Brown D', 'Jones E', 'Garcia F'],
  ['Miller G', 'Davis H', 'Rodriguez I'],
  ['Martinez J', 'Hernandez K', 'Lopez L'],
  ['Wilson M', 'Anderson N', 'Thomas O'],
  ['Taylor P', 'Moore Q', 'Jackson R'],
  ['Lee S', 'White T', 'Harris U'],
  ['Martin V', 'Thompson W', 'Garcia X'],
];

// 期刊池
const journalPools = [
  'Cell Biology International', 'Tissue Engineering', 'Cellular Physiology',
  'Journal of Cell Science', 'Molecular Biology Reports', 'Cellular and Molecular Life Sciences',
  'Experimental Cell Research', 'Cell Communication and Signaling', 'Cellular Biochemistry',
];

// 基于字符串生成稳定的哈希值
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// 为组织级别生成数据
const generateTissueData = (nodeId: string, nodeName: string): EnrichedNodeData => {
  const hash = hashString(nodeId);
  const tissueType = tissueTypes[hash % tissueTypes.length];
  const metabolicRate = tissueType.metabolicRate + (hash % 15 - 7); // ±7% variation
  const cellDensity = 2500 + (hash % 1500);
  const vascularization = 60 + (hash % 35);
  
  const authorSet = authorPools[hash % authorPools.length];
  const journal1 = journalPools[hash % journalPools.length];
  const journal2 = journalPools[(hash + 3) % journalPools.length];
  const journal3 = journalPools[(hash + 5) % journalPools.length];
  
  const year1 = 2022 + (hash % 3);
  const year2 = 2021 + ((hash + 2) % 4);
  const year3 = 2023 + ((hash + 1) % 2);
  
  return {
    statusDetails: `${tissueType.name} tissue structure maintaining normal architecture. Cell density at approximately ${cellDensity} cells/mm². Metabolic activity at ${metabolicRate}% capacity. Primary function: ${tissueType.function}. Marker expression (${tissueType.marker}) detected at expected levels. Vascularization index: ${vascularization}%. Extracellular matrix integrity preserved. No inflammatory infiltration observed.`,
    literature: [
      {
        title: `${tissueType.name} Tissue Remodeling in ${nodeName.split(' ')[0]} System`,
        authors: `${authorSet[0]}, ${authorSet[1]}, ${authorSet[2]}`,
        journal: journal1,
        year: year1,
        doi: `10.${1000 + (hash % 9000)}/tissue.${year1}.${String(hash).slice(-3)}`,
        summary: `Investigation of ${tissueType.name.toLowerCase()} tissue dynamics and remodeling mechanisms in response to physiological demands. Focus on ${tissueType.marker} expression patterns and ${tissueType.function}.`
      },
      {
        title: `Cellular Heterogeneity and Function in ${nodeName}`,
        authors: `${authorPools[(hash + 1) % authorPools.length][0]}, ${authorPools[(hash + 1) % authorPools.length][1]}`,
        journal: journal2,
        year: year2,
        summary: `Analysis of cellular composition and functional specialization within tissue structures. Examination of intercellular communication networks and metabolic coordination.`
      },
      {
        title: `Vascular Network Organization in ${tissueType.name} Tissue`,
        authors: `${authorPools[(hash + 2) % authorPools.length][0]}, ${authorPools[(hash + 2) % authorPools.length][1]}, ${authorPools[(hash + 2) % authorPools.length][2]}`,
        journal: journal3,
        year: year3,
        doi: `10.${2000 + (hash % 8000)}/vasc.${year3}.${String(hash).slice(-3)}`,
        summary: `Study on microvascular architecture and blood flow regulation in tissue microenvironments. Insights into oxygen and nutrient delivery optimization.`
      }
    ],
    signalResponse: `Signal received at ${nodeName}. ${tissueType.name} tissue response initiated:\n• ${tissueType.marker} expression modulated\n• Cell density adjusting (current: ${cellDensity}/mm²)\n• Metabolic rate shifting from ${metabolicRate}% to ${metabolicRate + 8}%\n• Vascular perfusion increased by ${15 + (hash % 10)}%\n• Extracellular matrix remodeling activated\n• Intercellular gap junction communication enhanced\n• Tissue function (${tissueType.function}) optimizing\n• Estimated adaptation time: ${90 + (hash % 60)} seconds`
  };
};

// 为细胞级别生成数据
const generateCellData = (nodeId: string, nodeName: string): EnrichedNodeData => {
  const hash = hashString(nodeId);
  const cellType = cellTypes[hash % cellTypes.length];
  const atpLevel = 65 + (hash % 30);
  const proteinSynthesis = 12 + (hash % 8);
  const membraneIntegrity = 88 + (hash % 10);
  
  const authorSet = authorPools[hash % authorPools.length];
  const journal1 = journalPools[hash % journalPools.length];
  const journal2 = journalPools[(hash + 4) % journalPools.length];
  
  const year1 = 2022 + (hash % 3);
  const year2 = 2023 + ((hash + 1) % 2);
  
  return {
    statusDetails: `${cellType.name} cell exhibiting normal physiological characteristics. Cell state: actively engaged in ${cellType.function}. ATP production at ${atpLevel}% of maximum capacity. Protein synthesis rate: ${proteinSynthesis}g/hour. Membrane integrity: ${membraneIntegrity}%. Mitochondrial respiration rate normal. No apoptotic signals detected. Lysosomal activity within expected range. Nuclear envelope intact.`,
    literature: [
      {
        title: `${cellType.name} Cell Metabolism and ${cellType.function.split(' ')[0]} Capacity`,
        authors: `${authorSet[0]}, ${authorSet[1]}`,
        journal: journal1,
        year: year1,
        doi: `10.${3000 + (hash % 7000)}/cell.${year1}.${String(hash).slice(-3)}`,
        summary: `Comprehensive analysis of metabolic pathways in ${cellType.name.toLowerCase()} cells, with emphasis on energy production, biosynthesis, and functional specialization related to ${cellType.function}.`
      },
      {
        title: `Cellular Stress Response in ${nodeName.split(' Cell')[0]} Populations`,
        authors: `${authorPools[(hash + 3) % authorPools.length][0]}, ${authorPools[(hash + 3) % authorPools.length][1]}, ${authorPools[(hash + 3) % authorPools.length][2]}`,
        journal: journal2,
        year: year2,
        summary: `Investigation of stress adaptation mechanisms and resilience in individual cells under physiological and pathological conditions. Focus on protein quality control and oxidative stress management.`
      }
    ],
    signalResponse: `Signal received at ${nodeName}. ${cellType.name} cell response:\n• Membrane receptor activation confirmed\n• Second messenger cascade (cAMP/Ca²⁺) initiated\n• Gene transcription factors mobilized\n• Protein synthesis rate adjusting: ${proteinSynthesis}g/h → ${proteinSynthesis + 3}g/h\n• ATP production increased to ${atpLevel + 12}%\n• Mitochondrial biogenesis signaling detected\n• Primary function (${cellType.function}) modulated\n• Cell-cell communication via gap junctions enhanced\n• Response stabilization: ${45 + (hash % 45)} seconds`
  };
};

// 主数据获取函数
export const getEnrichedNodeData = (nodeId: string, nodeName: string, level: string): EnrichedNodeData => {
  // 如果是器官级别，返回详细数据
  if (enrichedOrganData[nodeId]) {
    return enrichedOrganData[nodeId];
  }
  
  // 组织级别
  if (level === 'TISSUE') {
    return generateTissueData(nodeId, nodeName);
  }
  
  // 细胞级别
  if (level === 'CELL') {
    return generateCellData(nodeId, nodeName);
  }
  
  // 兜底：通用数据
  return {
    statusDetails: `${nodeName} is operating within normal parameters. Cellular metabolism active at 78% capacity. ATP production steady. No oxidative stress markers detected. Intercellular communication pathways functioning normally.`,
    literature: [
      {
        title: `Functional Analysis of ${nodeName}`,
        authors: 'LifeOS Lab Research Team',
        journal: 'Systems Biology',
        year: 2023,
        summary: `General investigation of biological processes in ${nodeName}.`
      }
    ],
    signalResponse: `Signal received at ${nodeName}. Basic response initiated. Estimated stabilization: 60 seconds.`
  };
};
