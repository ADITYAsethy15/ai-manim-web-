import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  Filter,
  Gamepad2,
  GitBranch,
  Globe,
  Grid,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LineChart,
  ListChecks,
  Loader2,
  Minus,
  Moon,
  Pause,
  PenTool,
  Pencil,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
  Terminal,
  Trash2,
  Type,
  Undo2,
  Volume2,
  VolumeX,
  Wand2,
  Workflow,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

/* =========================================================================
   1. TYPES & CONTRACTS
   ========================================================================= */

export type WorkspaceTab = 'workflow' | 'agent' | 'plot' | 'canvas' | 'hosting';
export type PalettePreset = 'macaron' | '3b1b' | 'bone' | 'obsidian';

export interface ProviderPreset {
  id: string;
  name: string;
  badge: string;
  baseUrl: string;
  docsUrl: string;
  keyUrl: string;
  freeTierNotes: string;
  requiresKeyForModels: boolean;
  defaultHeaders?: Record<string, string>;
  suggestedModel?: string;
}

export interface EndpointProfile {
  id: string;
  name: string;
  presetId: string;
  baseUrl: string;
  apiKey: string;
  selectedModel: string;
  exactUrl?: boolean;
  customHeaders?: Record<string, string>;
  temperature: number;
  maxTokens: number;
  topP?: number;
  stream?: boolean;
  customSystemPrompt?: string;
  customDualSceneSystemPrompt?: string;
  customLessonPlanSystemPrompt?: string;
}

export interface DiscoveredModel {
  id: string;
  name: string;
  ownedBy?: string;
  contextLength?: number;
  promptPricePerMillion?: number | null;
  completionPricePerMillion?: number | null;
  isFree: boolean;
  supportsVision: boolean;
  supportsReasoning: boolean;
  description?: string;
  raw?: unknown;
}

export interface LessonPlan {
  title: string;
  coreQuestion: string;
  keyInsight: string;
  targetAudience: string;
  formulas: string[];
  beats: Array<{
    timeRange: string;
    heading: string;
    visualAction: string;
  }>;
  durationSec: number;
}

export interface CameraKeyframe {
  t: number;
  cx: number;
  cy: number;
  zoom: number;
}

export type ScenePrimitiveType =
  | 'grid'
  | 'axes'
  | 'function_plot'
  | 'parametric_curve'
  | 'vector_field'
  | 'circle'
  | 'rect'
  | 'polygon'
  | 'line'
  | 'arrow'
  | 'dot'
  | 'text'
  | 'riemann'
  | 'point_cloud'
  | 'surface_3d';

export interface ScenePrimitive {
  id: string;
  type: ScenePrimitiveType;
  startTime?: number;
  endTime?: number;
  enterDuration?: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  dashed?: boolean;
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  r?: number;
  w?: number;
  h?: number;
  points?: Array<[number, number]>;
  label?: string;
  fontSize?: number;
  expr?: string;
  exprY?: string;
  exprZ?: string;
  dxExpr?: string;
  dyExpr?: string;
  domain?: [number, number];
  yDomain?: [number, number];
  samples?: number;
  rects?: number;
  fillUnder?: boolean;
  animStart?: number;
  animDuration?: number;
  toX?: number;
  toY?: number;
  toR?: number;
  toW?: number;
  toH?: number;
  toScale?: number;
  surfaceMode?: 'torus' | 'sphere' | 'saddle' | 'gaussian' | 'custom';
  slicePlaneZ?: string;
  orbitT?: number;
  cloudMode?: 'bimodal_sde' | 'circle_mc' | 'spiral';
  particleCount?: number;
}

export interface FormulaOverlay {
  id: string;
  latex: string;
  title?: string;
  startTime: number;
  endTime: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center';
}

export interface NarrationCaption {
  startTime: number;
  endTime: number;
  text: string;
}

export interface VisualSceneSpec {
  id: string;
  title: string;
  subtitle?: string;
  palette: PalettePreset;
  duration: number;
  worldBounds?: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  cameraKeyframes?: CameraKeyframe[];
  primitives: ScenePrimitive[];
  formulas: FormulaOverlay[];
  captions: NarrationCaption[];
}

export interface GeneratedBundle {
  id: string;
  prompt: string;
  createdAt: number;
  modelUsed: string;
  endpointUsed: string;
  latencyMs?: number;
  reasoningTrace?: string;
  plan: LessonPlan;
  manimCode: string;
  matplotlibCode?: string;
  visualSpec: VisualSceneSpec;
  rawResponse?: string;
}

export type AgentStageId =
  | 'intent'
  | 'cartographer'
  | 'dossier'
  | 'storyboard'
  | 'composer'
  | 'auditor';

export interface AgentStageState {
  id: AgentStageId;
  title: string;
  role: string;
  status: 'idle' | 'running' | 'done' | 'error';
  content: string;
  reasoning?: string;
  latencyMs?: number;
  error?: string;
  customPrompt?: string;
}

export interface PlotLayer {
  id: string;
  kind: 'explicit' | 'parametric' | 'inequality';
  label: string;
  expr: string;
  exprY?: string;
  color: string;
  tMin?: number;
  tMax?: number;
  dashed?: boolean;
  visible: boolean;
}

/* =========================================================================
   2. MATH EVALUATOR (SAFE AST PARSER)
   ========================================================================= */

type MathScope = Record<string, number>;

type MathToken =
  | { type: 'num'; val: number }
  | { type: 'id'; val: string }
  | { type: 'op'; val: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  PI: Math.PI,
  tau: Math.PI * 2,
  TAU: Math.PI * 2,
  e: Math.E,
  E: Math.E,
};

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  log: Math.log,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  hypot: Math.hypot,
  clamp: (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v)),
  step: (edge: number, v: number) => (v < edge ? 0 : 1),
  smoothstep: (e0: number, e1: number, x: number) => {
    const u = Math.max(0, Math.min(1, (x - e0) / (e1 - e0 || 1)));
    return u * u * (3 - 2 * u);
  },
  gauss: (x: number, mu = 0, sigma = 1) =>
    Math.exp(-0.5 * ((x - mu) / (sigma || 1)) ** 2) / ((sigma || 1) * Math.sqrt(2 * Math.PI)),
};

function tokenizeMath(raw: string): MathToken[] {
  const input = raw.replace(/\*\*/g, '^').replace(/π/g, 'pi').trim();
  const tokens: MathToken[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i++];
      }
      if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
        const next = input[i + 1];
        if (next && (/[0-9]/.test(next) || ((next === '+' || next === '-') && /[0-9]/.test(input[i + 2] || '')))) {
          numStr += input[i++];
          if (input[i] === '+' || input[i] === '-') numStr += input[i++];
          while (i < input.length && /[0-9]/.test(input[i])) numStr += input[i++];
        }
      }
      const val = Number(numStr);
      tokens.push({ type: 'num', val: Number.isFinite(val) ? val : 0 });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) id += input[i++];
      tokens.push({ type: 'id', val: id });
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    if ('+-*/^'.includes(ch)) {
      tokens.push({ type: 'op', val: ch });
      i++;
      continue;
    }
    i++;
  }

  const out: MathToken[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const curr = tokens[idx];
    const prev = out[out.length - 1];
    if (prev) {
      const prevIsVal =
        prev.type === 'num' ||
        prev.type === 'rparen' ||
        (prev.type === 'id' && !(prev.val in FUNCTIONS));
      const currStartsVal =
        curr.type === 'id' || curr.type === 'lparen' || curr.type === 'num';
      if (prevIsVal && currStartsVal && !(prev.type === 'id' && curr.type === 'id')) {
        out.push({ type: 'op', val: '*' });
      }
    }
    out.push(curr);
  }
  return out;
}

type EvalNode = (scope: MathScope) => number;

function parseMathTokens(tokens: MathToken[]): EvalNode {
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpression(): EvalNode {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek() as { type: 'op'; val: string }).val.match(/^[+-]$/)) {
      const op = (consume() as { type: 'op'; val: string }).val;
      const right = parseTerm();
      const prevLeft = left;
      left = op === '+' ? (s) => prevLeft(s) + right(s) : (s) => prevLeft(s) - right(s);
    }
    return left;
  }

  function parseTerm(): EvalNode {
    let left = parsePower();
    while (peek()?.type === 'op' && (peek() as { type: 'op'; val: string }).val.match(/^[*/]$/)) {
      const op = (consume() as { type: 'op'; val: string }).val;
      const right = parsePower();
      const prevLeft = left;
      left =
        op === '*'
          ? (s) => prevLeft(s) * right(s)
          : (s) => {
              const d = right(s);
              return d === 0 ? NaN : prevLeft(s) / d;
            };
    }
    return left;
  }

  function parsePower(): EvalNode {
    const base = parseUnary();
    if (peek()?.type === 'op' && (peek() as { type: 'op'; val: string }).val === '^') {
      consume();
      const exp = parsePower();
      return (s) => Math.pow(base(s), exp(s));
    }
    return base;
  }

  function parseUnary(): EvalNode {
    if (peek()?.type === 'op') {
      const op = (peek() as { type: 'op'; val: string }).val;
      if (op === '+' || op === '-') {
        consume();
        const inner = parseUnary();
        return op === '-' ? (s) => -inner(s) : inner;
      }
    }
    return parsePrimary();
  }

  function parsePrimary(): EvalNode {
    const tok = peek();
    if (!tok) return () => 0;

    if (tok.type === 'num') {
      consume();
      const v = tok.val;
      return () => v;
    }
    if (tok.type === 'lparen') {
      consume();
      const inner = parseExpression();
      if (peek()?.type === 'rparen') consume();
      return inner;
    }
    if (tok.type === 'id') {
      consume();
      const name = tok.val;
      if (peek()?.type === 'lparen') {
        consume();
        const args: EvalNode[] = [];
        if (peek()?.type !== 'rparen') {
          args.push(parseExpression());
          while (peek()?.type === 'comma') {
            consume();
            args.push(parseExpression());
          }
        }
        if (peek()?.type === 'rparen') consume();
        const fn = FUNCTIONS[name] || FUNCTIONS[name.toLowerCase()];
        if (fn) {
          return (s) => fn(...args.map((a) => a(s)));
        }
        return () => NaN;
      }
      if (name in CONSTANTS) return () => CONSTANTS[name];
      return (s) => (name in s ? s[name] : 0);
    }
    consume();
    return () => 0;
  }

  return parseExpression();
}

const exprCache = new Map<string, EvalNode>();

export function compileMathExpr(expr: string): EvalNode {
  const key = (expr || '0').trim();
  const cached = exprCache.get(key);
  if (cached) return cached;
  try {
    const tokens = tokenizeMath(key);
    const compiled = tokens.length ? parseMathTokens(tokens) : () => 0;
    if (exprCache.size > 600) exprCache.clear();
    exprCache.set(key, compiled);
    return compiled;
  } catch {
    return () => NaN;
  }
}

/* =========================================================================
   3. 2D/3D CANVAS RENDERING ENGINE & PALETTES
   ========================================================================= */

export interface PaletteTheme {
  bg: string;
  bgGradient: string;
  grid: string;
  axis: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
}

export const PALETTES: Record<PalettePreset, PaletteTheme> = {
  macaron: {
    bg: '#FDF8E7',
    bgGradient: '#F6EED5',
    grid: 'rgba(69, 90, 100, 0.11)',
    axis: '#455A64',
    text: '#263238',
    muted: '#607D8B',
    primary: '#E76F51',
    secondary: '#2A9D8F',
    accent: '#E9C46A',
    highlight: '#8E7CC3',
  },
  '3b1b': {
    bg: '#0D1117',
    bgGradient: '#111927',
    grid: 'rgba(148, 163, 184, 0.14)',
    axis: '#CBD5E1',
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#58C4DD',
    secondary: '#F4D35E',
    accent: '#83C167',
    highlight: '#FC6255',
  },
  bone: {
    bg: '#F4EFE6',
    bgGradient: '#EAE2D3',
    grid: 'rgba(30, 36, 43, 0.1)',
    axis: '#374151',
    text: '#1E242B',
    muted: '#6B7280',
    primary: '#2B5B84',
    secondary: '#B85042',
    accent: '#C58B2B',
    highlight: '#3C6E47',
  },
  obsidian: {
    bg: '#070B12',
    bgGradient: '#0F172A',
    grid: 'rgba(56, 189, 248, 0.11)',
    axis: '#94A3B8',
    text: '#F1F5F9',
    muted: '#64748B',
    primary: '#38BDF8',
    secondary: '#34D399',
    accent: '#FBBF24',
    highlight: '#FB7185',
  },
};

function easeInOutCubic(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateCamera(keyframes: CameraKeyframe[] | undefined, t: number) {
  if (!keyframes || keyframes.length === 0) return { cx: 0, cy: 0, zoom: 1 };
  const sorted = [...keyframes].sort((a, b) => a.t - b.t);
  if (t <= sorted[0].t) return { cx: sorted[0].cx, cy: sorted[0].cy, zoom: sorted[0].zoom };
  const last = sorted[sorted.length - 1];
  if (t >= last.t) return { cx: last.cx, cy: last.cy, zoom: last.zoom };
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t || 1;
      const u = easeInOutCubic((t - a.t) / span);
      return {
        cx: lerp(a.cx, b.cx, u),
        cy: lerp(a.cy, b.cy, u),
        zoom: lerp(a.zoom, b.zoom, u),
      };
    }
  }
  return { cx: 0, cy: 0, zoom: 1 };
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
  color: string
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function renderVisualScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spec: VisualSceneSpec,
  timeSec: number,
  options?: { userPanX?: number; userPanY?: number; userZoom?: number }
) {
  const theme = PALETTES[spec.palette || 'macaron'] || PALETTES.macaron;
  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    width * 0.05,
    width * 0.5,
    height * 0.5,
    width * 0.75
  );
  grad.addColorStop(0, theme.bg);
  grad.addColorStop(1, theme.bgGradient);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const bounds = spec.worldBounds || { xMin: -7, xMax: 7, yMin: -4, yMax: 4 };
  const worldW = Math.max(0.5, bounds.xMax - bounds.xMin);
  const worldH = Math.max(0.5, bounds.yMax - bounds.yMin);

  const cam = interpolateCamera(spec.cameraKeyframes, timeSec);
  const effectiveZoom = cam.zoom * (options?.userZoom ?? 1);
  const cx = cam.cx + (options?.userPanX ?? 0);
  const cy = cam.cy + (options?.userPanY ?? 0);

  const baseScale = Math.min(width / worldW, height / worldH) * 0.92;
  const pxPerUnit = baseScale * effectiveZoom;

  const toSx = (wx: number) => width / 2 + (wx - cx) * pxPerUnit;
  const toSy = (wy: number) => height / 2 - (wy - cy) * pxPerUnit;

  for (const prim of spec.primitives || []) {
    const start = prim.startTime ?? 0;
    const end = prim.endTime ?? spec.duration + 10;
    if (timeSec < start || timeSec > end) continue;

    const enterDur = prim.enterDuration ?? 0.6;
    const enterProg = enterDur > 0 ? Math.min(1, (timeSec - start) / enterDur) : 1;
    const alpha = easeInOutCubic(enterProg);

    const animStart = prim.animStart ?? start;
    const animDur = prim.animDuration ?? 0;
    const animProg =
      animDur > 0 ? easeInOutCubic(Math.max(0, Math.min(1, (timeSec - animStart) / animDur))) : 0;

    ctx.save();
    ctx.globalAlpha = alpha;
    const stroke = prim.color || theme.primary;
    const fill = prim.fillColor || stroke;
    const lineW = prim.strokeWidth ?? 2.4;
    if (prim.dashed) ctx.setLineDash([7, 5]);

    switch (prim.type) {
      case 'grid': {
        ctx.strokeStyle = prim.color || theme.grid;
        ctx.lineWidth = 1;
        const step = prim.r && prim.r > 0 ? prim.r : 1;
        const xStart = Math.floor((cx - width / (2 * pxPerUnit)) / step) * step;
        const xEnd = Math.ceil((cx + width / (2 * pxPerUnit)) / step) * step;
        const yStart = Math.floor((cy - height / (2 * pxPerUnit)) / step) * step;
        const yEnd = Math.ceil((cy + height / (2 * pxPerUnit)) / step) * step;
        ctx.beginPath();
        for (let gx = xStart; gx <= xEnd; gx += step) {
          const sx = toSx(gx);
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, height);
        }
        for (let gy = yStart; gy <= yEnd; gy += step) {
          const sy = toSy(gy);
          ctx.moveTo(0, sy);
          ctx.lineTo(width, sy);
        }
        ctx.stroke();
        break;
      }
      case 'axes': {
        const axColor = prim.color || theme.axis;
        ctx.strokeStyle = axColor;
        ctx.lineWidth = 1.6;
        const ox = toSx(0);
        const oy = toSy(0);
        ctx.beginPath();
        ctx.moveTo(18, oy);
        ctx.lineTo(width - 18, oy);
        ctx.stroke();
        drawArrowHead(ctx, 18, oy, width - 16, oy, 8, axColor);
        ctx.beginPath();
        ctx.moveTo(ox, height - 18);
        ctx.lineTo(ox, 18);
        ctx.stroke();
        drawArrowHead(ctx, ox, height - 18, ox, 16, 8, axColor);
        break;
      }
      case 'function_plot': {
        const fn = compileMathExpr(prim.expr || 'sin(x)');
        const dom = prim.domain || [bounds.xMin, bounds.xMax];
        const samples = Math.max(40, Math.min(600, prim.samples ?? 240));
        const maxDrawX = lerp(dom[0], dom[1], Math.min(1, enterProg * 1.15));
        const pts: Array<{ sx: number; sy: number; wy: number }> = [];
        for (let i = 0; i <= samples; i++) {
          const wx = lerp(dom[0], maxDrawX, i / samples);
          const wy = fn({ x: wx, t: timeSec, s: timeSec - start });
          if (Number.isFinite(wy) && Math.abs(wy) < 200) {
            pts.push({ sx: toSx(wx), sy: toSy(wy), wy });
          } else {
            pts.push({ sx: NaN, sy: NaN, wy: NaN });
          }
        }
        if (prim.fillUnder && pts.length > 1) {
          ctx.save();
          ctx.fillStyle = fill;
          ctx.globalAlpha = alpha * (prim.fillOpacity ?? 0.22);
          ctx.beginPath();
          let started = false;
          let firstSx = 0;
          let lastSx = 0;
          const zeroY = toSy(0);
          for (const p of pts) {
            if (!Number.isFinite(p.sy)) continue;
            if (!started) {
              ctx.moveTo(p.sx, zeroY);
              ctx.lineTo(p.sx, p.sy);
              firstSx = p.sx;
              started = true;
            } else ctx.lineTo(p.sx, p.sy);
            lastSx = p.sx;
          }
          if (started) {
            ctx.lineTo(lastSx, zeroY);
            ctx.lineTo(firstSx, zeroY);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.beginPath();
        let pen = false;
        for (const p of pts) {
          if (!Number.isFinite(p.sy)) {
            pen = false;
            continue;
          }
          if (!pen) {
            ctx.moveTo(p.sx, p.sy);
            pen = true;
          } else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
        break;
      }
      case 'riemann': {
        const fn = compileMathExpr(prim.expr || 'x^2');
        const dom = prim.domain || [0, 3];
        const count = Math.max(2, Math.min(80, Math.round(prim.rects ?? 10)));
        const dx = (dom[1] - dom[0]) / count;
        const visibleCount = Math.max(1, Math.floor(count * enterProg));
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.4;
        const zeroY = toSy(0);
        for (let i = 0; i < visibleCount; i++) {
          const wx = dom[0] + i * dx;
          const wy = fn({ x: wx + dx * 0.5, t: timeSec });
          if (!Number.isFinite(wy)) continue;
          const sx = toSx(wx);
          const sw = dx * pxPerUnit;
          const sy = toSy(wy);
          ctx.save();
          ctx.globalAlpha = alpha * (prim.fillOpacity ?? 0.35);
          ctx.fillRect(sx, Math.min(sy, zeroY), sw, Math.abs(zeroY - sy));
          ctx.restore();
          ctx.strokeRect(sx, Math.min(sy, zeroY), sw, Math.abs(zeroY - sy));
        }
        break;
      }
      case 'parametric_curve': {
        const fx = compileMathExpr(prim.expr || 'cos(s)');
        const fy = compileMathExpr(prim.exprY || 'sin(s)');
        const dom = prim.domain || [0, Math.PI * 2];
        const samples = Math.max(40, Math.min(600, prim.samples ?? 240));
        const maxS = lerp(dom[0], dom[1], Math.min(1, enterProg));
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineW;
        ctx.beginPath();
        let has = false;
        for (let i = 0; i <= samples; i++) {
          const sVal = lerp(dom[0], maxS, i / samples);
          const wx = fx({ s: sVal, t: timeSec, x: sVal });
          const wy = fy({ s: sVal, t: timeSec, x: sVal });
          if (!Number.isFinite(wx) || !Number.isFinite(wy)) continue;
          const sx = toSx(wx);
          const sy = toSy(wy);
          if (!has) {
            ctx.moveTo(sx, sy);
            has = true;
          } else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        break;
      }
      case 'vector_field': {
        const fdx = compileMathExpr(prim.dxExpr || '-y');
        const fdy = compileMathExpr(prim.dyExpr || 'x');
        const xDom = prim.domain || [-5, 5];
        const yDom = prim.yDomain || [-3, 3];
        const step = prim.r && prim.r > 0.2 ? prim.r : 0.85;
        for (let wx = xDom[0]; wx <= xDom[1]; wx += step) {
          for (let wy = yDom[0]; wy <= yDom[1]; wy += step) {
            const vx = fdx({ x: wx, y: wy, t: timeSec });
            const vy = fdy({ x: wx, y: wy, t: timeSec });
            const mag = Math.hypot(vx, vy);
            if (!Number.isFinite(mag) || mag < 1e-4) continue;
            const normLen = Math.min(step * 0.72, (0.28 + 0.35 * Math.tanh(mag * 0.45)) * step);
            const ux = (vx / mag) * normLen;
            const uy = (vy / mag) * normLen;
            const sx1 = toSx(wx);
            const sy1 = toSy(wy);
            const sx2 = toSx(wx + ux);
            const sy2 = toSy(wy + uy);
            const col = prim.color || (mag > 1.8 ? theme.highlight : mag > 0.8 ? theme.primary : theme.secondary);
            ctx.strokeStyle = col;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.stroke();
            drawArrowHead(ctx, sx1, sy1, sx2, sy2, 5.5, col);
          }
        }
        break;
      }
      case 'rect': {
        const wx = lerp(prim.x ?? 0, prim.toX ?? (prim.x ?? 0), animProg);
        const wy = lerp(prim.y ?? 0, prim.toY ?? (prim.y ?? 0), animProg);
        const w = lerp(prim.w ?? 1, prim.toW ?? (prim.w ?? 1), animProg);
        const h = lerp(prim.h ?? 1, prim.toH ?? (prim.h ?? 1), animProg);
        const sx = toSx(wx);
        const sy = toSy(wy + h);
        const sw = w * pxPerUnit;
        const sh = h * pxPerUnit;
        if (prim.fillOpacity && prim.fillOpacity > 0) {
          ctx.save();
          ctx.fillStyle = fill;
          ctx.globalAlpha = alpha * prim.fillOpacity;
          ctx.fillRect(sx, sy, sw, sh);
          ctx.restore();
        }
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineW;
        ctx.strokeRect(sx, sy, sw, sh);
        if (prim.label) {
          ctx.fillStyle = theme.text;
          ctx.font = `600 ${prim.fontSize ?? 13}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(prim.label, sx + sw / 2, sy + sh / 2 + 5);
        }
        break;
      }
      case 'circle': {
        const wx = lerp(prim.x ?? 0, prim.toX ?? (prim.x ?? 0), animProg);
        const wy = lerp(prim.y ?? 0, prim.toY ?? (prim.y ?? 0), animProg);
        const r = lerp(prim.r ?? 1, prim.toR ?? (prim.r ?? 1), animProg);
        const sx = toSx(wx);
        const sy = toSy(wy);
        const sr = Math.max(1, r * pxPerUnit);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        if (prim.fillOpacity && prim.fillOpacity > 0) {
          ctx.save();
          ctx.fillStyle = fill;
          ctx.globalAlpha = alpha * prim.fillOpacity;
          ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineW;
        ctx.stroke();
        break;
      }
      case 'dot': {
        let wx = lerp(prim.x ?? 0, prim.toX ?? (prim.x ?? 0), animProg);
        let wy = lerp(prim.y ?? 0, prim.toY ?? (prim.y ?? 0), animProg);
        if (prim.expr && prim.exprY) {
          wx = compileMathExpr(prim.expr)({ t: timeSec, s: timeSec - start });
          wy = compileMathExpr(prim.exprY)({ t: timeSec, s: timeSec - start });
        }
        const sx = toSx(wx);
        const sy = toSy(wy);
        const rPx = Math.max(3, (prim.r ?? 0.12) * pxPerUnit);
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(sx, sy, rPx, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = theme.bg;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }
      case 'point_cloud': {
        const count = Math.min(350, prim.particleCount ?? 140);
        const mode = prim.cloudMode || 'bimodal_sde';
        const localT = Math.max(0, timeSec - start);
        for (let i = 0; i < count; i++) {
          const u1 = seededRandom(i * 3 + 1);
          const u2 = seededRandom(i * 3 + 2);
          const z = Math.sqrt(-2 * Math.log(Math.max(1e-5, u1))) * Math.cos(2 * Math.PI * u2);
          let wx = 0;
          let wy = 0;
          let col = theme.primary;
          if (mode === 'bimodal_sde') {
            const sign = i % 2 === 0 ? 1 : -1;
            const cycle = Math.sin(localT * 0.45) * 0.5 + 0.5;
            const mu = lerp(2.35, 0.25, cycle);
            const sigma = lerp(0.28, 1.35, cycle);
            wx = sign * mu + z * sigma;
            wy = (seededRandom(i * 7 + 5) - 0.5) * 2.2;
            col = sign > 0 ? theme.primary : theme.secondary;
          }
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(toSx(wx), toSy(wy), 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'surface_3d': {
        const mode = prim.surfaceMode || 'torus';
        const yaw = 0.55 + timeSec * (prim.orbitT ?? 0.42);
        const pitch = 0.58;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const ox = prim.x ?? 0;
        const oy = prim.y ?? 0;
        const scale3d = (prim.r ?? 1.45) * pxPerUnit;

        const proj = (x: number, y: number, z: number) => {
          const x1 = x * cosY - y * sinY;
          const y1 = x * sinY + y * cosY;
          const z2 = z * cosP - y1 * sinP;
          const y2 = z * sinP + y1 * cosP;
          const persp = 4.5 / (4.5 - y2 * 0.35);
          return {
            sx: toSx(ox) + x1 * scale3d * persp,
            sy: toSy(oy) - z2 * scale3d * persp,
            depth: y2,
            zWorld: z,
          };
        };

        const sliceH = prim.slicePlaneZ ? compileMathExpr(prim.slicePlaneZ)({ t: timeSec }) : null;

        if (mode === 'torus') {
          const R = 1.15;
          const r = 0.46;
          const uSteps = 30;
          const vSteps = 16;
          const quads: Array<{ pts: Array<{ sx: number; sy: number }>; depth: number; below: boolean }> = [];
          for (let i = 0; i < uSteps; i++) {
            const u0 = (i / uSteps) * Math.PI * 2;
            const u1 = ((i + 1) / uSteps) * Math.PI * 2;
            for (let j = 0; j < vSteps; j++) {
              const v0 = (j / vSteps) * Math.PI * 2;
              const v1 = ((j + 1) / vSteps) * Math.PI * 2;
              const tPt = (u: number, v: number) => {
                const px = (R + r * Math.cos(v)) * Math.cos(u);
                const py = r * Math.sin(v);
                const pz = (R + r * Math.cos(v)) * Math.sin(u);
                return proj(px, py, pz);
              };
              const p00 = tPt(u0, v0);
              const p10 = tPt(u1, v0);
              const p11 = tPt(u1, v1);
              const p01 = tPt(u0, v1);
              const avgZ = (p00.zWorld + p10.zWorld + p11.zWorld + p01.zWorld) / 4;
              const avgD = (p00.depth + p10.depth + p11.depth + p01.depth) / 4;
              quads.push({ pts: [p00, p10, p11, p01], depth: avgD, below: sliceH !== null ? avgZ <= sliceH : true });
            }
          }
          quads.sort((a, b) => a.depth - b.depth);
          for (const q of quads) {
            ctx.beginPath();
            ctx.moveTo(q.pts[0].sx, q.pts[0].sy);
            ctx.lineTo(q.pts[1].sx, q.pts[1].sy);
            ctx.lineTo(q.pts[2].sx, q.pts[2].sy);
            ctx.lineTo(q.pts[3].sx, q.pts[3].sy);
            ctx.closePath();
            ctx.fillStyle = q.below ? theme.primary : 'rgba(148,163,184,0.12)';
            ctx.save();
            ctx.globalAlpha = q.below ? alpha * 0.45 : alpha * 0.16;
            ctx.fill();
            ctx.restore();
            ctx.strokeStyle = q.below ? theme.primary : theme.muted;
            ctx.lineWidth = q.below ? 0.9 : 0.45;
            ctx.stroke();
          }
        }
        break;
      }
    }
    ctx.restore();
  }
}

/* =========================================================================
   4. OPENAI CLIENT WITH 16K CONTEXT & SETTINGS
   ========================================================================= */

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter (Free & 300+ Models)',
    badge: 'FREE MODELS',
    baseUrl: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs/quickstart',
    keyUrl: 'https://openrouter.ai/settings/keys',
    freeTierNotes: 'Public /models catalog works before key! Filter ":free" for $0 models (Llama 3.3, DeepSeek R1, Qwen, Mistral).',
    requiresKeyForModels: false,
    defaultHeaders: {
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://manimcat.web',
      'X-Title': 'ManimCat Web Studio',
    },
    suggestedModel: 'meta-llama/llama-3.3-70b-instruct:free',
  },
  {
    id: 'mistral',
    name: 'Mistral AI (Free Tier)',
    badge: 'FREE TIER',
    baseUrl: 'https://api.mistral.ai/v1',
    docsUrl: 'https://docs.mistral.ai/getting-started/models/',
    keyUrl: 'https://console.mistral.ai/api-keys/',
    freeTierNotes: 'Free plan available. Lists mistral-small-latest, codestral-latest, pixtral, and more.',
    requiresKeyForModels: true,
    suggestedModel: 'mistral-small-latest',
  },
  {
    id: 'groq',
    name: 'Groq Cloud (Fast LPU)',
    badge: 'FREE TIER',
    baseUrl: 'https://api.groq.com/openai/v1',
    docsUrl: 'https://console.groq.com/docs/openai',
    keyUrl: 'https://console.groq.com/keys',
    freeTierNotes: 'Free developer tier with ultra-fast LPU inference for Llama and DeepSeek models.',
    requiresKeyForModels: true,
    suggestedModel: 'llama-3.3-70b-versatile',
  },
  {
    id: 'gemini',
    name: 'Google Gemini (OpenAI-Compat)',
    badge: 'FREE TIER',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/openai',
    keyUrl: 'https://aistudio.google.com/apikey',
    freeTierNotes: 'Google AI Studio free tier via OpenAI-compatible endpoint.',
    requiresKeyForModels: true,
    suggestedModel: 'gemini-2.5-flash',
  },
  {
    id: 'ollama',
    name: 'Local Ollama (Private)',
    badge: 'LOCAL FREE',
    baseUrl: 'http://localhost:11434/v1',
    docsUrl: 'https://github.com/ollama/ollama/blob/main/docs/openai.md',
    keyUrl: 'https://ollama.com/download',
    freeTierNotes: 'Runs locally for free. Start with OLLAMA_ORIGINS="*" if hosting this app on HTTPS.',
    requiresKeyForModels: false,
    suggestedModel: 'qwen2.5:7b',
  },
  {
    id: 'custom',
    name: 'Custom OpenAI-Compatible',
    badge: 'CUSTOM URL',
    baseUrl: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    keyUrl: '',
    freeTierNotes: 'Works with vLLM, LiteLLM, LM Studio, Together, DeepSeek, or Cloudflare Workers.',
    requiresKeyForModels: true,
    suggestedModel: '',
  },
];

export function normalizeBaseUrl(rawUrl: string, exactUrl = false): string {
  let clean = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!clean) return '';
  clean = clean.replace(/\/chat\/completions$/i, '').replace(/\/models$/i, '').replace(/\/+$/, '');
  if (exactUrl) return clean;
  if (/\/v\d+([a-z0-9_-]*)?(\/openai)?$/i.test(clean) || /\/openai$/i.test(clean)) return clean;
  return `${clean}/v1`;
}

function buildHeaders(profile: EndpointProfile): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (profile.apiKey && profile.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${profile.apiKey.trim()}`;
  }
  const preset = PROVIDER_PRESETS.find((p) => p.id === profile.presetId);
  if (preset?.defaultHeaders) Object.assign(headers, preset.defaultHeaders);
  if (profile.customHeaders) {
    for (const [k, v] of Object.entries(profile.customHeaders)) {
      if (k.trim() && v.trim()) headers[k.trim()] = v.trim();
    }
  }
  return headers;
}

export async function fetchAvailableModels(profile: EndpointProfile): Promise<{
  models: DiscoveredModel[];
  resolvedUrl: string;
}> {
  const baseUrl = normalizeBaseUrl(profile.baseUrl, profile.exactUrl);
  if (!baseUrl) throw new Error('Please enter an API Endpoint Base URL first.');
  const resolvedUrl = `${baseUrl}/models`;
  const headers = buildHeaders(profile);
  delete headers['Content-Type'];

  const response = await fetch(resolvedUrl, { method: 'GET', headers });
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.text()).slice(0, 260);
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${response.status} from ${resolvedUrl}${detail ? `: ${detail}` : ''}`);
  }

  const payload = await response.json();
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.models)
        ? payload.models
        : [];

  const models: DiscoveredModel[] = rawList
    .map((item: Record<string, unknown>): DiscoveredModel | null => {
      const id = String(item.id || item.name || item.model || '').trim();
      if (!id) return null;
      const name = String(item.name || item.display_name || id);
      const isFree =
        id.endsWith(':free') ||
        (/mistral\.ai|groq\.com|generativelanguage\.googleapis\.com/.test(baseUrl) && !/openrouter/.test(baseUrl));
      return {
        id,
        name,
        ownedBy: item.owned_by ? String(item.owned_by) : undefined,
        contextLength: Number(item.context_length || 0) || undefined,
        isFree,
        supportsVision: /vision|pixtral|gpt-4o|gemini|claude|llava|qwen.*vl/i.test(id),
        supportsReasoning: /deepseek-r1|qwq|magistral|reasoning|think|o1|o3/i.test(id),
      };
    })
    .filter((m): m is DiscoveredModel => m !== null);

  models.sort((a, b) => (b.isFree ? 1 : 0) - (a.isFree ? 1 : 0) || a.id.localeCompare(b.id));
  return { models, resolvedUrl };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

export async function runChatCompletion(
  profile: EndpointProfile,
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    onToken?: (text: string, reasoning: string) => void;
  }
) {
  const baseUrl = normalizeBaseUrl(profile.baseUrl, profile.exactUrl);
  if (!baseUrl) throw new Error('API Endpoint URL missing.');
  if (!profile.selectedModel?.trim()) throw new Error('No model selected.');

  const url = `${baseUrl}/chat/completions`;
  const headers = buildHeaders(profile);
  const start = performance.now();

  const bodyObj: Record<string, unknown> = {
    model: profile.selectedModel.trim(),
    messages,
    temperature: options?.temperature ?? profile.temperature ?? 0.35,
    max_tokens: options?.maxTokens ?? profile.maxTokens ?? 16384,
    stream: options?.stream ?? profile.stream ?? true,
  };
  if (options?.topP !== undefined || profile.topP !== undefined) {
    bodyObj.top_p = options?.topP ?? profile.topP;
  }

  let response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(bodyObj) });
  if (!response.ok && bodyObj.stream === true && (response.status === 400 || response.status === 422)) {
    bodyObj.stream = false;
    response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(bodyObj) });
  }

  if (!response.ok) {
    let err = '';
    try {
      err = (await response.text()).slice(0, 350);
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${response.status} from ${url}: ${err}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (bodyObj.stream && contentType.includes('text/event-stream') && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accContent = '';
    let accReasoning = '';
    let resolvedModel = profile.selectedModel;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || !line.startsWith('data:')) continue;
        const dataStr = line.slice(5).trim();
        if (dataStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.model) resolvedModel = String(parsed.model);
          const delta = parsed.choices?.[0]?.delta;
          if (delta) {
            if (typeof delta.reasoning_content === 'string') accReasoning += delta.reasoning_content;
            else if (typeof delta.reasoning === 'string') accReasoning += delta.reasoning;
            if (typeof delta.content === 'string') accContent += delta.content;
            options?.onToken?.(accContent, accReasoning);
          }
        } catch {
          // ignore chunk
        }
      }
    }
    return {
      content: accContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim(),
      reasoningTrace: accReasoning,
      model: resolvedModel,
      latencyMs: Math.round(performance.now() - start),
    };
  }

  const data = await response.json();
  const msg = data?.choices?.[0]?.message;
  const rawContent = typeof msg?.content === 'string' ? msg.content : '';
  const rawReasoning = String(msg?.reasoning_content || msg?.reasoning || '');
  return {
    content: rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim(),
    reasoningTrace: rawReasoning,
    model: String(data?.model || profile.selectedModel),
    latencyMs: Math.round(performance.now() - start),
  };
}

export async function pingEndpointModel(profile: EndpointProfile) {
  const res = await runChatCompletion(
    profile,
    [{ role: 'user', content: 'Reply with strictly: READY' }],
    { temperature: 0, maxTokens: 32, stream: false }
  );
  return { ok: true, reply: res.content || 'READY', latencyMs: res.latencyMs, resolvedModel: res.model };
}

/* =========================================================================
   5. SYSTEM PROMPTS, SCHEMAS & GENERATORS
   ========================================================================= */

export const DEFAULT_LESSON_PLAN_SYSTEM_PROMPT = `You are ManimCat's Math Lesson Concept Designer.
Return ONLY valid JSON:
{
  "title": "Concise title",
  "coreQuestion": "The central question answered",
  "keyInsight": "The intuitive geometric aha moment",
  "targetAudience": "Learner level",
  "formulas": ["LaTeX formula 1 without $ delimiters", "LaTeX formula 2"],
  "beats": [{ "timeRange": "0s – 4s", "heading": "Heading", "visualAction": "Action" }],
  "durationSec": 14
}`;

export const DEFAULT_DUAL_SCENE_SYSTEM_PROMPT = `You are ManimCat Studio — expert dual-engine mathematical visualization generator.
Return ONLY valid JSON (no markdown outside JSON):
{
  "plan": { "title": "...", "coreQuestion": "...", "keyInsight": "...", "targetAudience": "...", "formulas": ["LaTeX..."], "beats": [{ "timeRange": "0s - 5s", "heading": "...", "visualAction": "..." }], "durationSec": 14 },
  "manimCode": "Complete runnable Python script using 'from manim import *'",
  "matplotlibCode": "Optional Python matplotlib script",
  "visualSpec": {
    "worldBounds": { "xMin": -6, "xMax": 6, "yMin": -3.5, "yMax": 3.5 },
    "duration": 14,
    "primitives": [
      { "id": "g", "type": "grid", "r": 1, "startTime": 0 },
      { "id": "ax", "type": "axes", "startTime": 0 },
      { "id": "f", "type": "function_plot", "expr": "sin(x + t*0.8)", "domain": [-6, 6], "fillUnder": true, "startTime": 0.4 }
    ],
    "formulas": [{ "id": "f1", "title": "Formula", "latex": "\\\\int_0^3 x^2 dx = 9", "startTime": 0, "endTime": 14 }],
    "captions": [{ "startTime": 0, "endTime": 5, "text": "Spoken teaching caption..." }]
  }
}`;

export const DEFAULT_STAGE_PROMPTS: Record<AgentStageId, string> = {
  intent: `Stage 1 — Intent & Prerequisite Architect:\nIdentify learner goal, core question, and prerequisites for: "{{topic}}".`,
  cartographer: `Stage 2 — Knowledge Cartographer:\nMap geometric objects and spaces connecting prerequisites to theorem for: "{{topic}}".\nContext:\n{{prior_intent}}`,
  dossier: `Stage 3 — Mathematical Dossier & Verification:\nProvide exact formulas, parametrizations, and sanity checks for: "{{topic}}".\nContext:\n{{prior_cartographer_or_intent}}`,
  storyboard: `Stage 4 — Visual Director & Storyboard:\nDesign timed camera shots (0s..16s) and LaTeX overlays for "{{topic}}".\nContext:\n{{prior_dossier}}`,
  composer: `Stage 5 — Dual Scene Composer:\nOutput complete Manim Python code and a VisualSceneSpec JSON block with primitives/formulas/captions.\nContext:\n{{prior_storyboard}}`,
  auditor: `Stage 6 — Mathematical Auditor:\nAudit generated visual against mathematical accuracy, LaTeX readability, and pacing.`,
};

function extractJson<T = Record<string, unknown>>(raw: string): T {
  const cleaned = raw.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const target = fence ? fence[1].trim() : cleaned;
  try {
    return JSON.parse(target) as T;
  } catch {
    const s = target.indexOf('{');
    const e = target.lastIndexOf('}');
    if (s !== -1 && e > s) return JSON.parse(target.slice(s, e + 1)) as T;
    throw new Error('Response did not contain valid JSON.');
  }
}

export async function generateLessonPlan(
  profile: EndpointProfile,
  prompt: string,
  sketchUrl?: string | null,
  onStream?: (text: string, reas: string) => void
) {
  const sys = profile.customLessonPlanSystemPrompt?.trim() || profile.customSystemPrompt?.trim() || DEFAULT_LESSON_PLAN_SYSTEM_PROMPT;
  const userContent = sketchUrl
    ? [{ type: 'text' as const, text: `Lesson plan for:\n${prompt}` }, { type: 'image_url' as const, image_url: { url: sketchUrl } }]
    : `Lesson plan for:\n${prompt}`;

  const res = await runChatCompletion(
    profile,
    [{ role: 'system', content: sys }, { role: 'user', content: userContent }],
    { temperature: profile.temperature, maxTokens: profile.maxTokens, topP: profile.topP, onToken: onStream }
  );

  const parsed = extractJson<Partial<LessonPlan>>(res.content);
  const plan: LessonPlan = {
    title: parsed.title || 'Mathematical Visualization',
    coreQuestion: parsed.coreQuestion || prompt,
    keyInsight: parsed.keyInsight || 'Visual breakdown.',
    targetAudience: parsed.targetAudience || 'Students',
    formulas: Array.isArray(parsed.formulas) ? parsed.formulas.map(String) : [],
    beats: Array.isArray(parsed.beats) ? parsed.beats : [],
    durationSec: Number(parsed.durationSec) > 3 ? Number(parsed.durationSec) : 14,
  };
  return { plan, reasoningTrace: res.reasoningTrace, latencyMs: res.latencyMs };
}

export async function generateDualScene(
  profile: EndpointProfile,
  prompt: string,
  palette: PalettePreset,
  plan?: LessonPlan | null,
  sketchUrl?: string | null,
  onStream?: (text: string, reas: string) => void
): Promise<GeneratedBundle> {
  const sys = profile.customDualSceneSystemPrompt?.trim() || profile.customSystemPrompt?.trim() || DEFAULT_DUAL_SCENE_SYSTEM_PROMPT;
  const userText = plan
    ? `Topic: ${prompt}\n\nApproved Plan:\n${JSON.stringify(plan, null, 2)}\n\nPalette: ${palette}`
    : `Topic: ${prompt}\nPalette: ${palette}`;

  const userContent = sketchUrl
    ? [{ type: 'text' as const, text: `${userText}\n(Incorporate attached sketch)` }, { type: 'image_url' as const, image_url: { url: sketchUrl } }]
    : userText;

  const res = await runChatCompletion(
    profile,
    [{ role: 'system', content: sys }, { role: 'user', content: userContent }],
    { temperature: profile.temperature, maxTokens: profile.maxTokens, topP: profile.topP, onToken: onStream }
  );

  const parsed = extractJson<{
    plan?: Partial<LessonPlan>;
    manimCode?: string;
    matplotlibCode?: string;
    visualSpec?: Partial<VisualSceneSpec>;
  }>(res.content);

  const finalPlan: LessonPlan = {
    title: parsed.plan?.title || plan?.title || 'Visual Math Theorem',
    coreQuestion: parsed.plan?.coreQuestion || plan?.coreQuestion || prompt,
    keyInsight: parsed.plan?.keyInsight || plan?.keyInsight || 'Visual insight.',
    targetAudience: parsed.plan?.targetAudience || 'Students',
    formulas: Array.isArray(parsed.plan?.formulas) ? parsed.plan.formulas : plan?.formulas || [],
    beats: Array.isArray(parsed.plan?.beats) ? parsed.plan.beats : plan?.beats || [],
    durationSec: Number(parsed.plan?.durationSec || 14),
  };

  const finalSpec: VisualSceneSpec = {
    id: `scene-${Date.now()}`,
    title: parsed.visualSpec?.title || finalPlan.title,
    palette: parsed.visualSpec?.palette || palette,
    duration: parsed.visualSpec?.duration || 14,
    worldBounds: parsed.visualSpec?.worldBounds || { xMin: -6, xMax: 6, yMin: -3.5, yMax: 3.5 },
    primitives: Array.isArray(parsed.visualSpec?.primitives) && parsed.visualSpec.primitives.length > 0
      ? parsed.visualSpec.primitives
      : [{ id: 'g', type: 'grid', r: 1, startTime: 0 }, { id: 'ax', type: 'axes', startTime: 0 }],
    formulas: Array.isArray(parsed.visualSpec?.formulas) ? parsed.visualSpec.formulas : [],
    captions: Array.isArray(parsed.visualSpec?.captions) ? parsed.visualSpec.captions : [],
  };

  return {
    id: `gen-${Date.now()}`,
    prompt,
    createdAt: Date.now(),
    modelUsed: res.model,
    endpointUsed: profile.baseUrl,
    latencyMs: res.latencyMs,
    reasoningTrace: res.reasoningTrace,
    plan: finalPlan,
    manimCode: parsed.manimCode || `from manim import *\nclass Scene1(Scene):\n    def construct(self):\n        pass`,
    matplotlibCode: parsed.matplotlibCode,
    visualSpec: finalSpec,
    rawResponse: res.content,
  };
}

/* =========================================================================
   6. BUILT-IN DEMO PRESETS
   ========================================================================= */

export const PROMPT_STARTERS = [
  {
    label: 'Geometric Series 1/4 + 1/16 + … = 1/3',
    prompt:
      'Prove that 1/4 + 1/16 + 1/64 + ... = 1/3 using a geometric square subdivision, slow zoom, creamy macaron palette, and step-by-step equations.',
  },
  {
    label: 'Score SDE → Probability Flow ODE',
    prompt:
      'Visualize Continuous-Time Score SDEs, the Score Vector Field, and the Probability Flow ODE converging bimodal Gaussian modes.',
  },
  {
    label: 'Kepler Hodograph Great Circle Sphere',
    prompt:
      'Show why every Kepler orbit has a circular velocity hodograph lifted onto a sphere as great circles.',
  },
  {
    label: 'Morse Theory on Upright Torus',
    prompt:
      'Animate Morse Theory on an upright torus sliced by a rising height plane M_a = {p in T^2 : h(p) <= a}.',
  },
];

export const BUILTIN_DEMO_BUNDLES: GeneratedBundle[] = [
  {
    id: 'demo-geometric-series',
    prompt: 'Prove 1/4 + 1/16 + ... = 1/3 using geometric square subdivision.',
    createdAt: 1738000000000,
    modelUsed: 'Built-in Showcase',
    endpointUsed: 'Offline Ready',
    plan: {
      title: 'Geometric Series Proof: 1/4 + 1/16 + 1/64 + … = 1/3',
      coreQuestion: 'Why does adding quarters of quarters forever converge to exactly 1/3?',
      keyInsight: 'At every recursive step, 1 quarter is coral, 2 quarters are companions, and 1 quarter is subdivided.',
      targetAudience: 'Undergraduate calculus learners',
      formulas: ['S = \\frac{1}{4} + \\frac{1}{16} + \\frac{1}{64} + \\cdots = \\frac{1}{3}'],
      beats: [{ timeRange: '0s - 14s', heading: 'Infinite Quadtree', visualAction: 'Subdivide square recursively.' }],
      durationSec: 14,
    },
    manimCode: `from manim import *\nclass GeomSeries(Scene):\n    def construct(self):\n        title = MathTex(r"\\sum_{n=1}^\\infty \\frac{1}{4^n} = \\frac{1}{3}").to_edge(UP)\n        self.play(Write(title))`,
    visualSpec: {
      id: 'spec-geom',
      title: 'Geometric Series (= 1/3)',
      palette: 'macaron',
      duration: 14,
      worldBounds: { xMin: -3.5, xMax: 3.5, yMin: -2.4, yMax: 2.4 },
      primitives: [
        { id: 'grid', type: 'grid', r: 1, startTime: 0 },
        { id: 'outer', type: 'rect', x: -2, y: -2, w: 4, h: 4, color: '#455A64', strokeWidth: 2.5, startTime: 0.2 },
        { id: 'l1-c', type: 'rect', x: -2, y: -2, w: 2, h: 2, color: '#455A64', fillColor: '#E76F51', fillOpacity: 0.72, label: '1/4', startTime: 1.2 },
        { id: 'l1-m', type: 'rect', x: 0, y: -2, w: 2, h: 2, color: '#455A64', fillColor: '#2A9D8F', fillOpacity: 0.6, label: '1/4', startTime: 2.0 },
        { id: 'l1-b', type: 'rect', x: -2, y: 0, w: 2, h: 2, color: '#455A64', fillColor: '#E9C46A', fillOpacity: 0.65, label: '1/4', startTime: 2.6 },
        { id: 'l2-c', type: 'rect', x: 0, y: 0, w: 1, h: 1, color: '#455A64', fillColor: '#E76F51', fillOpacity: 0.78, label: '1/16', startTime: 4.5 },
        { id: 'l2-m', type: 'rect', x: 1, y: 0, w: 1, h: 1, color: '#455A64', fillColor: '#2A9D8F', fillOpacity: 0.62, startTime: 5.2 },
        { id: 'l2-b', type: 'rect', x: 0, y: 1, w: 1, h: 1, color: '#455A64', fillColor: '#E9C46A', fillOpacity: 0.68, startTime: 5.8 },
      ],
      formulas: [
        { id: 'f1', title: 'Infinite Series', latex: 'S = \\sum_{n=1}^\\infty \\left(\\frac{1}{4}\\right)^n = \\frac{1}{3}', startTime: 0, endTime: 14 },
      ],
      captions: [
        { startTime: 0, endTime: 7, text: 'Each quadrant represents 1/4. Repeating infinitely preserves the 1:1:1 three-color balance.' },
        { startTime: 7, endTime: 14, text: 'Because the remaining empty corner vanishes, the coral series sums to exactly 1/3.' },
      ],
    },
  },
];

/* =========================================================================
   7. SUBCOMPONENTS (MATH, 2048, SCENE PLAYER, MODAL, WORKSPACES)
   ========================================================================= */

export const MathText: React.FC<{ latex: string; className?: string }> = ({ latex, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString((latex || '').replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, ''), {
        throwOnError: false,
      });
    } catch {
      return '';
    }
  }, [latex]);
  if (!html) return <span className={`font-mono text-xs ${className}`}>{latex}</span>;
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

export const MiniGame2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(() => {
    const b = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    b[0][0] = 2;
    b[1][1] = 4;
    return b;
  });
  const [score, setScore] = useState(0);

  const slide = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    setBoard((prev) => {
      let b = prev.map((r) => [...r]);
      const rotate = (m: number[][]) => m[0].map((_, i) => m.map((row) => row[i]).reverse());
      const rot = dir === 'left' ? 0 : dir === 'down' ? 1 : dir === 'right' ? 2 : 3;
      for (let i = 0; i < rot; i++) b = rotate(b);

      let gain = 0;
      b = b.map((row) => {
        const filtered = row.filter((x) => x !== 0);
        const res: number[] = [];
        for (let i = 0; i < filtered.length; i++) {
          if (filtered[i] === filtered[i + 1]) {
            res.push(filtered[i] * 2);
            gain += filtered[i] * 2;
            i++;
          } else res.push(filtered[i]);
        }
        while (res.length < 4) res.push(0);
        return res;
      });

      for (let i = 0; i < (4 - rot) % 4; i++) b = rotate(b);
      setScore((s) => s + gain);
      const empties: Array<[number, number]> = [];
      b.forEach((r, ri) => r.forEach((c, ci) => { if (c === 0) empties.push([ri, ci]); }));
      if (empties.length > 0) {
        const [er, ec] = empties[Math.floor(Math.random() * empties.length)];
        b[er][ec] = Math.random() < 0.9 ? 2 : 4;
      }
      return b;
    });
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-3.5 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span>2048 Break · Score: {score}</span>
        <button
          onClick={() => {
            const b = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
            b[0][1] = 2;
            setBoard(b);
            setScore(0);
          }}
          className="rounded p-1 hover:bg-[var(--studio-surface-2)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-[var(--studio-border)] p-1.5">
        {board.flat().map((v, i) => (
          <div
            key={i}
            className={`flex h-10 items-center justify-center rounded font-mono text-xs font-bold ${
              v === 0 ? 'bg-[var(--studio-surface-2)] text-transparent' : 'bg-amber-500 text-white'
            }`}
          >
            {v > 0 ? v : ''}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        <button onClick={() => slide('left')} className="rounded border border-[var(--studio-border)] p-1.5"><ArrowLeft className="h-3 w-3" /></button>
        <button onClick={() => slide('up')} className="rounded border border-[var(--studio-border)] p-1.5"><ArrowUp className="h-3 w-3" /></button>
        <button onClick={() => slide('down')} className="rounded border border-[var(--studio-border)] p-1.5"><ArrowDown className="h-3 w-3" /></button>
        <button onClick={() => slide('right')} className="rounded border border-[var(--studio-border)] p-1.5"><ArrowRight className="h-3 w-3" /></button>
      </div>
    </div>
  );
};

export const ScenePlayer: React.FC<{
  bundle: GeneratedBundle;
  onPaletteChange?: (palette: PalettePreset) => void;
}> = ({ bundle, onPaletteChange }) => {
  const [playing, setPlaying] = useState(true);
  const [timeSec, setTimeSec] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTs = useRef<number | null>(null);

  const spec = bundle.visualSpec;
  const duration = spec.duration || 14;

  useEffect(() => {
    setTimeSec(0);
    setPlaying(true);
  }, [bundle.id]);

  useEffect(() => {
    if (!playing || activeTab !== 'preview') {
      lastTs.current = null;
      return;
    }
    let raf = 0;
    const loop = (ts: number) => {
      if (lastTs.current !== null) {
        const dt = ((ts - lastTs.current) / 1000) * speed;
        setTimeSec((t) => (t + dt >= duration ? 0 : t + dt));
      }
      lastTs.current = ts;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, duration, activeTab]);

  useEffect(() => {
    if (activeTab !== 'preview') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderVisualScene(ctx, canvas.width, canvas.height, spec, timeSec);
  }, [spec, timeSec, activeTab]);

  const activeFormulas = (spec.formulas || []).filter((f) => timeSec >= f.startTime && timeSec <= f.endTime);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-4 py-2">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] p-0.5">
          <button
            onClick={() => setActiveTab('preview')}
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              activeTab === 'preview' ? 'bg-[var(--studio-accent)] text-white' : 'text-[var(--studio-muted)]'
            }`}
          >
            Live Animation
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              activeTab === 'code' ? 'bg-[var(--studio-accent)] text-white' : 'text-[var(--studio-muted)]'
            }`}
          >
            Manim Python
          </button>
        </div>
        {onPaletteChange && (
          <select
            value={spec.palette}
            onChange={(e) => onPaletteChange(e.target.value as PalettePreset)}
            className="rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] px-2 py-1 text-xs"
          >
            <option value="macaron">Macaron</option>
            <option value="3b1b">3Blue1Brown</option>
            <option value="bone">Bone</option>
            <option value="obsidian">Obsidian</option>
          </select>
        )}
      </div>

      {activeTab === 'preview' ? (
        <div className="relative aspect-[16/9] w-full bg-slate-950">
          <canvas ref={canvasRef} width={1280} height={720} className="h-full w-full" />
          {activeFormulas.length > 0 && (
            <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-2">
              {activeFormulas.map((f) => (
                <div key={f.id} className="rounded-xl border border-white/10 bg-slate-900/80 p-2.5 text-white backdrop-blur-md">
                  <MathText latex={f.latex} />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 border-t border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-4 py-2">
            <button
              onClick={() => setPlaying(!playing)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--studio-accent)] text-white"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.05}
              value={timeSec}
              onChange={(e) => {
                setTimeSec(Number(e.target.value));
                setPlaying(false);
              }}
              className="flex-1 accent-[var(--studio-accent)]"
            />
            <span className="font-mono text-xs text-[var(--studio-muted)]">
              {timeSec.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>
        </div>
      ) : (
        <pre className="max-h-[460px] overflow-auto rounded-b-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
          <code>{bundle.manimCode}</code>
        </pre>
      )}
    </div>
  );
};

/* =========================================================================
   8. ENDPOINT & SETTINGS CONFIGURATOR MODAL (16K TOKENS, PROMPTS, TEMP)
   ========================================================================= */

export const EndpointModal: React.FC<{
  open: boolean;
  onClose: () => void;
  profiles: EndpointProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: EndpointProfile) => void;
  onAddProfile: (profile: EndpointProfile) => void;
  onDeleteProfile: (id: string) => void;
  discoveredModelsByProfile: Record<string, DiscoveredModel[]>;
  onSaveDiscoveredModels: (profileId: string, models: DiscoveredModel[]) => void;
}> = ({
  open,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  discoveredModelsByProfile,
  onSaveDiscoveredModels,
}) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const [showKey, setShowKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [systemPromptTab, setSystemPromptTab] = useState<'universal' | 'dualScene' | 'lessonPlan'>('universal');
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'vision'>('all');
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const models = discoveredModelsByProfile[activeProfile?.id || ''] || [];
  const filteredModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return models.filter((m) => {
      if (filter === 'free' && !m.isFree) return false;
      if (filter === 'vision' && !m.supportsVision) return false;
      if (!q) return true;
      return m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
    });
  }, [models, search, filter]);

  if (!open || !activeProfile) return null;

  const handleFetch = async () => {
    setFetchingModels(true);
    setFetchError(null);
    try {
      const { models: resModels, resolvedUrl: url } = await fetchAvailableModels(activeProfile);
      setResolvedUrl(url);
      onSaveDiscoveredModels(activeProfile.id, resModels);
      if (resModels.length > 0 && !resModels.some((m) => m.id === activeProfile.selectedModel)) {
        onUpdateProfile({ ...activeProfile, selectedModel: resModels[0].id });
      }
    } catch (e) {
      setFetchError((e as Error).message);
    } finally {
      setFetchingModels(false);
    }
  };

  const handlePing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await pingEndpointModel(activeProfile);
      setPingResult({ ok: true, msg: `Latency: ${res.latencyMs}ms (${res.resolvedModel})` });
    } catch (e) {
      setPingResult({ ok: false, msg: (e as Error).message });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Server className="h-5 w-5 text-[var(--studio-accent)]" />
            <div>
              <h2 className="text-sm font-bold sm:text-base">Universal Endpoint, Prompts &amp; 16k Token Config</h2>
              <p className="text-[11px] text-[var(--studio-muted)]">OpenAI-compatible BYOK: OpenRouter, Mistral, Groq, Ollama, Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12">
          {/* Left: Endpoint, Presets & Generation Settings */}
          <div className="space-y-4 border-b border-[var(--studio-border)] p-5 lg:col-span-5 lg:border-r lg:border-b-0">
            {/* Saved profiles */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span>Profiles</span>
                <button
                  onClick={() =>
                    onAddProfile({
                      id: `prof-${Date.now()}`,
                      name: 'Custom Endpoint',
                      presetId: 'custom',
                      baseUrl: 'https://openrouter.ai/api/v1',
                      apiKey: '',
                      selectedModel: 'meta-llama/llama-3.3-70b-instruct:free',
                      temperature: 0.35,
                      maxTokens: 16384,
                      topP: 1.0,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded border border-[var(--studio-border)] px-2 py-0.5 text-[10px]"
                >
                  <Plus className="h-3 w-3" /> New
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${
                      p.id === activeProfile.id
                        ? 'border-[var(--studio-accent)] bg-[var(--studio-accent)] text-white'
                        : 'border-[var(--studio-border)] bg-[var(--studio-surface-2)]'
                    }`}
                  >
                    <button onClick={() => onSelectProfile(p.id)} className="truncate max-w-[120px] font-medium">
                      {p.name}
                    </button>
                    {profiles.length > 1 && (
                      <button onClick={() => onDeleteProfile(p.id)} className="opacity-70 hover:opacity-100">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Provider quick presets */}
            <div>
              <span className="mb-1.5 block text-xs font-semibold">Presets</span>
              <div className="grid grid-cols-2 gap-1.5">
                {PROVIDER_PRESETS.map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() =>
                      onUpdateProfile({
                        ...activeProfile,
                        presetId: pr.id,
                        name: pr.name.split('(')[0].trim(),
                        baseUrl: pr.baseUrl,
                        selectedModel: pr.suggestedModel || activeProfile.selectedModel,
                      })
                    }
                    className={`rounded-xl border p-2 text-left text-xs ${
                      activeProfile.presetId === pr.id
                        ? 'border-[var(--studio-accent)] bg-[var(--studio-accent)]/10 font-bold'
                        : 'border-[var(--studio-border)]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{pr.name.split('(')[0]}</span>
                      <span className="text-[9px] text-emerald-600 font-bold">{pr.badge}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* URL & Key */}
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-semibold block mb-0.5">Base URL</label>
                <input
                  type="url"
                  value={activeProfile.baseUrl}
                  onChange={(e) => onUpdateProfile({ ...activeProfile, baseUrl: e.target.value })}
                  className="w-full rounded-lg border border-[var(--studio-border)] bg-transparent p-2 font-mono text-xs outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-0.5">API Key</label>
                <div className="flex gap-1.5">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={activeProfile.apiKey}
                    onChange={(e) => onUpdateProfile({ ...activeProfile, apiKey: e.target.value })}
                    className="flex-1 rounded-lg border border-[var(--studio-border)] bg-transparent p-2 font-mono text-xs outline-none"
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="rounded-lg border border-[var(--studio-border)] p-2"
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Generation Parameters: 16k context, Temp, Top-P */}
            <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-3 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Generation Settings</span>
                <span className="rounded bg-[var(--studio-accent)]/15 px-1.5 py-0.5 font-mono text-[10px] text-[var(--studio-accent)]">
                  Context: {activeProfile.maxTokens ?? 16384} tokens
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold">
                  <span>Max Tokens Limit</span>
                  <div className="flex gap-1">
                    {[2048, 4096, 8192, 16384].map((t) => (
                      <button
                        key={t}
                        onClick={() => onUpdateProfile({ ...activeProfile, maxTokens: t })}
                        className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                          (activeProfile.maxTokens ?? 16384) === t
                            ? 'bg-[var(--studio-accent)] text-white'
                            : 'border border-[var(--studio-border)] bg-[var(--studio-surface)]'
                        }`}
                      >
                        {t >= 1024 ? `${t / 1024}k` : t}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min={256}
                  max={32768}
                  step={256}
                  value={activeProfile.maxTokens ?? 16384}
                  onChange={(e) =>
                    onUpdateProfile({ ...activeProfile, maxTokens: Number(e.target.value) || 16384 })
                  }
                  className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] p-1.5 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="font-semibold block mb-0.5">Temperature: {activeProfile.temperature.toFixed(2)}</label>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={activeProfile.temperature}
                    onChange={(e) => onUpdateProfile({ ...activeProfile, temperature: Number(e.target.value) })}
                    className="w-full accent-[var(--studio-accent)]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-0.5">Top-P: {(activeProfile.topP ?? 1.0).toFixed(2)}</label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={activeProfile.topP ?? 1.0}
                    onChange={(e) => onUpdateProfile({ ...activeProfile, topP: Number(e.target.value) })}
                    className="w-full accent-[var(--studio-accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Custom System Prompt Section */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-[var(--studio-accent)] hover:underline"
              >
                {showAdvanced ? '▾ Hide' : '▸ Show'} Custom System Prompts
              </button>
              {showAdvanced && (
                <div className="mt-2 space-y-2 rounded-xl border border-[var(--studio-border)] p-2.5 bg-[var(--studio-surface-2)]">
                  <div className="flex gap-1 border-b border-[var(--studio-border)] pb-1.5 text-[10px] font-semibold">
                    <button
                      onClick={() => setSystemPromptTab('universal')}
                      className={`px-2 py-0.5 rounded ${systemPromptTab === 'universal' ? 'bg-[var(--studio-accent)] text-white' : ''}`}
                    >
                      Universal
                    </button>
                    <button
                      onClick={() => setSystemPromptTab('dualScene')}
                      className={`px-2 py-0.5 rounded ${systemPromptTab === 'dualScene' ? 'bg-[var(--studio-accent)] text-white' : ''}`}
                    >
                      Dual Scene
                    </button>
                    <button
                      onClick={() => setSystemPromptTab('lessonPlan')}
                      className={`px-2 py-0.5 rounded ${systemPromptTab === 'lessonPlan' ? 'bg-[var(--studio-accent)] text-white' : ''}`}
                    >
                      Lesson Plan
                    </button>
                  </div>
                  {systemPromptTab === 'universal' && (
                    <textarea
                      rows={4}
                      value={activeProfile.customSystemPrompt || ''}
                      onChange={(e) => onUpdateProfile({ ...activeProfile, customSystemPrompt: e.target.value })}
                      placeholder="Studio-wide custom system prompt..."
                      className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] p-2 font-mono text-[10px] outline-none"
                    />
                  )}
                  {systemPromptTab === 'dualScene' && (
                    <textarea
                      rows={4}
                      value={activeProfile.customDualSceneSystemPrompt || DEFAULT_DUAL_SCENE_SYSTEM_PROMPT}
                      onChange={(e) => onUpdateProfile({ ...activeProfile, customDualSceneSystemPrompt: e.target.value })}
                      className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] p-2 font-mono text-[10px] outline-none"
                    />
                  )}
                  {systemPromptTab === 'lessonPlan' && (
                    <textarea
                      rows={4}
                      value={activeProfile.customLessonPlanSystemPrompt || DEFAULT_LESSON_PLAN_SYSTEM_PROMPT}
                      onChange={(e) => onUpdateProfile({ ...activeProfile, customLessonPlanSystemPrompt: e.target.value })}
                      className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] p-2 font-mono text-[10px] outline-none"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Discovered Models list */}
          <div className="flex flex-col p-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Models from Endpoint</h3>
                <p className="text-[11px] text-[var(--studio-muted)]">
                  {models.length > 0 ? `${models.length} models retrieved` : 'Query GET /models'}
                </p>
              </div>
              <button
                onClick={handleFetch}
                disabled={fetchingModels}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--studio-accent)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {fetchingModels ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Fetch Models
              </button>
            </div>

            {resolvedUrl && !fetchError && (
              <div className="mt-2 text-[10px] font-mono text-emerald-600">✓ Connected to {resolvedUrl}</div>
            )}
            {fetchError && (
              <div className="mt-2 rounded-lg bg-rose-500/10 p-2 text-xs text-rose-600">{fetchError}</div>
            )}

            {/* Model input & test */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={activeProfile.selectedModel}
                onChange={(e) => onUpdateProfile({ ...activeProfile, selectedModel: e.target.value })}
                className="flex-1 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2 font-mono text-xs outline-none"
                placeholder="Model ID"
              />
              <button
                onClick={handlePing}
                disabled={pinging}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--studio-border)] px-3 py-1.5 text-xs font-semibold"
              >
                {pinging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-amber-500" />}
                Ping
              </button>
            </div>
            {pingResult && (
              <p className={`mt-1 text-xs ${pingResult.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                {pingResult.msg}
              </p>
            )}

            {/* Search */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter models..."
                className="flex-1 rounded-lg border border-[var(--studio-border)] bg-transparent p-1.5 text-xs outline-none"
              />
              <button
                onClick={() => setFilter(filter === 'free' ? 'all' : 'free')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  filter === 'free' ? 'bg-[var(--studio-accent)] text-white' : 'border border-[var(--studio-border)]'
                }`}
              >
                Free Only
              </button>
            </div>

            {/* List */}
            <div className="mt-3 flex-1 overflow-y-auto max-h-[300px] divide-y divide-[var(--studio-border)] rounded-xl border border-[var(--studio-border)]">
              {filteredModels.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--studio-muted)]">No models listed yet.</div>
              ) : (
                filteredModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onUpdateProfile({ ...activeProfile, selectedModel: m.id })}
                    className={`flex w-full items-center justify-between p-2.5 text-left text-xs transition ${
                      m.id === activeProfile.selectedModel ? 'bg-[var(--studio-accent)]/15 font-bold' : 'hover:bg-[var(--studio-surface-2)]'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-mono text-xs">{m.id}</div>
                      {m.isFree && <span className="text-[9px] font-bold text-emerald-600">FREE</span>}
                    </div>
                    <span className="rounded border px-2 py-0.5 text-[10px]">
                      {m.id === activeProfile.selectedModel ? 'Active' : 'Select'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-5 py-2.5">
          <span className="font-mono text-xs text-[var(--studio-muted)]">
            {activeProfile.selectedModel} · {activeProfile.maxTokens ?? 16384} tokens (16k) · temp {activeProfile.temperature.toFixed(2)}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[var(--studio-accent)] px-4 py-1.5 text-xs font-semibold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   9. SKETCH PAD WORKSPACE
   ========================================================================= */

export const SketchCanvasWorkspace: React.FC<{
  onAttachSketchToWorkflow: (dataUrl: string) => void;
}> = ({ onAttachSketchToWorkflow }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'line' | 'rect' | 'circle'>('pen');
  const [color, setColor] = useState('#263238');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const startPt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FDFBF4';
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasRef.current!.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasRef.current!.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getPos(e);
    startPt.current = pt;
    setDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const pt = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && tool === 'pen') {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || !startPt.current) return;
    const pt = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPt.current.x, startPt.current.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startPt.current.x, startPt.current.y, pt.x - startPt.current.x, pt.y - startPt.current.y);
      } else if (tool === 'circle') {
        const r = Math.hypot(pt.x - startPt.current.x, pt.y - startPt.current.y);
        ctx.beginPath();
        ctx.arc(startPt.current.x, startPt.current.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    setDrawing(false);
    startPt.current = null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-3">
        <div className="flex gap-1.5">
          {(['pen', 'line', 'rect', 'circle'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${
                tool === t ? 'bg-[var(--studio-accent)] text-white' : 'border border-[var(--studio-border)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {['#263238', '#E76F51', '#2A9D8F', '#457B9D'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-5 w-5 rounded-full ${color === c ? 'ring-2 ring-slate-900' : ''}`}
            />
          ))}
          <input
            type="range"
            min={1}
            max={10}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20 accent-[var(--studio-accent)]"
          />
        </div>
        <button
          onClick={() => {
            const c = canvasRef.current;
            if (c) onAttachSketchToWorkflow(c.toDataURL('image/png'));
          }}
          className="rounded-xl bg-[var(--studio-accent)] px-3.5 py-1.5 text-xs font-semibold text-white"
        >
          Attach to Workflow Prompt
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[#FDFBF4]">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="aspect-[16/9] w-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};

/* =========================================================================
   10. PLOT STUDIO WORKSPACE
   ========================================================================= */

export const PlotStudioWorkspace: React.FC<{
  activeProfile: EndpointProfile;
  onOpenEndpointModal: () => void;
}> = ({ activeProfile, onOpenEndpointModal }) => {
  const [title, setTitle] = useState('Harmonic Oscillation Plot');
  const [layers, setLayers] = useState<PlotLayer[]>([
    { id: '1', kind: 'explicit', label: 'sin(a*x)', expr: 'sin(a*x)', color: '#E76F51', visible: true },
    { id: '2', kind: 'explicit', label: 'cos(x)', expr: 'cos(x)', color: '#2A9D8F', dashed: true, visible: true },
  ]);
  const [paramA, setParamA] = useState(2.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FDFBF4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pad = { l: 50, r: 30, t: 30, b: 40 };
    const pw = canvas.width - pad.l - pad.r;
    const ph = canvas.height - pad.t - pad.b;
    const xRange = [-6, 6];
    const yRange = [-2.5, 2.5];

    const toX = (x: number) => pad.l + ((x - xRange[0]) / (xRange[1] - xRange[0])) * pw;
    const toY = (y: number) => pad.t + (1 - (y - yRange[0]) / (yRange[1] - yRange[0])) * ph;

    // Grid & axes
    ctx.strokeStyle = 'rgba(71,85,105,0.15)';
    ctx.lineWidth = 1;
    for (let gx = -6; gx <= 6; gx += 2) {
      ctx.beginPath();
      ctx.moveTo(toX(gx), pad.t);
      ctx.lineTo(toX(gx), canvas.height - pad.b);
      ctx.stroke();
    }
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, toY(0));
    ctx.lineTo(canvas.width - pad.r, toY(0));
    ctx.stroke();

    for (const l of layers) {
      if (!l.visible) continue;
      const fn = compileMathExpr(l.expr);
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 2.5;
      if (l.dashed) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      for (let i = 0; i <= 300; i++) {
        const x = xRange[0] + ((xRange[1] - xRange[0]) * i) / 300;
        const y = fn({ x, a: paramA, t: 0 });
        if (i === 0) ctx.moveTo(toX(x), toY(y));
        else ctx.lineTo(toX(x), toY(y));
      }
      ctx.stroke();
    }
  }, [layers, paramA]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-4">
        <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Plot Parameters</span>
            <button onClick={onOpenEndpointModal} className="text-xs text-[var(--studio-accent)] hover:underline">
              {activeProfile.name}
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Parameter a = {paramA.toFixed(2)}</label>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.1}
              value={paramA}
              onChange={(e) => setParamA(Number(e.target.value))}
              className="w-full accent-[var(--studio-accent)]"
            />
          </div>
          <div className="space-y-2">
            {layers.map((l) => (
              <div key={l.id} className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2 text-xs">
                <input
                  type="text"
                  value={l.expr}
                  onChange={(e) => setLayers((prev) => prev.map((x) => (x.id === l.id ? { ...x, expr: e.target.value } : x)))}
                  className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] p-1 font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-3 shadow-sm xl:col-span-8">
        <canvas ref={canvasRef} width={900} height={500} className="w-full rounded-lg" />
      </div>
    </div>
  );
};

/* =========================================================================
   11. AGENT STUDIO WORKSPACE
   ========================================================================= */

export const AgentStudioWorkspace: React.FC<{
  activeProfile: EndpointProfile;
  onOpenEndpointModal: () => void;
  onSendBundleToWorkflow: (bundle: GeneratedBundle) => void;
}> = ({ activeProfile, onOpenEndpointModal, onSendBundleToWorkflow }) => {
  const [topic, setTopic] = useState('Prove that the square root of 2 is irrational using geometry.');
  const [stages, setStages] = useState<AgentStageState[]>([
    { id: 'intent', title: '01 · Intent', role: 'Prerequisite Architect', status: 'idle', content: '' },
    { id: 'cartographer', title: '02 · Cartographer', role: 'Geometric Mapping', status: 'idle', content: '' },
    { id: 'dossier', title: '03 · Dossier', role: 'Equations & Sanity', status: 'idle', content: '' },
    { id: 'storyboard', title: '04 · Storyboard', role: 'Camera & Shots', status: 'idle', content: '' },
    { id: 'composer', title: '05 · Composer', role: 'Manim & Web Spec', status: 'idle', content: '' },
    { id: 'auditor', title: '06 · Auditor', role: 'Integrity Check', status: 'idle', content: '' },
  ]);
  const [selectedId, setSelectedId] = useState<AgentStageId>('intent');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [running, setRunning] = useState(false);

  const selectedStage = stages.find((s) => s.id === selectedId) || stages[0];

  const runStage = async (id: AgentStageId) => {
    setSelectedId(id);
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'running', content: '' } : s)));
    try {
      const stageObj = stages.find((s) => s.id === id);
      let promptText = stageObj?.customPrompt || DEFAULT_STAGE_PROMPTS[id];
      promptText = promptText.replace(/\{\{topic\}\}/g, topic);
      const res = await runChatCompletion(
        activeProfile,
        [
          { role: 'system', content: activeProfile.customSystemPrompt || 'You are an expert Math-to-Manim specialist.' },
          { role: 'user', content: promptText },
        ],
        { temperature: activeProfile.temperature, maxTokens: activeProfile.maxTokens, topP: activeProfile.topP }
      );
      setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'done', content: res.content } : s)));
    } catch (e) {
      setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'error', error: (e as Error).message } : s)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[var(--studio-accent)]" />
            <div>
              <h2 className="text-sm font-bold">6-Stage Agent Pipeline (16k Tokens)</h2>
              <p className="text-[11px] text-[var(--studio-muted)]">
                {activeProfile.name} · {activeProfile.selectedModel} · {activeProfile.maxTokens ?? 16384} tokens max
              </p>
            </div>
          </div>
          <button onClick={onOpenEndpointModal} className="rounded-lg border border-[var(--studio-border)] px-3 py-1 text-xs">
            Endpoint Settings
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2 text-xs outline-none"
          />
          <button
            onClick={() => runStage(selectedId)}
            className="rounded-xl bg-[var(--studio-accent)] px-4 py-2 text-xs font-semibold text-white"
          >
            Execute Stage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-1.5 lg:col-span-4">
          {stages.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedId(st.id)}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs ${
                st.id === selectedId
                  ? 'border-[var(--studio-accent)] bg-[var(--studio-surface)] font-bold'
                  : 'border-[var(--studio-border)] bg-[var(--studio-surface-2)]'
              }`}
            >
              <span>{st.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runStage(st.id);
                }}
                className="rounded border border-[var(--studio-border)] px-2 py-0.5 text-[10px]"
              >
                Run
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 shadow-sm lg:col-span-8 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold border-b border-[var(--studio-border)] pb-2">
            <span>{selectedStage.title} Artifact</span>
            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="text-[11px] text-[var(--studio-accent)] hover:underline"
            >
              {showPromptEditor ? 'Hide Prompt' : 'Edit Stage Prompt'}
            </button>
          </div>

          {showPromptEditor && (
            <textarea
              rows={4}
              value={selectedStage.customPrompt || DEFAULT_STAGE_PROMPTS[selectedStage.id]}
              onChange={(e) =>
                setStages((prev) =>
                  prev.map((s) => (s.id === selectedStage.id ? { ...s, customPrompt: e.target.value } : s))
                )
              }
              className="w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2 font-mono text-xs outline-none"
            />
          )}

          <textarea
            rows={14}
            value={selectedStage.content}
            onChange={(e) =>
              setStages((prev) =>
                prev.map((s) => (s.id === selectedStage.id ? { ...s, content: e.target.value } : s))
              )
            }
            placeholder="Agent output will appear here..."
            className="w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-3 font-mono text-xs outline-none"
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   12. WORKFLOW WORKSPACE (MAIN STUDIO TAB)
   ========================================================================= */

export const WorkflowWorkspace: React.FC<{
  activeProfile: EndpointProfile;
  onOpenEndpointModal: () => void;
  bundles: GeneratedBundle[];
  activeBundleId: string;
  onSelectBundle: (id: string) => void;
  onAddBundle: (bundle: GeneratedBundle) => void;
  onUpdateBundle: (bundle: GeneratedBundle) => void;
  onUpdateProfile?: (profile: EndpointProfile) => void;
  attachedSketchUrl: string | null;
  onClearSketch: () => void;
}> = ({
  activeProfile,
  onOpenEndpointModal,
  bundles,
  activeBundleId,
  onSelectBundle,
  onAddBundle,
  onUpdateBundle,
  onUpdateProfile,
  attachedSketchUrl,
  onClearSketch,
}) => {
  const activeBundle = bundles.find((b) => b.id === activeBundleId) || bundles[0];
  const [prompt, setPrompt] = useState(
    'Prove that 1/4 + 1/16 + 1/64 + ... = 1/3 using a geometric square subdivision, slow zoom, creamy macaron palette, and step-by-step equations.'
  );
  const [palette, setPalette] = useState<PalettePreset>('macaron');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [streamText, setStreamText] = useState('');
  const [show2048, setShow2048] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    setStreamText('');
    try {
      const bundle = await generateDualScene(
        activeProfile,
        prompt.trim(),
        palette,
        null,
        attachedSketchUrl,
        (txt) => setStreamText(txt)
      );
      onAddBundle(bundle);
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Left controls */}
      <div className="space-y-4 xl:col-span-4">
        <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--studio-ink)]">
              <Sparkles className="h-4 w-4 text-[var(--studio-accent)]" /> Prompt &amp; Settings
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                  showSettingsDrawer ? 'bg-[var(--studio-accent)] text-white' : 'border-[var(--studio-border)]'
                }`}
              >
                <Settings2 className="inline h-3 w-3 mr-0.5" /> 16k &amp; Temp
              </button>
              <select
                value={palette}
                onChange={(e) => setPalette(e.target.value as PalettePreset)}
                className="rounded border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1 text-xs"
              >
                <option value="macaron">Macaron</option>
                <option value="3b1b">3B1B</option>
                <option value="bone">Bone</option>
                <option value="obsidian">Obsidian</option>
              </select>
            </div>
          </div>

          {/* Quick inline generation & system prompt parameters */}
          {showSettingsDrawer && onUpdateProfile && (
            <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2.5 text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span>Prompt &amp; Context Settings</span>
                <span className="font-mono text-[10px] text-[var(--studio-accent)]">{activeProfile.maxTokens ?? 16384} tokens</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold block mb-0.5">Temp: {activeProfile.temperature.toFixed(2)}</label>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={activeProfile.temperature}
                    onChange={(e) => onUpdateProfile({ ...activeProfile, temperature: Number(e.target.value) })}
                    className="w-full accent-[var(--studio-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-0.5">Max Tokens</label>
                  <div className="flex gap-1">
                    {[4096, 8192, 16384].map((t) => (
                      <button
                        key={t}
                        onClick={() => onUpdateProfile({ ...activeProfile, maxTokens: t })}
                        className={`flex-1 rounded border py-0.5 font-mono text-[9px] ${
                          (activeProfile.maxTokens ?? 16384) === t
                            ? 'bg-[var(--studio-accent)] text-white'
                            : 'bg-[var(--studio-surface)]'
                        }`}
                      >
                        {t / 1024}k
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold block mb-0.5">Dual-Scene System Prompt</label>
                <textarea
                  rows={3}
                  value={activeProfile.customDualSceneSystemPrompt || DEFAULT_DUAL_SCENE_SYSTEM_PROMPT}
                  onChange={(e) => onUpdateProfile({ ...activeProfile, customDualSceneSystemPrompt: e.target.value })}
                  className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-surface)] p-1.5 font-mono text-[10px] outline-none"
                />
              </div>
            </div>
          )}

          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2.5 text-xs outline-none"
            placeholder="Describe mathematical visual..."
          />

          {attachedSketchUrl && (
            <div className="flex items-center justify-between rounded-lg border border-[var(--studio-accent)]/30 bg-[var(--studio-accent)]/10 p-2 text-xs">
              <span className="font-semibold">Sketch Attached</span>
              <button onClick={onClearSketch} className="text-rose-500 hover:underline">
                Remove
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {PROMPT_STARTERS.map((s) => (
              <button
                key={s.label}
                onClick={() => setPrompt(s.prompt)}
                className="rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1 text-[10px] text-[var(--studio-muted)] hover:border-[var(--studio-accent)]"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex-1 rounded-xl bg-[var(--studio-accent)] py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" /> : <Wand2 className="inline h-3.5 w-3.5 mr-1" />}
              Generate Visual
            </button>
            <button
              onClick={() => setShow2048(!show2048)}
              className="rounded-xl border border-[var(--studio-border)] px-3 py-2 text-xs font-semibold"
            >
              2048
            </button>
          </div>

          {errorMsg && <div className="rounded-lg bg-rose-500/10 p-2 text-xs text-rose-600">{errorMsg}</div>}
        </div>

        {show2048 && <MiniGame2048 />}

        {/* Saved scenes */}
        <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-3 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--studio-muted)]">Showcases &amp; Generations</span>
          <div className="space-y-1 max-h-[220px] overflow-y-auto">
            {bundles.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBundle(b.id)}
                className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-xs ${
                  b.id === activeBundle?.id ? 'bg-[var(--studio-accent)]/15 font-bold' : 'hover:bg-[var(--studio-surface-2)]'
                }`}
              >
                <span className="truncate">{b.plan.title}</span>
                <span className="font-mono text-[10px] text-[var(--studio-muted)]">{b.visualSpec.duration}s</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scene Player */}
      <div className="space-y-4 xl:col-span-8">
        {activeBundle && (
          <>
            <ScenePlayer
              bundle={activeBundle}
              onPaletteChange={(pal) =>
                onUpdateBundle({ ...activeBundle, visualSpec: { ...activeBundle.visualSpec, palette: pal } })
              }
            />
            <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 shadow-sm space-y-2">
              <h2 className="text-base font-bold">{activeBundle.plan.title}</h2>
              <p className="text-xs text-[var(--studio-muted)]">{activeBundle.plan.keyInsight}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {activeBundle.plan.formulas.map((f, i) => (
                  <div key={i} className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-1.5 text-xs">
                    <MathText latex={f} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   13. FREE HOSTING GUIDE
   ========================================================================= */

export const FreeHostingGuide: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm space-y-4 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-emerald-500" />
        <h2 className="text-base font-bold">100% Free Hosting Anywhere</h2>
      </div>
      <p className="text-[var(--studio-muted)]">
        ManimCat Web compiles into a self-contained bundle with <code>npm run build</code>. Every AI inference call is executed directly from your browser with your BYOK keys.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-3 space-y-1">
          <div className="font-bold">Cloudflare Pages</div>
          <p className="text-[11px] text-[var(--studio-muted)]">Free unlimited bandwidth. Drag and drop the <code>dist</code> folder into the dashboard.</p>
        </div>
        <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-3 space-y-1">
          <div className="font-bold">GitHub Pages</div>
          <p className="text-[11px] text-[var(--studio-muted)]">Deploy via GitHub Actions automatically on push with no servers or Docker required.</p>
        </div>
        <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-3 space-y-1">
          <div className="font-bold">Netlify Drop</div>
          <p className="text-[11px] text-[var(--studio-muted)]">Instant static upload at <code>app.netlify.com/drop</code> in seconds.</p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   14. ROOT APP COMPONENT
   ========================================================================= */

const STORAGE_PROFILES_KEY = 'manimcat_web_profiles_v1';
const STORAGE_ACTIVE_PROFILE_KEY = 'manimcat_web_active_profile_v1';
const STORAGE_MODELS_KEY = 'manimcat_web_models_v1';
const STORAGE_THEME_KEY = 'manimcat_web_dark_v1';
const STORAGE_GENERATED_KEY = 'manimcat_web_generated_bundles_v1';

const DEFAULT_PROFILES: EndpointProfile[] = [
  {
    id: 'prof-openrouter',
    name: 'OpenRouter Free',
    presetId: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    selectedModel: 'meta-llama/llama-3.3-70b-instruct:free',
    temperature: 0.35,
    maxTokens: 16384,
    topP: 1.0,
    stream: true,
  },
  {
    id: 'prof-mistral',
    name: 'Mistral Free Tier',
    presetId: 'mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKey: '',
    selectedModel: 'mistral-small-latest',
    temperature: 0.35,
    maxTokens: 16384,
    topP: 1.0,
    stream: true,
  },
];

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function App() {
  const [tab, setTab] = useState<WorkspaceTab>('workflow');
  const [dark, setDark] = useState<boolean>(() => safeReadJson(STORAGE_THEME_KEY, false));

  const [profiles, setProfiles] = useState<EndpointProfile[]>(() => {
    const loaded = safeReadJson<EndpointProfile[]>(STORAGE_PROFILES_KEY, DEFAULT_PROFILES);
    return loaded.length > 0 ? loaded : DEFAULT_PROFILES;
  });
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_ACTIVE_PROFILE_KEY);
    return saved || DEFAULT_PROFILES[0].id;
  });
  const [discoveredModelsByProfile, setDiscoveredModelsByProfile] = useState<Record<string, DiscoveredModel[]>>(() =>
    safeReadJson(STORAGE_MODELS_KEY, {})
  );
  const [endpointModalOpen, setEndpointModalOpen] = useState(false);

  const [userBundles, setUserBundles] = useState<GeneratedBundle[]>(() =>
    safeReadJson<GeneratedBundle[]>(STORAGE_GENERATED_KEY, [])
  );
  const allBundles = [...userBundles, ...BUILTIN_DEMO_BUNDLES];
  const [activeBundleId, setActiveBundleId] = useState<string>(allBundles[0]?.id || BUILTIN_DEMO_BUNDLES[0].id);
  const [attachedSketchUrl, setAttachedSketchUrl] = useState<string | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(dark));
    } catch {
      // ignore
    }
  }, [dark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_ACTIVE_PROFILE_KEY, activeProfileId);
    } catch {
      // ignore
    }
  }, [profiles, activeProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODELS_KEY, JSON.stringify(discoveredModelsByProfile));
    } catch {
      // ignore
    }
  }, [discoveredModelsByProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GENERATED_KEY, JSON.stringify(userBundles.slice(0, 15)));
    } catch {
      // ignore
    }
  }, [userBundles]);

  const handleUpdateProfile = (updated: EndpointProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const navTabs: Array<{ id: WorkspaceTab; label: string; icon: React.ReactNode }> = [
    { id: 'workflow', label: 'Workflow', icon: <Workflow className="h-3.5 w-3.5" /> },
    { id: 'agent', label: 'Agent Studio', icon: <Bot className="h-3.5 w-3.5" /> },
    { id: 'plot', label: 'Plot Studio', icon: <LineChart className="h-3.5 w-3.5" /> },
    { id: 'canvas', label: 'Sketch Pad', icon: <PenTool className="h-3.5 w-3.5" /> },
    { id: 'hosting', label: 'Host Free', icon: <Cloud className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--studio-border)] bg-[var(--studio-surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#455A64] text-[#FAF8F2] font-serif text-lg font-bold">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold sm:text-base">ManimCat Web</span>
                <span className="hidden rounded bg-[var(--studio-surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--studio-muted)] sm:inline">
                  16k Context
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {navTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  tab === t.id
                    ? 'bg-[var(--studio-accent)] text-white shadow-sm'
                    : 'text-[var(--studio-muted)] hover:bg-[var(--studio-surface-2)]'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEndpointModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-1.5 text-xs font-semibold"
            >
              <Server className="h-3.5 w-3.5 text-[var(--studio-accent)]" />
              <span className="max-w-[140px] truncate">{activeProfile.name}</span>
              <span className="font-mono text-[10px] text-[var(--studio-muted)]">
                {activeProfile.maxTokens ? `${Math.round(activeProfile.maxTokens / 1024)}k` : '16k'}
              </span>
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-2 text-[var(--studio-muted)]"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6">
        {tab === 'workflow' && (
          <WorkflowWorkspace
            activeProfile={activeProfile}
            onOpenEndpointModal={() => setEndpointModalOpen(true)}
            bundles={allBundles}
            activeBundleId={activeBundleId}
            onSelectBundle={setActiveBundleId}
            onAddBundle={(b) => {
              setUserBundles((prev) => [b, ...prev]);
              setActiveBundleId(b.id);
            }}
            onUpdateBundle={(b) => setUserBundles((prev) => prev.map((x) => (x.id === b.id ? b : x)))}
            onUpdateProfile={handleUpdateProfile}
            attachedSketchUrl={attachedSketchUrl}
            onClearSketch={() => setAttachedSketchUrl(null)}
          />
        )}
        {tab === 'agent' && (
          <AgentStudioWorkspace
            activeProfile={activeProfile}
            onOpenEndpointModal={() => setEndpointModalOpen(true)}
            onSendBundleToWorkflow={(b) => {
              setUserBundles((prev) => [b, ...prev]);
              setActiveBundleId(b.id);
              setTab('workflow');
            }}
          />
        )}
        {tab === 'plot' && (
          <PlotStudioWorkspace activeProfile={activeProfile} onOpenEndpointModal={() => setEndpointModalOpen(true)} />
        )}
        {tab === 'canvas' && (
          <SketchCanvasWorkspace
            onAttachSketchToWorkflow={(url) => {
              setAttachedSketchUrl(url);
              setTab('workflow');
            }}
          />
        )}
        {tab === 'hosting' && <FreeHostingGuide />}
      </main>

      <EndpointModal
        open={endpointModalOpen}
        onClose={() => setEndpointModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfile.id}
        onSelectProfile={setActiveProfileId}
        onUpdateProfile={handleUpdateProfile}
        onAddProfile={(p) => {
          setProfiles((prev) => [...prev, p]);
          setActiveProfileId(p.id);
        }}
        onDeleteProfile={(id) => {
          setProfiles((prev) => {
            const next = prev.filter((p) => p.id !== id);
            return next.length > 0 ? next : DEFAULT_PROFILES;
          });
        }}
        discoveredModelsByProfile={discoveredModelsByProfile}
        onSaveDiscoveredModels={(pid, m) => setDiscoveredModelsByProfile((prev) => ({ ...prev, [pid]: m }))}
      />
    </div>
  );
}

export default App;