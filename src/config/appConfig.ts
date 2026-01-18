export const AppConfig = {
  starfield: {
    baseCount: 180,          // 基础星星数量
    density: 1.2,           // 密度系数，可调节整体数量
    maxSize: 2,             // 星点最大半径（px）
  },
  hierarchy: {
    tissuesPerOrgan: 5,     // 每个器官的组织数量（Phase8 提升节点量）
    cellsPerTissue: 5,      // 每个组织的细胞数量（Phase8 提升节点量）
    nodeSize: 16,           // 层级视图节点尺寸（px）
    glowScale: 1.1,         // 节点光晕强度倍数
    hoverScale: 1.02,       // 悬浮时节点放大倍数（默认 1.08 = 8% 放大，减小可减少偏移感）
  },
  transition: {
    zoomScale: 2.0,         // 双击过渡放大比例（如 2.0 = 200%）
    durationMs: 650,        // 过渡动画总时长
    switchDelayMs: 420,     // 进入下一级前的延时
  },
  links: {
    strokeWidth: 5,       // 连线宽度（px）
    strokeOpacity: 1,   // 连线不透明度（0-1，越大越"实"）
    strokeColor: 'rgba(56, 189, 248, 0.3)',  // 连线颜色（半透明青色）
    particleSize: 4,        // 光点大小（px）
    particleColor: 'rgba(56, 189, 248, 0.9)', // 光点颜色
    particleSpeed: 1,     // 光点移动速度（秒/周期，越小越快）
    particleGlow: '0 0 8px rgba(56, 189, 248, 0.8)', // 光点光晕
  },
};

export type AppConfigType = typeof AppConfig;

