// src/config/constants.ts
/**
 * Rakugaki Gallery - アプリケーション定数
 *
 * すべての設定値を一元管理し、保守性と一貫性を確保
 * 型安全性を保ちつつ、環境変数との連携も考慮
 */

// ============================================================
// キャンバス設定
// ============================================================

export const CANVAS_CONFIG = {
    /** デフォルトのキャンバスサイズ（px） */
    DEFAULT_SIZE: 600,
    /** レスポンシブ計算時の水平パディング（px） */
    HORIZONTAL_PADDING: 32,
    /** 画像出力時のピクセル比率 */
    PIXEL_RATIO: 2,
} as const;

// ============================================================
// ブラシ設定
// ============================================================

/** 利用可能なブラシサイズ（px） */
export const BRUSH_SIZES = [4, 8, 12, 20] as const;
export type BrushSize = (typeof BRUSH_SIZES)[number];

/** カラーパレット */
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
export type PaletteColor = (typeof COLOR_PALETTE)[number];

export const BRUSH_CONFIG = {
    SIZES: BRUSH_SIZES,
    COLORS: COLOR_PALETTE,
    /** デフォルトのブラシサイズ */
    DEFAULT_SIZE: 8 as BrushSize,
    /** デフォルトのブラシ色 */
    DEFAULT_COLOR: '#000000' as PaletteColor,
} as const;

// ============================================================
// 履歴設定
// ============================================================

export const HISTORY_CONFIG = {
    /** Undo/Redo履歴の最大保持数 */
    MAX_LENGTH: 20,
} as const;

// ============================================================
// API設定
// ============================================================

export const API_CONFIG = {
    /** レート制限: 1ウィンドウあたりの最大リクエスト数 */
    RATE_LIMIT: 5,
    /** レート制限ウィンドウ（ミリ秒） */
    RATE_LIMIT_WINDOW_MS: 60 * 1000,
    /** 最大画像サイズ（バイト） */
    MAX_IMAGE_SIZE: 10 * 1024 * 1024,
    /** クリーンアップ間隔（ミリ秒） */
    CLEANUP_INTERVAL_MS: 60 * 1000,
} as const;

// ============================================================
// Gemini API設定
// ============================================================

export const GEMINI_CONFIG = {
    /** 使用するモデル名 */
    MODEL: 'gemini-2.0-flash-exp',
    /** 最大リトライ回数 */
    MAX_RETRIES: 2,
    /** 生成パラメータ */
    GENERATION: {
        /** 温度（創造性パラメータ） */
        TEMPERATURE: 0.9,
        /** Top-P */
        TOP_P: 0.95,
        /** Top-K */
        TOP_K: 40,
        /** 最大出力トークン数 */
        MAX_OUTPUT_TOKENS: 2048,
    },
} as const;

// ============================================================
// キャッシュ設定
// ============================================================

export const CACHE_CONFIG = {
    /** キャッシュの有効期限（ミリ秒、24時間） */
    TTL_MS: 24 * 60 * 60 * 1000,
    /** 最大キャッシュサイズ */
    MAX_SIZE: 1000,
} as const;

// ============================================================
// バリデーション設定
// ============================================================

export const VALIDATION_CONFIG = {
    TITLE: { MIN: 5, MAX: 40 },
    ARTIST: { MIN: 2, MAX: 20 },
    MEDIUM: { MIN: 5, MAX: 50 },
    CRITIQUE: { MIN: 100, MAX: 300 },
    NEXT_EXPECTATION: { MIN: 20, MAX: 100 },
    PRICE_CHANGE_REASON: { MAX: 80 },
    PRICE: {
        MIN: 1_000_000,      // 100万円
        MAX: 10_000_000_000, // 100億円
    },
} as const;

// ============================================================
// 後方互換性のためのエクスポート
// 既存コードの段階的移行を支援
// ============================================================

/** @deprecated HISTORY_CONFIG.MAX_LENGTH を使用してください */
export const MAX_HISTORY_LENGTH = HISTORY_CONFIG.MAX_LENGTH;

/** @deprecated CANVAS_CONFIG.DEFAULT_SIZE を使用してください */
export const DEFAULT_CANVAS_SIZE = CANVAS_CONFIG.DEFAULT_SIZE;
