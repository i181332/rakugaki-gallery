# Rakugaki Gallery - 実装ガイド

## 1. 環境要件

### 1.1 必須ソフトウェア

| ソフトウェア | バージョン | 確認コマンド |
|--------------|------------|--------------|
| Node.js | 20.x LTS | `node -v` |
| npm | 10.x | `npm -v` |
| Git | 2.x | `git --version` |

### 1.2 推奨エディタ設定

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### 1.3 推奨VSCode拡張機能

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

---

## 2. プロジェクト初期化

### 2.1 リポジトリ作成とクローン

```bash
# GitHubでリポジトリ作成後
git clone https://github.com/YOUR_USERNAME/rakugaki-gallery.git
cd rakugaki-gallery
```

### 2.2 Next.jsプロジェクト初期化

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

選択肢:
- Would you like to use Turbopack? → No
- Would you like to customize the default import alias? → No

### 2.3 追加パッケージインストール

```bash
# コア依存関係
npm install konva react-konva zustand zod nanoid framer-motion

# Gemini API
npm install @google/generative-ai

# 画像生成
npm install html-to-image

# 開発依存関係
npm install -D @cloudflare/next-on-pages wrangler vitest @testing-library/react @testing-library/jest-dom
```

### 2.4 package.json（完全版）

```json
{
  "name": "rakugaki-gallery",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "preview": "npm run build && wrangler pages dev .next",
    "deploy": "npm run build && wrangler pages deploy .next",
    "cf-typegen": "wrangler types"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "framer-motion": "^11.15.0",
    "html-to-image": "^1.11.11",
    "konva": "^9.3.0",
    "nanoid": "^5.0.9",
    "next": "14.2.21",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-konva": "^18.2.10",
    "zod": "^3.24.1",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.13.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^20.17.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.21",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0",
    "wrangler": "^3.99.0"
  }
}
```

---

## 3. 環境変数設定

### 3.1 ローカル開発用

```bash
# .env.local（Gitにコミットしない）
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3.2 .env.example（リポジトリにコミット）

```bash
# .env.example
# Gemini API Key - Google AI Studioで取得
# https://aistudio.google.com/app/apikey
GEMINI_API_KEY=
```

### 3.3 Gemini API キーの取得手順

1. https://aistudio.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択（または新規作成）
4. 生成されたキーをコピー
5. `.env.local`に設定

---

## 4. ディレクトリ構造作成

```bash
# ディレクトリ作成
mkdir -p src/components/{canvas,gallery,share,ui}
mkdir -p src/lib
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/app/api/{evaluate,og,work}
mkdir -p src/app/share/[id]
mkdir -p public/fonts
```

最終的なディレクトリ構造:

```
rakugaki-gallery/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── api/
│   │   │   ├── evaluate/
│   │   │   │   └── route.ts
│   │   │   ├── og/
│   │   │   │   └── [id]/
│   │   │   │       └── route.tsx
│   │   │   └── work/
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   └── share/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── DrawingCanvas.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── ColorPicker.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryCard.tsx
│   │   │   ├── PriceTag.tsx
│   │   │   └── CritiqueText.tsx
│   │   ├── share/
│   │   │   └── ShareButtons.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── LoadingAnimation.tsx
│   ├── lib/
│   │   ├── gemini.ts
│   │   ├── prompts.ts
│   │   ├── parseResponse.ts
│   │   ├── fallback.ts
│   │   └── utils.ts
│   ├── stores/
│   │   └── galleryStore.ts
│   └── types/
│       └── index.ts
├── public/
│   └── fonts/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── wrangler.toml
```

---

## 5. 型定義（完全版）

```typescript
// src/types/index.ts

import { z } from 'zod';

// ========================================
// 評論データ
// ========================================

export const evaluationSchema = z.object({
  title: z.string().min(5).max(40),
  artist: z.string().min(2).max(20),
  medium: z.string().min(5).max(50),
  dimensions: z.string().default('可変、デジタル空間上に存在'),
  critique: z.string().min(100).max(300),
  price: z.number().int().min(1_000_000).max(10_000_000_000),
  priceChange: z.enum(['上昇', '下落', '据え置き']).optional(),
  priceChangeReason: z.string().max(80).optional(),
  nextExpectation: z.string().min(20).max(100),
});

export type Evaluation = z.infer<typeof evaluationSchema>;

// ========================================
// 作品データ
// ========================================

export interface Artwork {
  id: string;
  image: string; // Base64
  evaluation: Evaluation;
  seriesNumber: number;
  createdAt: string;
  previousWorkId?: string;
}

// ========================================
// APIリクエスト/レスポンス
// ========================================

export interface EvaluateRequest {
  image: string;
  previousWork?: {
    id: string;
    title: string;
    artist: string;
    critique: string;
    price: number;
    seriesNumber: number;
  };
}

export interface EvaluateResponse {
  success: true;
  artwork: Artwork;
}

export interface EvaluateErrorResponse {
  success: false;
  error: string;
  code: 'RATE_LIMIT' | 'PARSE_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR';
}

// ========================================
// 描画状態
// ========================================

export interface DrawingState {
  brushColor: string;
  brushSize: number;
  isDrawing: boolean;
}

export interface HistoryState {
  past: string[]; // Base64画像の履歴
  present: string | null;
  future: string[];
}

// ========================================
// アプリケーション状態
// ========================================

export type AppScreen = 'drawing' | 'evaluating' | 'gallery' | 'share';

export interface GalleryState {
  // 画面状態
  currentScreen: AppScreen;
  
  // 描画状態
  drawing: DrawingState;
  history: HistoryState;
  
  // 作品データ
  currentArtwork: Artwork | null;
  artworkHistory: Artwork[];
  
  // UI状態
  isLoading: boolean;
  error: string | null;
  
  // アクション
  setScreen: (screen: AppScreen) => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  saveToHistory: (image: string) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  setCurrentArtwork: (artwork: Artwork) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ========================================
// 定数
// ========================================

export const BRUSH_SIZES = [4, 8, 12, 20] as const;

export const COLOR_PALETTE = [
  '#000000', // 黒
  '#FF0000', // 赤
  '#0000FF', // 青
  '#00AA00', // 緑
  '#FF6600', // オレンジ
  '#9900FF', // 紫
  '#FF69B4', // ピンク
  '#8B4513', // 茶
] as const;

export const MAX_HISTORY_LENGTH = 20;
```

---

## 6. 状態管理（Zustand完全版）

```typescript
// src/stores/galleryStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GalleryState, Artwork, AppScreen } from '@/types';
import { MAX_HISTORY_LENGTH } from '@/types';

const initialDrawingState = {
  brushColor: '#000000',
  brushSize: 8,
  isDrawing: false,
};

const initialHistoryState = {
  past: [],
  present: null,
  future: [],
};

export const useGalleryStore = create<GalleryState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      currentScreen: 'drawing',
      drawing: initialDrawingState,
      history: initialHistoryState,
      currentArtwork: null,
      artworkHistory: [],
      isLoading: false,
      error: null,

      // 画面遷移
      setScreen: (screen: AppScreen) => set({ currentScreen: screen }),

      // 描画設定
      setBrushColor: (color: string) =>
        set((state) => ({
          drawing: { ...state.drawing, brushColor: color },
        })),

      setBrushSize: (size: number) =>
        set((state) => ({
          drawing: { ...state.drawing, brushSize: size },
        })),

      // 履歴管理
      saveToHistory: (image: string) =>
        set((state) => {
          const newPast = state.history.present
            ? [...state.history.past, state.history.present].slice(-MAX_HISTORY_LENGTH)
            : state.history.past;

          return {
            history: {
              past: newPast,
              present: image,
              future: [], // 新しい変更で未来履歴をクリア
            },
          };
        }),

      undo: () =>
        set((state) => {
          if (state.history.past.length === 0) return state;

          const previous = state.history.past[state.history.past.length - 1];
          const newPast = state.history.past.slice(0, -1);

          return {
            history: {
              past: newPast,
              present: previous,
              future: state.history.present
                ? [state.history.present, ...state.history.future]
                : state.history.future,
            },
          };
        }),

      redo: () =>
        set((state) => {
          if (state.history.future.length === 0) return state;

          const next = state.history.future[0];
          const newFuture = state.history.future.slice(1);

          return {
            history: {
              past: state.history.present
                ? [...state.history.past, state.history.present]
                : state.history.past,
              present: next,
              future: newFuture,
            },
          };
        }),

      clearCanvas: () =>
        set((state) => ({
          history: {
            past: state.history.present
              ? [...state.history.past, state.history.present]
              : state.history.past,
            present: null,
            future: [],
          },
        })),

      // 作品管理
      setCurrentArtwork: (artwork: Artwork) =>
        set((state) => ({
          currentArtwork: artwork,
          artworkHistory: [...state.artworkHistory, artwork],
        })),

      // UI状態
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      // リセット
      reset: () =>
        set({
          currentScreen: 'drawing',
          drawing: initialDrawingState,
          history: initialHistoryState,
          currentArtwork: null,
          isLoading: false,
          error: null,
        }),
    }),
    { name: 'gallery-store' }
  )
);

// セレクター
export const useCurrentImage = () => useGalleryStore((state) => state.history.present);
export const useCanUndo = () => useGalleryStore((state) => state.history.past.length > 0);
export const useCanRedo = () => useGalleryStore((state) => state.history.future.length > 0);
```

---

## 7. 描画キャンバス実装

### 7.1 メインキャンバスコンポーネント

```typescript
// src/components/canvas/DrawingCanvas.tsx

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { useGalleryStore, useCurrentImage } from '@/stores/galleryStore';

interface LineData {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export function DrawingCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const [lines, setLines] = React.useState<LineData[]>([]);
  const isDrawingRef = useRef(false);

  const { drawing, saveToHistory } = useGalleryStore();
  const currentImage = useCurrentImage();

  // キャンバスサイズ
  const canvasSize = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 32 : 600,
    600
  );

  // 描画開始
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      isDrawingRef.current = true;
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      setLines((prev) => [
        ...prev,
        {
          points: [pos.x, pos.y],
          stroke: drawing.brushColor,
          strokeWidth: drawing.brushSize,
        },
      ]);
    },
    [drawing.brushColor, drawing.brushSize]
  );

  // 描画中
  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawingRef.current) return;

      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      setLines((prev) => {
        const lastLine = prev[prev.length - 1];
        if (!lastLine) return prev;

        const newPoints = [...lastLine.points, pos.x, pos.y];
        const newLines = prev.slice(0, -1);
        return [...newLines, { ...lastLine, points: newPoints }];
      });
    },
    []
  );

  // 描画終了
  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // 履歴に保存
    const stage = stageRef.current;
    if (stage) {
      const dataUrl = stage.toDataURL({ pixelRatio: 2 });
      saveToHistory(dataUrl);
    }
  }, [saveToHistory]);

  // 履歴からの復元
  useEffect(() => {
    if (currentImage === null) {
      setLines([]);
    }
    // 注: 完全な履歴復元にはキャンバス画像の読み込みが必要
    // 簡易実装のため、linesの状態で管理
  }, [currentImage]);

  // タッチイベントのスクロール防止
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    container.style.touchAction = 'none';
  }, []);

  return (
    <div className="flex justify-center">
      <div
        className="border border-gray-200 bg-white"
        style={{ width: canvasSize, height: canvasSize }}
      >
        <Stage
          ref={stageRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// キャンバスから画像を取得するユーティリティ
export function useCanvasImage() {
  const stageRef = useRef<Konva.Stage | null>(null);

  const getImage = useCallback((): string | null => {
    if (!stageRef.current) return null;
    return stageRef.current.toDataURL({ pixelRatio: 2 });
  }, []);

  return { stageRef, getImage };
}
```

### 7.2 ツールバー

```typescript
// src/components/canvas/Toolbar.tsx

'use client';

import React from 'react';
import { useGalleryStore, useCanUndo, useCanRedo } from '@/stores/galleryStore';
import { BRUSH_SIZES, COLOR_PALETTE } from '@/types';
import { Undo2, Redo2, Trash2 } from 'lucide-react';

export function Toolbar() {
  const {
    drawing,
    setBrushColor,
    setBrushSize,
    undo,
    redo,
    clearCanvas,
  } = useGalleryStore();

  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const handleClear = () => {
    if (window.confirm('キャンバスをクリアしますか？')) {
      clearCanvas();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      {/* 履歴操作 */}
      <div className="flex justify-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          aria-label="元に戻す"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          aria-label="やり直す"
        >
          <Redo2 size={20} />
        </button>
        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
          aria-label="クリア"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* ブラシサイズ */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">サイズ:</span>
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              drawing.brushSize === size
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-100'
            }`}
            aria-label={`ブラシサイズ ${size}`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: size, height: size }}
            />
          </button>
        ))}
      </div>

      {/* カラーパレット */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 mr-2">色:</span>
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => setBrushColor(color)}
            className={`w-8 h-8 rounded-full transition-all ${
              drawing.brushColor === color
                ? 'ring-2 ring-offset-2 ring-gray-800'
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`色 ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Gemini API連携（完全版）

```typescript
// src/lib/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { evaluationSchema, type Evaluation } from '@/types';
import { INITIAL_CRITIQUE_PROMPT, buildContinuationPrompt } from './prompts';
import { parseGeminiResponse } from './parseResponse';
import { generateFallbackEvaluation } from './fallback';

const MAX_RETRIES = 2;

// サーバーサイドでのみ初期化
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface PreviousWork {
  title: string;
  artist: string;
  critique: string;
  price: number;
  seriesNumber: number;
}

export async function generateCritique(
  imageBase64: string,
  previousWork?: PreviousWork
): Promise<Evaluation> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const basePrompt = previousWork
        ? buildContinuationPrompt(previousWork)
        : INITIAL_CRITIQUE_PROMPT;

      // リトライ時は警告を追加
      const prompt =
        attempt > 0
          ? basePrompt + '\n\n【警告】前回の出力が不正でした。純粋なJSONのみを出力せよ。'
          : basePrompt;

      // Base64のプレフィックスを除去
      const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/png',
            data: imageData,
          },
        },
        { text: prompt },
      ]);

      const response = result.response;
      const text = response.text();

      console.log(`[Attempt ${attempt + 1}] Raw response:`, text.substring(0, 200));

      const evaluation = parseGeminiResponse(text);
      return evaluation;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Attempt ${attempt + 1}] Failed:`, error);

      // レート制限エラーの場合は即座に投げる
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('RATE_LIMIT');
      }
    }
  }

  console.error('All retries failed, using fallback:', lastError);
  return generateFallbackEvaluation();
}
```

```typescript
// src/lib/parseResponse.ts

import { evaluationSchema, type Evaluation } from '@/types';

export function parseGeminiResponse(raw: string): Evaluation {
  // Step 1: 前後の空白を除去
  let cleaned = raw.trim();

  // Step 2: コードブロック記法を除去
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // Step 3: JSONの開始・終了位置を特定
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Valid JSON not found in response');
  }

  const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

  // Step 4: パース
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`JSON parse error: ${e}`);
  }

  // Step 5: バリデーション
  const result = evaluationSchema.safeParse(parsed);

  if (!result.success) {
    console.error('Validation errors:', result.error.errors);
    throw new Error(`Validation error: ${result.error.errors[0]?.message}`);
  }

  return result.data;
}
```

```typescript
// src/lib/fallback.ts

import type { Evaluation } from '@/types';

const fallbackTitles = [
  '沈黙の中の叫び',
  '存在の輪郭',
  '無題の宇宙',
  '記憶の残響',
  '時間の結晶',
  '夢の境界線',
  '魂の軌跡',
  '静寂の彼方',
];

const fallbackArtists = [
  '山田 空想',
  '佐藤 幻夢',
  '田中 無限',
  '鈴木 瞬間',
  '高橋 余白',
  '伊藤 静謐',
  '渡辺 創造',
  '中村 彼方',
];

const fallbackCritiques = [
  'この作品は、現代社会における人間存在の本質的な孤独を、驚くべき直接性で表現している。一見単純に見える線の中に、作者の魂の震えが確かに刻まれている。これは技術を超えた、純粋な表現衝動の結晶である。美術史は、この瞬間を記憶するだろう。',
  '圧倒的な存在感を放つこの作品は、見る者の心に深く突き刺さる。作者は意図的に技巧を排し、原初的な表現の力を解き放っている。この大胆さこそが、現代アートに新たな地平を切り開く可能性を秘めている。',
  '静謐でありながら激しく、単純でありながら深遠。この作品に内包された矛盾こそが、人間存在そのものの反映である。作者は無意識のうちに、芸術の本質に触れている。',
];

export function generateFallbackEvaluation(): Evaluation {
  const randomIndex = (arr: readonly string[]) =>
    Math.floor(Math.random() * arr.length);

  return {
    title: fallbackTitles[randomIndex(fallbackTitles)],
    artist: fallbackArtists[randomIndex(fallbackArtists)],
    medium: 'デジタルメディウム・即興表現主義',
    dimensions: '可変、デジタル空間上に存在',
    critique: fallbackCritiques[randomIndex(fallbackCritiques)],
    price: 5_000_000 + Math.floor(Math.random() * 15_000_000),
    nextExpectation:
      '次回作では、この萌芽的才能がさらなる開花を見せることを、美術界は固唾を呑んで見守っている。',
  };
}
```

---

## 9. API Route実装

```typescript
// src/app/api/evaluate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { generateCritique } from '@/lib/gemini';
import type { EvaluateRequest, EvaluateResponse, EvaluateErrorResponse, Artwork } from '@/types';

// レート制限用の簡易実装（本番ではKV等を使用）
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      const response: EvaluateErrorResponse = {
        success: false,
        error: '評論家が休憩中です。1分後にもう一度お試しください。',
        code: 'RATE_LIMIT',
      };
      return NextResponse.json(response, { status: 429 });
    }

    // リクエストパース
    const body: EvaluateRequest = await request.json();

    if (!body.image) {
      const response: EvaluateErrorResponse = {
        success: false,
        error: '画像が提供されていません',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 評論生成
    const evaluation = await generateCritique(body.image, body.previousWork);

    // 作品データ作成
    const artwork: Artwork = {
      id: nanoid(10),
      image: body.image,
      evaluation,
      seriesNumber: body.previousWork ? body.previousWork.seriesNumber + 1 : 1,
      createdAt: new Date().toISOString(),
      previousWorkId: body.previousWork?.id,
    };

    const response: EvaluateResponse = {
      success: true,
      artwork,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Evaluate API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'RATE_LIMIT') {
      const response: EvaluateErrorResponse = {
        success: false,
        error: 'APIのレート制限に達しました。しばらくお待ちください。',
        code: 'RATE_LIMIT',
      };
      return NextResponse.json(response, { status: 429 });
    }

    const response: EvaluateErrorResponse = {
      success: false,
      error: '評論の生成に失敗しました',
      code: 'API_ERROR',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
```

---

## 10. シェア機能実装

```typescript
// src/components/share/ShareButtons.tsx

'use client';

import React, { useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { Artwork } from '@/types';

interface ShareButtonsProps {
  artwork: Artwork;
  cardRef: React.RefObject<HTMLDivElement>;
}

export function ShareButtons({ artwork, cardRef }: ShareButtonsProps) {
  const shareText = `私の落書きが ¥${artwork.evaluation.price.toLocaleString()} の評価を受けました！\n\n#RakugakiGallery #落書き美術館`;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${artwork.id}`
    : '';

  // 画像をダウンロード
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `rakugaki-${artwork.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('画像の生成に失敗しました');
    }
  }, [artwork.id, cardRef]);

  // X (Twitter) でシェア
  const handleShareX = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }, [shareText, shareUrl]);

  // LINE でシェア
  const handleShareLine = useCallback(() => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }, [shareText, shareUrl]);

  // リンクをコピー
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('リンクをコピーしました');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('コピーに失敗しました');
    }
  }, [shareUrl]);

  // Web Share API（モバイル）
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) {
      // Web Share API非対応の場合はリンクコピー
      handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: artwork.evaluation.title,
        text: shareText,
        url: shareUrl,
      });
    } catch (error) {
      // ユーザーがキャンセルした場合は何もしない
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  }, [artwork.evaluation.title, shareText, shareUrl, handleCopyLink]);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={handleShareX}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <span className="font-bold">𝕏</span>
        <span>シェア</span>
      </button>

      <button
        onClick={handleShareLine}
        className="flex items-center gap-2 px-4 py-2 bg-[#00B900] text-white rounded-lg hover:bg-[#00A000] transition-colors"
      >
        <span>LINE</span>
      </button>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>📥</span>
        <span>画像保存</span>
      </button>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>🔗</span>
        <span>リンク</span>
      </button>
    </div>
  );
}
```

---

## 11. Next.js設定（Cloudflare Pages対応）

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pagesで動作させるための設定
  output: 'standalone',
  
  // 画像最適化を無効化（Cloudflareでは非対応）
  images: {
    unoptimized: true,
  },

  // 実験的機能
  experimental: {
    // Server Actionsを有効化（必要に応じて）
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // 環境変数をクライアントに公開しない
  env: {
    // クライアントに公開する環境変数のみここに記載
  },
};

module.exports = nextConfig;
```

```toml
# wrangler.toml

name = "rakugaki-gallery"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Pages設定
pages_build_output_dir = ".vercel/output/static"

# 環境変数（秘密情報はDashboardで設定）
[vars]
ENVIRONMENT = "production"

# KV Namespace（シェア用データ保存、オプション）
# [[kv_namespaces]]
# binding = "ARTWORKS"
# id = "xxxxxxxxxx"
```

---

## 12. デプロイ手順

### 12.1 Cloudflare Pages初期設定

1. **Cloudflareアカウント作成**
   - https://dash.cloudflare.com/sign-up

2. **Pagesプロジェクト作成**
   ```
   Cloudflare Dashboard → Pages → Create a project → Connect to Git
   ```

3. **GitHubリポジトリ連携**
   - リポジトリを選択
   - ビルド設定:
     - Framework preset: Next.js
     - Build command: `npm run build`
     - Build output directory: `.next`

4. **環境変数設定**
   ```
   Settings → Environment variables → Add variable
   - GEMINI_API_KEY: (your key)
   ```

### 12.2 手動デプロイ（CLI）

```bash
# Wrangler ログイン
npx wrangler login

# ビルド
npm run build

# デプロイ
npx wrangler pages deploy .next --project-name=rakugaki-gallery
```

### 12.3 自動デプロイ（GitHub Actions）

```yaml
# .github/workflows/deploy.yml

name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: rakugaki-gallery
          directory: .next
```

### 12.4 GitHub Secrets設定

```
Repository Settings → Secrets and variables → Actions → New repository secret

- GEMINI_API_KEY: Gemini APIキー
- CLOUDFLARE_API_TOKEN: Cloudflare APIトークン
- CLOUDFLARE_ACCOUNT_ID: CloudflareアカウントID
```

---

## 13. ローカル開発の流れ

```bash
# 1. リポジトリクローン
git clone https://github.com/YOUR_USERNAME/rakugaki-gallery.git
cd rakugaki-gallery

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.local を編集してGEMINI_API_KEYを設定

# 4. 開発サーバー起動
npm run dev

# 5. ブラウザで確認
open http://localhost:3000
```

---

## 14. トラブルシューティング

### 14.1 よくあるエラー

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `GEMINI_API_KEY is not set` | 環境変数未設定 | `.env.local`にAPIキーを設定 |
| `429 Too Many Requests` | レート制限 | 1分待ってから再試行 |
| `Valid JSON not found` | Geminiの出力異常 | 自動リトライで解決、または fallback |
| `Canvas is blank` | 描画が保存されていない | `saveToHistory`の呼び出しを確認 |
| `TypeError: Cannot read property 'getStage'` | Konva初期化エラー | `useRef`の初期化タイミングを確認 |

### 14.2 デバッグ方法

```typescript
// 開発時のみログを出力
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', { ... });
}

// Zustand DevTools
// ブラウザのRedux DevTools拡張で状態を確認可能
```

---

## 15. チェックリスト

### 開発開始前
- [ ] Node.js 20.x インストール済み
- [ ] Gemini API キー取得済み
- [ ] GitHubリポジトリ作成済み

### Phase 1: 描画機能
- [ ] プロジェクト初期化
- [ ] DrawingCanvas実装
- [ ] Toolbar実装
- [ ] Zustand Store実装
- [ ] Undo/Redo動作確認

### Phase 2: AI連携
- [ ] Gemini API連携
- [ ] プロンプト実装
- [ ] パース処理実装
- [ ] フォールバック実装
- [ ] API Route実装

### Phase 3: UI
- [ ] GalleryCard実装
- [ ] ローディングアニメーション
- [ ] エラー表示
- [ ] レスポンシブ対応

### Phase 4: シェア機能
- [ ] ShareButtons実装
- [ ] OGP画像生成
- [ ] シェアページ実装

### Phase 5: デプロイ
- [ ] Cloudflare Pages設定
- [ ] 環境変数設定
- [ ] 本番デプロイ
- [ ] 動作確認
