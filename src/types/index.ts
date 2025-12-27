// src/types/index.ts
/**
 * Rakugaki Gallery - 型定義
 *
 * Zodスキーマによる厳密なランタイム型検証と
 * TypeScriptの静的型チェックを組み合わせた堅牢な型システム
 */

import { z } from 'zod';

// ============================================================
// 評論データスキーマ
// ============================================================

/**
 * Gemini APIからのレスポンスを検証するZodスキーマ
 * 各フィールドに厳密な制約を設定し、不正なデータを早期に検出
 */
export const evaluationSchema = z.object({
    /** 作品タイトル（詩的かつ象徴的な表現） */
    title: z
        .string()
        .min(5, 'タイトルは5文字以上必要です')
        .max(40, 'タイトルは40文字以内にしてください'),

    /** 架空のアーティスト名 */
    artist: z
        .string()
        .min(2, 'アーティスト名は2文字以上必要です')
        .max(20, 'アーティスト名は20文字以内にしてください'),

    /** 技法・メディウム */
    medium: z
        .string()
        .min(5, '技法は5文字以上必要です')
        .max(50, '技法は50文字以内にしてください'),

    /** 作品寸法 */
    dimensions: z.string().default('可変、デジタル空間上に存在'),

    /** 評論文（格調高く大げさに） */
    critique: z
        .string()
        .min(100, '評論文は100文字以上必要です')
        .max(300, '評論文は300文字以内にしてください'),

    /** 価格（100万円〜100億円） */
    price: z
        .number()
        .int('価格は整数である必要があります')
        .min(1_000_000, '価格は100万円以上です')
        .max(10_000_000_000, '価格は100億円以下です'),

    /** 価格変動（続編作品のみ） */
    priceChange: z.enum(['上昇', '下落', '据え置き']).optional(),

    /** 価格変動の理由（続編作品のみ） */
    priceChangeReason: z
        .string()
        .max(80, '価格変動理由は80文字以内にしてください')
        .optional(),

    /** 次回作への期待 */
    nextExpectation: z
        .string()
        .min(20, '次回作への期待は20文字以上必要です')
        .max(100, '次回作への期待は100文字以内にしてください'),
});

export type Evaluation = z.infer<typeof evaluationSchema>;

// ============================================================
// 作品データ
// ============================================================

/**
 * 評論済み作品の完全なデータ構造
 */
export interface Artwork {
    /** ユニークID（nanoidで生成） */
    id: string;
    /** Base64エンコードされた画像データ */
    image: string;
    /** Geminiによる評論データ */
    evaluation: Evaluation;
    /** シリーズ通し番号（続編機能用） */
    seriesNumber: number;
    /** 作成日時（ISO 8601形式） */
    createdAt: string;
    /** 前作のID（続編の場合） */
    previousWorkId?: string;
}

// ============================================================
// API リクエスト/レスポンス型
// ============================================================

/**
 * 評論生成APIへのリクエスト
 */
export interface EvaluateRequest {
    /** Base64エンコードされた画像 */
    image: string;
    /** 前作の情報（続編作成時） */
    previousWork?: {
        id: string;
        title: string;
        artist: string;
        critique: string;
        price: number;
        seriesNumber: number;
    };
}

/**
 * 評論生成API成功レスポンス
 */
export interface EvaluateResponse {
    success: true;
    artwork: Artwork;
}

/**
 * 評論生成APIエラーレスポンス
 */
export interface EvaluateErrorResponse {
    success: false;
    error: string;
    code: 'RATE_LIMIT' | 'PARSE_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR';
}

// ============================================================
// 描画状態
// ============================================================

/**
 * ブラシ設定の状態
 */
export interface DrawingState {
    /** 現在のブラシ色（HEX形式） */
    brushColor: string;
    /** ブラシサイズ（px） */
    brushSize: number;
    /** 描画中フラグ */
    isDrawing: boolean;
}

/**
 * Undo/Redo履歴の状態
 */
export interface HistoryState {
    /** 過去の状態スナップショット */
    past: string[];
    /** 現在のキャンバス状態（Base64） */
    present: string | null;
    /** RedoスタックUndo */
    future: string[];
}

// ============================================================
// アプリケーション状態
// ============================================================

/**
 * 画面状態の列挙型
 */
export type AppScreen = 'login' | 'drawing' | 'evaluating' | 'gallery' | 'share';

/**
 * グローバル状態管理のインターフェース
 */
export interface GalleryState {
    // === 画面状態 ===
    currentScreen: AppScreen;

    // === ユーザー情報 ===
    artistName: string;
    avatarSeed: string;

    // === 描画状態 ===
    drawing: DrawingState;
    history: HistoryState;

    // === 作品データ ===
    currentArtwork: Artwork | null;
    artworkHistory: Artwork[];

    // === UI状態 ===
    isLoading: boolean;
    error: string | null;

    // === アクション ===
    setScreen: (screen: AppScreen) => void;
    setArtistName: (name: string) => void;
    setAvatarSeed: (seed: string) => void;
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

// ============================================================
// 定数の再エクスポート
// ============================================================

export {
    BRUSH_SIZES,
    COLOR_PALETTE,
    MAX_HISTORY_LENGTH,
    DEFAULT_CANVAS_SIZE,
    CANVAS_CONFIG,
    BRUSH_CONFIG,
    HISTORY_CONFIG,
    API_CONFIG,
    GEMINI_CONFIG,
    CACHE_CONFIG,
    VALIDATION_CONFIG,
    type BrushSize,
    type PaletteColor,
} from '@/config/constants';
