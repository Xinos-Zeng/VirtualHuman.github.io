import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    // 兜底声明，确保 ESLint/TS 能识别 R3F 的 JSX 元素
    interface IntrinsicElements extends ThreeElements {}
  }
}

