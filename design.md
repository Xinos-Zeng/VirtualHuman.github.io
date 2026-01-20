# 虚拟人类(VirtualHuman)项目设计方案

[IMPORTANT] 
开发过程中应保持更新该文档
你无需进行测试，只需给出交付标准

## 整体风格定位
视觉风格：深色科技感（Dark Mode + Neon Glow）
交互动效：流畅过渡 + 动态粒子流 + 悬停高亮
布局方式：响应式 + 多层级模态视图（Modal Layering）

## 前端原则
1. 定性大于定量： 不展示精密图表，展示趋势、状态和关系。
2. 视觉分层： Level 1（宏观人体）负责吸引注意力和定位；Level 2（因果拓扑）负责解释逻辑。
3. 松耦合数据： 界面能够容忍数据缺失，只要有节点和关系，就能画出图，不依赖复杂的物理坐标。
4. 开发新需求时不应该导致已有需求出bug，必须仔细检查。

## 模块一：Level 1 - 宏观人体
主体： 一个半透明的、充满科技感的人体 3D 模型  

1. 视觉实现  
状态表达（去数值化）：
● 正常态（Normal）： 器官呈现冷静的蓝色/青色微光，伴随缓慢的呼吸动效（Opacity 0.4 -> 0.6 循环）。
● 警示态（Warning）： 器官呈现黄色脉冲，跳动频率加快。
● 危急态（Critical）： 器官呈现红色高亮，并向周围扩散“故障噪点”效果。
信息  
用户一开始是看到一个人体的图；每个器官着色，整体右侧有个报告；影响特别大的器官弹出对话框标注关键信息。

2. 交互逻辑  
鼠标悬空在器官时，器官高亮，显示简短的信息。
鼠标点击器官时，镜头平滑推近该器官，背景虚化压暗，无缝过渡到 Level 2 界面。


## 模块二：Level 2 - Agent因果拓扑台
● 中心节点（大圆）： 当前选中的器官（如：肝脏）。固定在画面中央。
● 内部节点（中圆）： 该器官内的组织/细胞（如：肝细胞、免疫细胞）。漂浮在中心节点内部。
● 外部节点（外围圆）： 影响该器官的其他要素（如：外部器官、药物）。围绕在中心节点外围。连接线（Edge）： 代表“影响/因果”。

颜色（性质）：

前端实现： 连线采用流光动画（Flow Animation）。红色流光表示危害，绿色流光表示支持。
粗细（强度）： 分桶 高中低，不用数值
对应 1px, 3px, 6px 的线条粗细。不要显示具体数值，只让用户直观感到“这根红线很粗，问题很严重”。


右侧报告栏 (Context Panel)
内容： 纯文本结论 + 文献引用。

## 1. 项目背景

虚拟人类(VH)是一个通过Agent来模拟人体内的器官、组织、细胞、靶点四个层级的系统。当输入药物信息和患者信息时，VH的层级架构会自顶向下传递各个节点模拟出的信息，从而实现对药物在人体内作用过程的模拟。

## 2. 项目目标
基于前端原则和整体风格，开发出模块一和模块二。

### 2.1 各级Agent节点说明
1. 器官 - 包括肠道、肝脏、肾脏、心脏、CNS
2. 组织 - 无需具体命名，包括肠道组织、肝脏组织、肾脏组织、心脏组织、CNS组织
3. 细胞 - 无需具体命名，包括肠道细胞、肝脏细胞、肾脏细胞、心脏细胞、CNS细胞
4. 靶点 - 无需具体命名，例如肠道靶点1，肠道靶点2，...
在器官-组织-细胞层级间都是1对1关系，细胞-靶点为1对多关系。


## 3. 系统架构

### 3.1 前端架构

- **React** - 核心UI框架
- **React Router** - 实现层级化页面导航
- **D3.js/Three.js** - 实现复杂的人体可视化和动态连接线
- **Styled-components** - 组件样式管理
- **Context API** - 状态管理

## 4. 核心数据结构规范 (Data Schema)
前端开发应基于“数据驱动”原则。在后端 Agent API 就绪前，我们需要定义严格的 TypeScript 接口。

### 4.1 节点通用定义 (Agent Node)
这是一个递归或层级化的结构，用于统一管理从器官到靶点的所有节点。

```typescript
// 定义节点层级类型
export type AgentLevel = 'ORGAN' | 'TISSUE' | 'CELL' | 'TARGET';

// 定义健康状态（对应视觉设计的颜色）
export type HealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface AgentNode {
  id: string;                // 唯一标识 (e.g., "organ-liver-01")
  name: string;              // 显示名称 (e.g., "肝脏")
  level: AgentLevel;         // 层级
  status: HealthStatus;      // 状态，决定颜色和特效
  
  // 核心数值 (不直接显示，但驱动 UI 表现，如跳动频率、透明度)
  metrics: {
    activity: number;        // 0-1.0，活跃度
    stress: number;          // 0-1.0，压力值/受损程度
  };

  description?: string;      // 简短描述 (Hover 时显示)
  
  // 层级关系 (Level 1 点击进入 Level 2 的依据)
  childrenIds?: string[];    // 下级节点 ID 列表
  parentId?: string;         // 上级节点 ID
}
```

### 4.2 拓扑关系定义 (Topology Edge)
用于 Level 2 的因果关系图。

```typescript
export interface InteractionEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'SUPPORT' | 'DAMAGE'; // 决定流光颜色 (绿/红)
  intensity: 'LOW' | 'MEDIUM' | 'HIGH'; // 决定粗细 (1px/3px/6px)
  description?: string;       // 悬停在线上时显示的因果解释
}
```

## 5. 技术选型与实现细节 (Implementation Details)

### 5.1 模块一：Level 1 (3D 宏观人体)
*   **引擎**: `React Three Fiber (R3F)`
*   **模型策略**: 
    *   **初期 (MVP)**: 使用 **Low-Poly（低多边形）** 或 **几何抽象体**（透明胶囊体代表人体，发光球体代表器官）。
    *   **材质**: 使用 `MeshPhysicalMaterial` 实现“半透明玻璃感”。
        *   `transmission`: 0.6 (透光)
        *   `roughness`: 0.2 (光滑)
        *   `emissive`: 基于 `status` 动态改变颜色 (青/黄/红)。
*   **动画**: 使用 `useFrame` 钩子实现“呼吸动效”。
*   **交互**: 使用 `drei` 库的 `<Html>` 组件实现 Hover 时的浮动标签，避免复杂的 3D 文字渲染。

### 5.2 模块二：Level 2 (2D/3D 混合拓扑)
*   **引擎**: 建议使用 `D3.js` (Force Simulation) 结合 `SVG` 或 `Canvas` 渲染。
*   **流光连线 (Flow Animation)**:
    *   **SVG 实现方案**: 利用 `stroke-dasharray` 和 `stroke-dashoffset` CSS 动画。
    *   **逻辑**: 
        *   红色连线 (`DAMAGE`): 粒子流动快，颜色刺眼。
        *   绿色连线 (`SUPPORT`): 粒子流动平缓。

### 5.3 状态管理与路由
*   **路由策略**: 
    *   `/` -> Level 1 (全览)
    *   `/organ/:organId` -> Level 2 (详情)
*   **Context**: 需要一个 `SimulationContext` 全局存储所有 Agent 的实时状态。

## 6. 组件架构 (Component Architecture)

```text
src/
├── assets/             # 3D 模型 (.glb), 贴图
├── components/
│   ├── layout/         # UI 框架
│   │   ├── HUD.tsx     # 抬头显示 (右上角状态，右侧报告栏)
│   │   └── Modal.tsx   # 警告弹窗
│   ├── level1/         # 3D 宏观视图
│   │   ├── HumanBody.tsx   # R3F Canvas 容器
│   │   ├── OrganMesh.tsx   # 单个器官组件 (处理呼吸、颜色)
│   │   └── CameraController.tsx # 处理点击后的镜头推近
│   └── level2/         # 拓扑视图
│       ├── TopologyGraph.tsx # D3 力导向图容器
│       ├── AgentNode.tsx     # 节点渲染 (圆)
│       └── FluxLink.tsx      # 连线渲染 (流光效果)
├── services/
│   ├── mockData.ts     # 静态模拟数据
│   └── simulation.ts   # 模拟数据变化的逻辑 (自顶向下传递)
└── types/              # TS 类型定义
```

## 7. 分阶段开发计划 (Dev Roadmap)

### Phase 1: 骨架与数据 (预计 1-2 天)
*   **目标**: 跑通数据流，无复杂 UI。
*   **任务**:
    1.  搭建 React + TypeScript + Vite 脚手架。
    2.  实现 `MockDataService`，生成包含器官-组织-细胞的层级数据。
    3.  建立 Global Context，实现一个简单的 Debug 面板。
*   **交付物**: 一个只有文字列表的页面，但数据结构完整。

### Phase 2: Level 2 拓扑核心 (预计 2-3 天)
*   **目标**: 完成“因果拓扑台”。
*   **任务**:
    1.  集成 D3.js 力导向图。
    2.  实现“中心节点-周边节点”的布局算法。
    3.  实现 SVG 连线的流光动画。
*   **交付物**: 可交互的 2D 拓扑图。

### Phase 3: Level 1 3D 视觉 (预计 3-4 天)
*   **目标**: 完成 3D 首页。
*   **任务**:
    1.  引入 React Three Fiber。
    2.  放置抽象人体模型。
    3.  实现 Shader 或 Material 动画。
    4.  实现点击器官 -> Level 2 跳转。
*   **交付物**: 3D 首页，无缝跳转到 Level 2。

### Phase 4: 整合与 UI 抛光 (预计 2 天)
*   **目标**: 统一风格，增加沉浸感。
*   **任务**:
    1.  实现“右侧报告栏”和“关键信息弹窗”。
    2.  全局样式调整：Dark Mode，Neon Glow。
    3.  转场动画。

### Phase 5: Level 1 底图拟真与标注对齐 (预计 1 天)
*   **目标**: 用真实人体插画替换抽象躯干，节点标注与插画器官位置精确对齐，交互保持数据驱动。
*   **任务**:
    1.  将 `assets/body.png` 作为 Level 1 底图居中展示，保持纵横比与响应式缩放。
    2.  提供器官坐标表（百分比），与 Agent 节点绑定，悬停/点击高亮。
    3.  状态色与选中态样式同步（NORMAL/WARNING/CRITICAL 的配色与光晕）。
    4.  预留坐标微调入口（配置化），必要时可依据设计稿或标注工具导出的坐标快速更新。
*   **交付物**:
    - 首页展示 `body.png` 底图，五个器官标注与插画位置匹配，可点击进入 Level 2。
    - 不同分辨率下标注不漂移（使用百分比定位并保持原图宽高比）。
    - 文档中记录坐标来源、调整方式与状态色规范。

### Phase 6: 沉浸视觉加强与交互优化 (预计 1-2 天)
*   **目标**: 让首页背景与人体插画无缝融合，增加星空闪烁效果；节点标注采用空心粒子/光晕动效匹配状态说明（Normal/Warning/Critical）；优化交互体验，修复 bug，增加缩放拖动与悬停提示。
*   **任务**:
   1.  **星空背景**: 使用 `radial-gradient` 绘制 18+ 个白点星空，尺寸 1-2px，不透明度 0.5-1.0，添加 twinkle 动画（4s 缓慢闪烁），z-index 置顶确保可见性。
   2.  **人体底图融合**: 去掉容器边框/描边，全黑背景沉浸式展示，底图居中，配合 drop-shadow 增强层次感。
   3.  **空心粒子节点**: 标注改为 12px 空心圆环（2px 边框），配合 inset 阴影与泛光效果；Normal 缓慢呼吸蓝光（3.6s）、Warning 加速脉冲黄光（2s）、Critical 红色强脉冲 + 噪点闪烁（1.2s）。
   4.  **Critical Alert Bug 修复**: 改用 `Set<string>` 管理已确认的 critical 节点，只在首次变为 CRITICAL 时弹窗，确认后不再重复；节点恢复正常时清除标记。
   5.  **缩放拖动交互**: 支持鼠标滚轮缩放（0.5x - 3x）、左键拖动平移，右下角显示缩放比例与重置按钮。
   6.  **悬停弹窗**: 鼠标悬停在节点时，在鼠标附近弹出浮窗，展示器官名称、状态徽章、Activity/Stress 数据和描述信息（复用侧边栏内容）。
*   **交付物**:
   - 星空闪烁明显可见，层次丰富且不干扰主体内容。
   - 人体底图无边框、居中，节点呈现空心光晕，视觉更轻盈、更具科技感。
   - Critical Alert 只在首次状态变化时弹出，无重复干扰。
   - 用户可自由缩放/拖动人体图查看细节，操作流畅无卡顿。
   - 悬停任意节点即可快速预览关键信息，无需点击切换侧边栏。

### Phase 7: 递归层级视图与调试台分离 (预计 2-3 天)
*   **目标**: 将调试功能独立为专门界面；重构 Level2 为递归层级视图，支持双击从器官->组织->细胞层层深入，配合器官背景图实现"放大-虚化"的沉浸式探索体验。
*   **任务**:
   1.  **调试台独立界面**: 将原 Level2 左侧的节点状态调试卡片迁移到独立的 "Debug Console" 界面，从 Level1 右上角按钮进入，展示所有节点列表及状态切换按钮。
   2.  **双击进入层级**: Level1 人体视图支持双击器官节点，触发"放大-虚化"动画过渡，进入该器官的下级层级（组织层级）。
   3.  **递归层级视图（HierarchyView）**:
      - 显示当前节点的所有子节点（如器官->组织，组织->细胞）。
      - 每个实际节点生成 3-5 个视觉副本，随机分布在视窗中，模拟细胞/组织的不均匀分布效果。
      - 背景显示器官的高分辨率图片（虚化+暗化处理），增强沉浸感。
      - 支持双击子节点继续放大进入下一层级（如双击组织进入细胞层级）。
      - 左上角返回按钮，回退到上一层级或返回 Level1。
   4.  **器官背景图素材目录**: 创建 `public/assets/organs/` 目录，预留 heart-bg.jpg、liver-bg.jpg、kidney-bg.jpg、intestine-bg.jpg、brain-bg.jpg 等占位，配合 HierarchyView 的背景图映射逻辑。
   5.  **层级导航历史**: 记录用户的层级导航路径（如 器官A -> 组织B -> 细胞C），支持按返回按钮逐级回退。
   6.  **视觉优化**: 层级视图中的节点保持空心粒子光晕效果，配合 float 动画，营造"微观世界"的动态感。
*   **交付物**:
   - Debug Console 独立界面，清晰展示所有节点及调试控制，不干扰主视图。
   - Level1 双击器官可流畅进入递归层级视图，无缝过渡动画。
   - 递归层级视图支持器官->组织->细胞的多级探索，每级显示对应背景图与多个视觉副本节点。
   - 器官背景图目录已创建，含 README 说明命名规范与建议规格。
   - 用户可通过返回按钮逐级回退或直接返回 Level1，导航逻辑清晰流畅。
   - 节点视觉效果统一，层级视图中节点呈现微观动态感。


### Phase 8: 网络连线与交互强化 (预计 1-2 天)
*   **目标**: 增强星空与节点网络的沉浸感，完善跨区域缩放和信息展示，提升层级节点的数量与连线动效。
*   **任务（合并原任务与新增要求）**:
     1.  **星空粒子密度参数化**: 使用配置生成星点（数量/尺寸/密度可调），避免手工硬编码；背景为纯黑色。
     2.  **层级节点连线网络**: 在每一级视图（器官/组织/细胞/靶点）节点之间绘制细线网络（至少中心→子节点），连线具备往返流动的粒子/虚线动画，颜色映射节点状态。
     3.  **星空区域缩放生效**: 鼠标位于背景区域也可触发缩放/平移（0.5x-3x）。
     4.  **右侧卡片弹窗**: 右侧卡片栏可点击，在中央弹窗展示完整信息，支持关闭/遮罩点击关闭。
     5.  **节点数量提升**: 每级显示的子节点数量提升至约 6-8 个，保持空心粒子/光晕风格与 float 动画。
     6.  **过渡动画可调**: 双击节点放大过渡倍率/时长可配置，默认约 200%。
*   **交付物**:
     - 星空背景可通过单一参数快速调节密度，纯黑底色下星点随机且闪烁自然。
     - 视图内存在中心→子节点的连线网络，连线有可见流动动画并映射状态。
     - 缩放/拖动在星空与人体区域一致生效。
     - 右侧卡片可弹出中央窗口展示详情，遮罩可关闭。
     - 每级子节点数量达到 6-8 个且分布稳定，视觉风格统一。
     - 双击过渡倍率/时长可通过配置调整。
*   **开发日志（2026-01-14）**:
     - **全局配置集中管理**: 创建 `src/config/appConfig.ts`，统一管理星空粒子密度/数量、层级节点数量（组织/细胞）、节点尺寸/光晕强度、双击过渡倍率/时长、连线样式/光点参数。应用启动时将配置写入 CSS 变量，便于全局调整视觉效果。
     - **连线系统实现**: 
       - Level1 首页添加从心脏到其他器官的 SVG 连线层，每条连线带有一个流动的光点粒子，使用 `<animateMotion>` 实现平滑移动。
       - 层级视图重构为中心辐射式布局：当前节点固定在视图中心（放大 1.3 倍，标签常显），子节点以圆形均匀分布在周围，所有连线从中心节点连至子节点。
       - 连线与光点的样式（宽度、颜色、大小、速度、光晕）统一从 `appConfig.links` 读取，便于快速调整视觉效果。
     - **层级视图布局优化**: 使用 `circularPosition` 函数替代随机分布，子节点按索引在半径 32% 的圆周上均匀排列，确保布局稳定且不因状态刷新而漂移。
     - **右侧信息弹窗**: 在节点详情卡片底部添加"在弹窗查看详情"按钮，点击后在页面中央弹出模态窗口，展示完整的节点信息（状态、指标、文献等），支持遮罩点击关闭。弹窗使用独立样式类 `.info-modal`，采用青色主题以区别于 critical 红色弹窗。
     - **中心节点视觉增强**: 为层级视图的中心节点添加特殊样式（更大的节点尺寸、更强的光晕、常显标签），并设置更高的 z-index 以确保始终位于连线和子节点之上。
     - **背景与缩放交互**: 主页背景区域也可触发滚轮缩放（之前仅人体图区域生效），星空背景改为纯黑色（`#000000`），星点由配置动态生成。
     - **节点数量提升**: 通过 `appConfig.hierarchy.tissuesPerOrgan` 和 `cellsPerTissue` 配置，每器官默认生成 6 个组织、每组织 6 个细胞，满足"约 6-8 个子节点"的要求。
     - **双击过渡动画优化**: 进入下一层级时，以双击点为中心放大到配置倍率（默认 200%）后再切换视图，过渡层使用 SVG 虚化效果，倍率/时长均可在 `appConfig.transition` 中调整。
     - **文件结构**: 
       - `src/config/appConfig.ts`: 全局配置文件（新增）
       - `src/components/level1/HumanBody.tsx`: 添加连线层与光点动画
       - `src/components/level2/HierarchyView.tsx`: 重构布局为中心辐射式，添加中心节点与弹窗
      - `src/App.tsx`: 注入配置到 CSS 变量，生成星空背景
      - `src/App.css`: 添加中心节点样式、弹窗样式、连线动画
      - `design.md`: 更新 Phase8 任务列表与开发日志

---

## Phase 9: Internationalization & Enhanced Data Simulation

**目标**: 将所有界面文本英文化，构建丰富的节点模拟数据，并添加信号输入功能。

**任务列表**:
- [x] 将所有界面显示文本替换为英文
- [x] 创建 `enrichedNodeData.ts` 存储丰富的节点模拟信息
- [x] 在卡片栏添加"Signal Input"按钮和弹窗功能
- [x] 更新 `design.md` 添加 Phase9 开发日志

**开发日志（2026-01-20）**:
- **国际化（i18n）**: 
  - 将所有中文界面文本替换为英文，包括：
    - 交互提示（"单击选择 • 双击放大进入" → "Click to select • Double-click to zoom in"）
    - 卡片标题（"器官详情" → "Organ Details"，"节点详情" → "Node Details"）
    - 信息区块标题（"状态信息" → "Status Information"，"相关文献" → "Related Literature"）
    - 节点名称（"心脏" → "Heart"，"肝脏" → "Liver"，"肾脏" → "Kidney"，"肠道" → "Intestine"）
    - 节点描述和文献信息全部英文化
  - 修改文件：`src/App.tsx`、`src/components/level2/HierarchyView.tsx`、`src/services/mockData.ts`

- **丰富的节点数据系统**: 
  - 创建 `src/services/enrichedNodeData.ts`，为每个节点提供详细的模拟信息：
    - **`statusDetails`**: 详细的状态描述（如心脏的心输出量、心率、射血分数等生理指标）
    - **`literature`**: 丰富的文献列表（每个器官 3-5 篇高质量模拟文献，包含标题、作者、期刊、年份、DOI、摘要）
    - **`signalResponse`**: 默认的信号输入响应模拟文本（描述节点接收信号后的预期反应）
  - 为五个器官（Heart, Liver, Kidney, Intestine, CNS）分别构建详细的模拟数据
  - 组织和细胞级别使用通用模板生成数据
  - 通过 `getEnrichedNodeData()` 函数统一访问，自动回退到通用数据

- **信号输入功能**: 
  - 在所有层级的节点信息卡片底部添加"⚡ Signal Input"按钮
  - 点击按钮弹出中央模态窗口，包含：
    - **输入区**: 多行文本框，用户可输入模拟信号（如"Increased workload"、"External stress detected"）
    - **响应区**: 显示该节点的预期响应（从 `enrichedNodeData` 读取 `signalResponse`）
    - 提示文本说明这是模拟响应，实际逻辑将在未来阶段实现
  - 模态窗口支持遮罩点击关闭，使用与详情弹窗相同的样式系统
  - 实现位置：
    - Level1 (`App.tsx` 中的 `Level1View` 组件)
    - Level2+ (`HierarchyView.tsx` 组件)

- **数据集成**: 
  - 在 `App.tsx` 和 `HierarchyView.tsx` 中集成 `enrichedNodeData`
  - 替换原有的 `node.description` 为 `enrichedData.statusDetails`（更详细）
  - 替换原有的 `node.literature` 为 `enrichedData.literature`（更丰富）
  - Level1 信息卡片仅显示前 2 篇文献，详情弹窗显示全部

- **文件结构**: 
  - `src/services/enrichedNodeData.ts`: 丰富的节点数据定义（新增）
  - `src/App.tsx`: 集成 enrichedData，添加 Signal Input 按钮和弹窗
  - `src/components/level2/HierarchyView.tsx`: 集成 enrichedData，添加 Signal Input 按钮和弹窗
  - `src/services/mockData.ts`: 节点名称和描述英文化
  - `src/App.css`: 复用现有的 `.btn-secondary` 和 `.info-modal` 样式
  - `design.md`: 添加 Phase9 任务与开发日志

**技术细节**:
- **数据结构**: `EnrichedNodeData` 接口包含 `statusDetails`、`literature`、`signalResponse` 三个字段
- **数据访问**: 通过 `useMemo` 缓存 `enrichedData`，避免不必要的重复计算
- **状态管理**: 使用 `showSignalInput` 和 `signalInputText` 状态管理弹窗显示和用户输入
- **样式复用**: Signal Input 弹窗复用 `.info-modal-overlay`、`.info-modal-container` 等样式类
- **用户体验**: 输入框支持多行文本，响应区使用预格式化文本（`white-space: pre-line`）保持换行格式

**Phase 9 优化（2026-01-20）**:
1. **器官名称确认**: 
   - 验证所有器官名称已正确英文化（Heart, Liver, Kidney, Intestine, CNS）
   - 组织和细胞名称自动继承器官英文名

2. **Signal Input 交互优化**: 
   - 将 Signal Input 从底部按钮改为卡片栏信息区块
   - 位置调整到 Zoom In 按钮上方，与其他信息区块（Status Information, Related Literature）保持一致的视觉风格
   - 点击后在屏幕中央弹出模态窗口，与点击其他信息区块的交互方式统一
   - 移除了独立的按钮样式，采用 `.info-section` 样式以保持界面一致性

3. **子节点数据丰富化**: 
   - **组织级别（TISSUE）**: 
     - 定义 6 种组织类型（Epithelial, Connective, Muscular, Nervous, Vascular, Parenchymal），每种具有独特的功能、标记物和代谢率
     - 基于节点 ID 哈希值稳定分配组织类型，确保同一节点始终显示相同数据
     - 状态描述包含：组织类型、细胞密度、代谢活性、标记物表达、血管化指数、基质完整性
     - 每个组织节点生成 3 篇独特的文献引用，涵盖组织重塑、细胞异质性、血管网络等主题
     - 信号响应模拟包含组织特异性的反应参数
   - **细胞级别（CELL）**: 
     - 定义 6 种细胞类型（Progenitor, Mature, Senescent, Activated, Quiescent, Regenerating），每种具有特定功能和活性/压力水平
     - 基于节点 ID 哈希值稳定分配细胞类型
     - 状态描述包含：细胞状态、ATP 水平、蛋白质合成速率、膜完整性、线粒体呼吸、核膜状态
     - 每个细胞节点生成 2 篇独特的文献引用，聚焦于细胞代谢和应激响应
     - 信号响应模拟包含细胞特异性的分子事件（受体激活、第二信使、基因转录等）
   - **数据生成策略**: 
     - 使用 `hashString()` 函数基于节点 ID 生成稳定的哈希值
     - 通过哈希值模运算从预定义的类型池、作者池、期刊池中选择元素
     - 确保每个节点的数据唯一且可重现
     - 参数值（如代谢率、细胞密度）在基础值上添加哈希驱动的随机变化，模拟生物多样性
   - **文献多样性**: 
     - 8 个作者组合池，9 个期刊池，确保文献来源多样化
     - DOI 动态生成，基于哈希值确保唯一性
     - 年份范围 2021-2024，根据哈希值分配

4. **文件修改**: 
   - `src/services/enrichedNodeData.ts`: 
     - 新增 `tissueTypes`、`cellTypes`、`authorPools`、`journalPools` 数据池
     - 实现 `hashString()`、`generateTissueData()`、`generateCellData()` 函数
     - 重构 `getEnrichedNodeData()` 支持组织和细胞级别的动态数据生成
   - `src/App.tsx`: Signal Input 区块样式和位置调整
   - `src/components/level2/HierarchyView.tsx`: Signal Input 区块样式和位置调整

**交付标准**:
- ✅ 所有界面文本完全英文化
- ✅ Signal Input 交互方式与其他信息区块一致，点击后弹出中央模态窗口
- ✅ 每个组织节点具有独特的类型、状态描述、3 篇文献、专属信号响应
- ✅ 每个细胞节点具有独特的类型、状态描述、2 篇文献、专属信号响应
- ✅ 数据生成基于哈希算法，确保稳定性和可重现性
- ✅ 无 linter 错误

**Phase 9 二次优化（2026-01-20）**:

根据用户反馈进行的关键修复：

1. **Signal Input 按钮样式和位置调整**:
   - **问题**: Signal Input 使用 `info-section` 样式，与 ZOOM IN 按钮样式不一致，且距离较远
   - **修复**: 
     - 将 Signal Input 改为 `btn` 样式，与 ZOOM IN 按钮使用相同的样式类
     - 调整位置至 ZOOM IN 按钮正上方，间距 12px，确保两个按钮紧密排列
     - Signal Input 按钮包含图标（⚡）和文本，视觉风格完全一致
     - 位于卡片栏底部的操作区域（`marginTop: 'auto'`）内

2. **Signal Input 模态窗口统一**:
   - **问题**: Signal Input 弹窗使用 `info-modal-overlay` 和 `info-modal-container` 类，导致在不同层级显示位置不一致（首页在下方，子视图在右侧）
   - **修复**: 
     - 统一使用与详情弹窗相同的 CSS 类：`modal-backdrop` 和 `modal info-modal`
     - 确保所有层级的 Signal Input 弹窗都在屏幕中央显示
     - 遮罩层（`modal-backdrop`）使用固定定位（`position: fixed; inset: 0`），覆盖整个视口
     - 模态窗口（`modal info-modal`）居中对齐（`display: flex; align-items: center; justify-content: center`）
     - 标题栏和关闭按钮样式与详情弹窗完全一致
     - 内容区域支持滚动（`maxHeight: '70vh', overflow: 'auto'`）

3. **视觉一致性**:
   - Signal Input 按钮和 ZOOM IN 按钮使用相同的 `.btn` 类
   - Signal Input 弹窗和文献详情弹窗使用相同的 CSS 类和样式
   - 所有层级（Level 1 和 Level 2+）的交互体验完全统一

**修改文件**:
- `src/App.tsx`: Signal Input 按钮样式和模态窗口类名调整
- `src/components/level2/HierarchyView.tsx`: Signal Input 按钮样式和模态窗口类名调整

**最终交付标准**:
- ✅ Signal Input 按钮与 ZOOM IN 按钮样式完全一致
- ✅ Signal Input 按钮位于 ZOOM IN 按钮正上方，间距紧凑
- ✅ Signal Input 弹窗在所有层级都显示在屏幕中央
- ✅ Signal Input 弹窗样式与文献详情弹窗完全一致
- ✅ 无 linter 错误

---

**Phase 9 三次优化（2026-01-20）**:

根据用户反馈的最终优化需求：

1. **Signal Input 窗口添加 SIMULATE 按钮**:
   - **需求**: 将模态窗口底部的提示文本替换为一个 "SIMULATE" 按钮
   - **实现**: 
     - 移除了原有的斜体提示文本："* This is a simulated response. Actual signal processing logic will be implemented in future phases."
     - 添加居中的 SIMULATE 按钮，使用 `.btn` 样式（与 ZOOM IN 和 Signal Input 按钮一致）
     - 按钮最小宽度 200px，确保视觉突出
     - 按钮包含占位的 `onClick` 处理函数（TODO: 实现信号模拟逻辑）
     - 上边距调整为 24px，与窗口内容保持适当间距
   - **位置**: 在"Expected Response"区域下方
   - **当前状态**: 按钮已实现，点击逻辑留待后续 Phase 实现

2. **首页连线端点位置修复**:
   - **问题**: 连线的端点位于节点容器的中心，而节点容器包含了点（dot）和文本标签（label），导致连线没有指向点的中心，而是偏向文本方向
   - **根本原因**: 
     - 原有的 `.body-marker` 使用 `display: flex` 布局，点和标签水平排列
     - 容器的 `transform: translate(-50%, -50%)` 使整个容器（包括文本）居中对齐
     - 连线坐标指向容器中心，而不是点的中心
   - **修复方案**: 
     - 将 `.body-marker` 容器尺寸设为 `width: 0; height: 0`，使其变成一个精确的定位点
     - 移除 `display: flex` 布局
     - 将 `.body-marker-dot` 改为绝对定位，位于容器中心（`left: 0; top: 0; transform: translate(-50%, -50%)`）
     - 将 `.body-marker-label` 改为绝对定位，相对于点向右偏移 16px（`left: 16px; top: 0; transform: translateY(-50%)`）
     - `.body-marker-glow` 已经是绝对定位，无需修改
   - **效果**: 现在连线的端点精确指向每个器官节点的点（dot）中心，而不是文本标签位置

3. **视觉一致性验证**:
   - SIMULATE 按钮样式与所有其他操作按钮一致
   - 节点标记的视觉表现保持不变（点、光晕、标签都在原位）
   - 连线端点精确对齐到点的中心，视觉效果更加准确

**修改文件**:
- `src/App.tsx`: Signal Input 模态窗口底部添加 SIMULATE 按钮
- `src/components/level2/HierarchyView.tsx`: Signal Input 模态窗口底部添加 SIMULATE 按钮
- `src/App.css`: 
  - `.body-marker` 布局调整（移除 flex，设置尺寸为 0）
  - `.body-marker-dot` 改为绝对定位居中
  - `.body-marker-label` 改为绝对定位，向右偏移

**最终交付标准**:
- ✅ Signal Input 窗口包含 SIMULATE 按钮，位置居中，样式统一
- ✅ 首页连线端点精确指向节点点的中心
- ✅ 节点标记视觉表现保持不变（点、光晕、标签位置和样式不变）
- ✅ 所有层级的交互和视觉效果一致
- ✅ 无 linter 错误

**Phase 9 Bug 修复（2026-01-20）**:

1. **节点位置调整说明**:
   - 用户根据实际人体图器官位置调整了 `organPositions` 坐标
   - 连线自动跟随节点移动，端点始终对齐节点中心
   - 调整方法已在代码注释中说明（修改 x/y 值即可）

2. **子视图卡片按钮显示不全修复**:
   - **问题**: 在子视图的 NODE DETAILS 卡片中，当内容较多时，SIGNAL INPUT 和 ZOOM IN 按钮位置太靠下，导致显示不全或只能看到上半部分
   - **原因**: 按钮区域使用 `marginTop: 'auto'` 将按钮推到容器底部，但当内容超出可视区域时，按钮被推到视口外
   - **修复**: 将按钮区域的 `marginTop: 'auto'` 改为固定的 `marginTop: '24px'`
   - **效果**: 
     - 按钮不再强制对齐容器底部
     - 按钮跟随内容流动，始终可通过滚动访问
     - 保持了按钮与上方内容的适当间距（24px + 20px padding = 44px 总间距）
     - 卡片内容区域 `overflow: 'auto'` 确保所有内容（包括按钮）都可滚动查看

**修改文件**:
- `src/components/level1/HumanBody.tsx`: 添加坐标调整注释说明
- `src/components/level2/HierarchyView.tsx`: 修复按钮区域布局

**验收标准**:
- ✅ 节点位置可通过修改 `organPositions` 坐标轻松调整
- ✅ 连线自动跟随节点移动
- ✅ 子视图卡片中的按钮完整可见，可通过滚动访问
- ✅ 所有内容都在可滚动区域内
- ✅ 无 linter 错误