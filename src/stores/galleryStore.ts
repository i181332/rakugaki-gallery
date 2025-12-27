// src/stores/galleryStore.ts
/**
 * Rakugaki Gallery - グローバル状態管理
 *
 * Zustandによる軽量かつ型安全な状態管理
 * - Immerless: 直感的なイミュータブル更新パターン
 * - DevTools対応: Redux DevToolsで状態をデバッグ可能
 * - セレクター関数: 必要な状態のみを購読し再レンダリングを最適化
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { GalleryState, Artwork, AppScreen } from '@/types';
import { BRUSH_CONFIG, HISTORY_CONFIG } from '@/config/constants';

// ============================================================
// 初期状態
// ============================================================

const initialDrawingState = {
    brushColor: BRUSH_CONFIG.DEFAULT_COLOR,
    brushSize: BRUSH_CONFIG.DEFAULT_SIZE,
    isDrawing: false,
} as const;

const initialHistoryState = {
    past: [] as string[],
    present: null as string | null,
    future: [] as string[],
} as const;

// ============================================================
// ストア実装
// ============================================================

export const useGalleryStore = create<GalleryState>()(
    devtools(
        subscribeWithSelector((set) => ({
            // ========== 初期状態 ==========
            currentScreen: 'login',
            artistName: '名無しのアトリエ',
            avatarSeed: 'Felix',
            drawing: { ...initialDrawingState },
            history: { ...initialHistoryState },
            currentArtwork: null,
            artworkHistory: [],
            isLoading: false,
            error: null,

            // ========== 画面遷移 ==========
            setScreen: (screen: AppScreen) =>
                set(
                    { currentScreen: screen },
                    false,
                    'setScreen'
                ),

            // ========== ユーザー情報 ==========
            setArtistName: (name: string) =>
                set({ artistName: name }, false, 'setArtistName'),

            setAvatarSeed: (seed: string) =>
                set({ avatarSeed: seed }, false, 'setAvatarSeed'),

            // ========== 描画設定 ==========
            setBrushColor: (color: string) =>
                set(
                    (state) => ({
                        drawing: { ...state.drawing, brushColor: color },
                    }),
                    false,
                    'setBrushColor'
                ),

            setBrushSize: (size: number) =>
                set(
                    (state) => ({
                        drawing: { ...state.drawing, brushSize: size },
                    }),
                    false,
                    'setBrushSize'
                ),

            // ========== 履歴管理（Undo/Redo） ==========
            /**
             * 現在のキャンバス状態を履歴に保存
             * - 新しい変更があるとFuture履歴はクリアされる
             * - 履歴は最大HISTORY_CONFIG.MAX_LENGTH件まで保持
             */
            saveToHistory: (image: string) =>
                set(
                    (state) => {
                        const { past, present } = state.history;
                        const newPast = present
                            ? [...past, present].slice(-HISTORY_CONFIG.MAX_LENGTH)
                            : past;

                        return {
                            history: {
                                past: newPast,
                                present: image,
                                future: [], // 新規変更でRedo履歴をクリア
                            },
                        };
                    },
                    false,
                    'saveToHistory'
                ),

            /**
             * 直前の状態に戻す（Undo）
             */
            undo: () =>
                set(
                    (state) => {
                        const { past, present, future } = state.history;
                        if (past.length === 0) return state;

                        const previous = past[past.length - 1];
                        const newPast = past.slice(0, -1);

                        return {
                            history: {
                                past: newPast,
                                present: previous,
                                future: present ? [present, ...future] : future,
                            },
                        };
                    },
                    false,
                    'undo'
                ),

            /**
             * Undoした操作をやり直す（Redo）
             */
            redo: () =>
                set(
                    (state) => {
                        const { past, present, future } = state.history;
                        if (future.length === 0) return state;

                        const next = future[0];
                        const newFuture = future.slice(1);

                        return {
                            history: {
                                past: present ? [...past, present] : past,
                                present: next,
                                future: newFuture,
                            },
                        };
                    },
                    false,
                    'redo'
                ),

            /**
             * キャンバスをクリア（現状態を履歴に保存してから）
             */
            clearCanvas: () =>
                set(
                    (state) => ({
                        history: {
                            past: state.history.present
                                ? [...state.history.past, state.history.present]
                                : state.history.past,
                            present: null,
                            future: [],
                        },
                    }),
                    false,
                    'clearCanvas'
                ),

            // ========== 作品管理 ==========
            /**
             * 評論済み作品を設定し、履歴に追加
             */
            setCurrentArtwork: (artwork: Artwork) =>
                set(
                    (state) => ({
                        currentArtwork: artwork,
                        artworkHistory: [...state.artworkHistory, artwork],
                    }),
                    false,
                    'setCurrentArtwork'
                ),

            // ========== UI状態 ==========
            setLoading: (loading: boolean) =>
                set({ isLoading: loading }, false, 'setLoading'),

            setError: (error: string | null) =>
                set({ error }, false, 'setError'),

            // ========== リセット ==========
            /**
             * アプリケーション状態を初期状態に戻す
             * ※作品履歴は保持される
             */
            reset: () =>
                set(
                    (state) => ({
                        currentScreen: 'drawing' as const,
                        drawing: { ...initialDrawingState },
                        history: { ...initialHistoryState },
                        currentArtwork: null,
                        isLoading: false,
                        error: null,
                        // artistName, avatarSeed, artworkHistoryは保持
                        artistName: state.artistName,
                        avatarSeed: state.avatarSeed,
                    }),
                    false,
                    'reset'
                ),
        })),
        {
            name: 'rakugaki-gallery',
            enabled: process.env.NODE_ENV === 'development',
        }
    )
);

// ============================================================
// セレクター関数
// パフォーマンス最適化: 必要な状態のみを購読
// ============================================================

/** 現在のキャンバス画像を取得 */
export const useCurrentImage = () =>
    useGalleryStore((s) => s.history.present);

/** Undo可能かどうか */
export const useCanUndo = () =>
    useGalleryStore((s) => s.history.past.length > 0);

/** Redo可能かどうか */
export const useCanRedo = () =>
    useGalleryStore((s) => s.history.future.length > 0);

/** 描画設定のみ取得 */
export const useDrawingSettings = () =>
    useGalleryStore((s) => s.drawing);

/** 現在の画面 */
export const useCurrentScreen = () =>
    useGalleryStore((s) => s.currentScreen);

/** ローディング状態 */
export const useIsLoading = () =>
    useGalleryStore((s) => s.isLoading);

/** エラー状態 */
export const useError = () =>
    useGalleryStore((s) => s.error);

/** 現在の作品 */
export const useCurrentArtwork = () =>
    useGalleryStore((s) => s.currentArtwork);

/** 作品履歴 */
export const useArtworkHistory = () =>
    useGalleryStore((s) => s.artworkHistory);

/** アーティスト名 */
export const useArtistName = () =>
    useGalleryStore((s) => s.artistName);

/** アバターシード */
export const useAvatarSeed = () =>
    useGalleryStore((s) => s.avatarSeed);
