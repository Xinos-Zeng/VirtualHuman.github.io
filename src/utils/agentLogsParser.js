/**
 * Agent Logs Parser
 *
 * 解析 agent_logs_vh_session_*.json，产出便于 UI 使用的层级结构。
 * 数据结构参考 docs/agent_logs_structure.md，层级设计参考 design.md。
 */

const deriveNodeName = (log) => {
  if (log.agent_label) return log.agent_label;
  if (log.agent_display_name) return log.agent_display_name;

  const levelName = log.level_name || '';
  const id = log.agent_id || log.agent_type || 'node';
  const segments = id.split('_').filter(Boolean);
  const suffix = segments.length > 1 ? segments.slice(1).join(' / ') : id;

  return levelName ? `${levelName} - ${suffix}` : suffix;
};

const VALID_RISK_LEVELS = ['low', 'medium', 'high'];
const DEFAULT_META = {
  should_activate: true,
  risk_level: 'low'
};

const extractOutputs = (outputData = {}) => {
  const round1 = outputData.round1_analysis || '';
  const round2 = outputData.round2_analysis || {};
  const llm = round2.llm_analysis || {};
  const mcp = round2.mcp_analysis || {};

  return {
    primaryText: round1.trim(),
    secondaryText: (llm.content || '').trim(),
    confidence: typeof llm.confidence === 'number' ? llm.confidence : null,
    toolSummary: (mcp.tool_result || '').trim(),
    toolQueries: Array.isArray(mcp.tool_queries) ? mcp.tool_queries : [],
    rawToolResults: Array.isArray(mcp.raw_tool_results) ? mcp.raw_tool_results : [],
    raw: outputData
  };
};

const buildNode = (log) => ({
  id: log.agent_id,
  name: deriveNodeName(log),
  type: log.agent_type,
  level: log.level,
  levelName: log.level_name,
  phase: log.phase,
  timestamp: log.timestamp,
  outputs: extractOutputs(log.output_data),
  rawLog: log,
  children: []
});

const isSpecificId = (id) => typeof id === 'string' && id.includes('_');

const inferParentIdFromAgentId = (node) => {
  if (!node || !node.id) return null;
  const parts = node.id.split('_');
  if (parts.length < 2) return null;
  const organKey = parts[1];

  switch (node.type) {
    case 'organ': {
      return null;
    }
    case 'tissue': {
      if (organKey) {
        return `organ_${organKey}`;
      }
      break;
    }
    case 'cell': {
      if (parts.length >= 4) {
        return `tissue_${parts[1]}_${parts[3]}`;
      }
      if (parts.length >= 3) {
        return `tissue_${parts[1]}_${parts[2]}`;
      }
      break;
    }
    case 'target': {
      if (organKey) {
        return `cell_${organKey}_cell_${organKey}`;
      }
      break;
    }
    default:
      break;
  }
  return null;
};

/**
 * 将 JSON 数据解析成树结构及分组列表
 * @param {string|object} source - JSON 字符串或对象
 */
export const parseAgentLogs = (source) => {
  const payload = typeof source === 'string' ? JSON.parse(source) : source;
  if (!payload || !Array.isArray(payload.logs)) {
    throw new Error('Invalid agent logs payload');
  }

  const nodeMeta = payload.node_meta || {};

  const sortedLogs = [...payload.logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const nodeMap = new Map();
  const nodeDetails = {};
  const lastNodeByLevel = {};
  const pendingChildren = new Map();
  const grouped = {
    root: null,
    organs: [],
    tissues: [],
    cells: [],
    targets: []
  };

  sortedLogs.forEach((log) => {
    const node = buildNode(log);
    const meta = nodeMeta[node.id] || DEFAULT_META;
    const riskLevel = VALID_RISK_LEVELS.includes(meta.risk_level) ? meta.risk_level : 'low';

    node.shouldActivate = meta.should_activate !== false;
    node.riskLevel = riskLevel;

    nodeMap.set(node.id, node);
    nodeDetails[node.id] = node;
    const nodeLevel = typeof log.level === 'number' ? log.level : null;

    // 归类
    switch (node.type) {
      case 'root':
        grouped.root = node;
        break;
      case 'organ':
        grouped.organs.push(node);
        break;
      case 'tissue':
        grouped.tissues.push(node);
        break;
      case 'cell':
        grouped.cells.push(node);
        break;
      case 'target':
        grouped.targets.push(node);
        break;
      default:
        break;
    }

    const parentCandidates = [];

    const parentReferenceId = log.input_data?.parent_analysis?.agent_id || null;
    if (parentReferenceId && isSpecificId(parentReferenceId)) {
      parentCandidates.push(parentReferenceId);
    }

    const inferredParentId = inferParentIdFromAgentId(node);
    if (inferredParentId) {
      parentCandidates.push(inferredParentId);
    }

    if (nodeLevel !== null && nodeLevel > 0 && lastNodeByLevel[nodeLevel - 1]) {
      parentCandidates.push(lastNodeByLevel[nodeLevel - 1].id);
    }

    if (grouped.root && node.type !== 'root') {
      parentCandidates.push(grouped.root.id);
    }

    let attached = false;

    for (const candidateId of parentCandidates) {
      if (!candidateId) continue;

      if (nodeMap.has(candidateId)) {
        node.parentId = candidateId;
        nodeMap.get(candidateId).children.push(node);
        attached = true;
        break;
      }

      if (isSpecificId(candidateId)) {
        if (!pendingChildren.has(candidateId)) {
          pendingChildren.set(candidateId, []);
        }
        pendingChildren.get(candidateId).push(node);
        attached = true;
        break;
      }
    }

    if (!attached && parentReferenceId && !isSpecificId(parentReferenceId)) {
      if (nodeLevel !== null && nodeLevel > 0 && lastNodeByLevel[nodeLevel - 1]) {
        const fallbackParent = lastNodeByLevel[nodeLevel - 1];
        fallbackParent.children.push(node);
        node.parentId = fallbackParent.id;
        attached = true;
      }
    }

    if (!attached && grouped.root && node.type !== 'root') {
      node.parentId = grouped.root.id;
      grouped.root.children.push(node);
    }

    if (pendingChildren.has(node.id)) {
      node.children.push(...pendingChildren.get(node.id));
      pendingChildren.delete(node.id);
    }

    lastNodeByLevel[nodeLevel ?? 0] = node;
  });

  return {
    sessionId: payload.session_id,
    generatedAt: payload.generated_at,
    totalLogs: payload.total_logs,
    hierarchy: grouped.root ? grouped.root : null,
    groupedNodes: grouped,
    nodeDetails,
    nodeMeta,
    raw: payload
  };
};

/**
 * 根据层级关系提取设计稿所需的 organ->tissue->cell->targets 结构
 * @param {ReturnType<typeof parseAgentLogs>} parsed
 */
export const buildDesignHierarchy = (parsed) => {
  const ensureArray = (list) => (Array.isArray(list) ? list : []);

  const mapTissues = (organNode) =>
    ensureArray(organNode.children).map((tissueNode) => ({
      node: tissueNode,
      cells: ensureArray(tissueNode.children).map((cellNode) => ({
        node: cellNode,
        targets: ensureArray(cellNode.children).map((targetNode) => ({
          node: targetNode
        }))
      }))
    }));

  const organs = ensureArray(parsed.groupedNodes.organs).map((organ) => ({
    node: organ,
    tissues: mapTissues(organ)
  }));

  return {
    sessionId: parsed.sessionId,
    generatedAt: parsed.generatedAt,
    root: parsed.groupedNodes.root,
    organs
  };
};

export default {
  parseAgentLogs,
  buildDesignHierarchy
};

