# agent_logs_vh_session_1762672447.json 数据结构说明

本文档解析 `public/data/agent_logs_vh_session_1762672447.json` 的结构，便于后续在界面中展示同类 Agent 日志数据。

---

## 1. 顶层结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `session_id` | string | 会话唯一标识，例如 `vh_session_1762672447` |
| `total_logs` | number | 当前会话包含的日志条数 |
| `generated_at` | ISO datetime | 生成时间戳 |
| `logs` | array\<LogEntry\> | 按时间顺序存放的节点日志，详见下文 |
| `node_meta` | object | *新增*：按 `agent_id` 存储的节点元数据映射，见 1.1 |

### 1.1 `node_meta`

`node_meta` 以 `agent_id` 为 key，为可视化提供模拟所需的补充信息：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `should_activate` | boolean | 是否允许在模拟流程中激活该节点，默认 `true`。`false` 表示该节点及其子节点仅作为结构展示，保持灰色且不会产生消息。 |
| `risk_level` | `"low" \| "medium" \| "high"` | 节点风险等级，驱动可视化颜色及 InfoPanel 信息。若缺省则默认为 `low`。 |

---

## 2. `LogEntry` 结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `log_id` | string | 日志唯一 ID（含时间戳与节点信息） |
| `session_id` | string | 与顶层 `session_id` 对应 |
| `timestamp` | ISO datetime | 节点完成输出的时间 |
| `level` | number | 层级编号（根=0，器官=1，组织=2，细胞=3，靶点=4） |
| `level_name` | string | 层级中文名称，如 `器官层`、`组织层` 等 |
| `agent_id` | string | 节点唯一标识（组合了层级与具体节点） |
| `agent_name` | string | 节点在图中的名称，例如 `organ`、`tissue` |
| `agent_type` | string | 节点类型（root / organ / tissue / cell / target） |
| `phase` | string | 执行阶段状态，示例：`complete` |
| `input_data` | object | 当前节点接收到的输入，见 2.1 |
| `output_data` | object | 节点输出内容，见 2.2（**渲染 UI 时的主要数据来源**） |
| `analysis_mode` | string | 当前节点使用的分析流程，如 `two_round` |
| `activate_next_level` | boolean | 是否触发下一级节点 |
| `execution_time` | number | 处理耗时（秒） |
| `error_message` | string \| null | 节点执行异常信息 |

### 2.1 `input_data`

- `original_input`：所有节点都会包含的基础输入，记录 `drug`、`disease`、`patient` 等文本描述。
- `organ_flows`：仅根/器官层出现，包含 `drug_flow`、`bio_signals`、`literature_flow` 等。
- `parent_analysis`：组织/细胞/靶点层会携带上层节点的 `agent_id` 和 `output_data`，方便回溯父节点结论。

### 2.2 `output_data`（节点输出内容所在位置）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `round1_analysis` | string (Markdown) | 第一轮分析总结（**节点最直接的描述文本**） |
| `round2_analysis.llm_analysis.content` | string (Markdown) | LLM 第二轮输出（通常与 round1 内容相近） |
| `round2_analysis.llm_analysis.confidence` | number | LLM 自信度 |
| `round2_analysis.mcp_analysis.tool_queries` | string[] | 多模工具查询列表 |
| `round2_analysis.mcp_analysis.tool_result` | string | 聚合后的工具结果摘要 |
| `round2_analysis.mcp_analysis.raw_tool_results` | array | 各工具的原始返回摘要，可用于溯源 |

> **展示节点输出内容时，可优先读取：**
> 1. `output_data.round1_analysis`
> 2. 若需要结构化内容或信心值，可使用 `output_data.round2_analysis.llm_analysis`
> 3. 若需要引用外部资料，使用 `output_data.round2_analysis.mcp_analysis.tool_result/raw_tool_results`
>
> **注意**：节点只有在模拟过程中被激活（`node_meta.should_activate = true` 且对应步骤完成）后才会展示其 Agent 输出；未激活节点保持灰色，并且不会生成气泡或可视化线路。

---

## 3. 层级与节点示例

| 层级 (`level_name`) | `agent_type` 示例 | 输入特征 | 输出字段 |
| --- | --- | --- | --- |
| 根节点 (`level=0`) | `root_patient_drug` | `original_input` + 全局 context | `round1_analysis` / `round2_analysis` |
| 器官层 (`level=1`) | `organ_gut` 等 | 继承 `original_input`，附加 `organ_flows` | 同上 |
| 组织层 (`level=2`) | `tissue_gut_gut` 等 | 附加 `parent_analysis`（器官输出） | 同上 |
| 细胞层 (`level=3`) | `cell_*` | 附加上级组织输出 | 同上 |
| 靶点层 (`level=4`) | `target_*` | 附加上级细胞输出 | 同上 |

每个层级都会在 `output_data` 内生成对应的 `round1_analysis` 与 `round2_analysis`。因此，**任何节点的“输出内容”都可以通过 `logs[i].output_data` 读取。**

---

