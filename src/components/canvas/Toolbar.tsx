// src/components/canvas/Toolbar.tsx
'use client';

/**
 * 描画ツールバー
 *
 * お絵描きの森風の洗練されたデザイン
 * - カラーパレット（グリッド配置）
 * - ブラシサイズ選択
 * - Undo/Redo/クリアボタン
 */

import React, { useCallback } from 'react';
import { Undo2, Redo2, Trash2 } from 'lucide-react';
import { useGalleryStore, useCanUndo, useCanRedo } from '@/stores/galleryStore';
import { BRUSH_SIZES, COLOR_PALETTE } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================
// コンポーネント
// ============================================================

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

    const handleClear = useCallback(() => {
        if (window.confirm('キャンバスをクリアしますか？')) {
            clearCanvas();
        }
    }, [clearCanvas]);

    return (
        <div className="toolbar-panel p-4 space-y-4">
            {/* 上部: ツールボタンとサイズ選択 */}
            <div className="flex items-center justify-between gap-4">
                {/* 履歴操作ボタン */}
                <div className="flex gap-2">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="tool-btn"
                        aria-label="元に戻す"
                        title="元に戻す"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="tool-btn"
                        aria-label="やり直す"
                        title="やり直す"
                    >
                        <Redo2 size={18} />
                    </button>
                    <button
                        onClick={handleClear}
                        className="tool-btn hover:!bg-red-50 hover:!text-red-600 hover:!border-red-300"
                        aria-label="クリア"
                        title="クリア"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* ブラシサイズ選択 */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">
                        サイズ
                    </span>
                    <div className="flex gap-2">
                        {BRUSH_SIZES.map((size) => (
                            <button
                                key={size}
                                onClick={() => setBrushSize(size)}
                                className={cn(
                                    'size-indicator',
                                    drawing.brushSize === size && 'active'
                                )}
                                aria-label={`ブラシサイズ ${size}px`}
                                title={`${size}px`}
                            >
                                <div
                                    className={cn(
                                        'rounded-full',
                                        drawing.brushSize === size
                                            ? 'bg-white'
                                            : 'bg-[var(--color-primary)]'
                                    )}
                                    style={{
                                        width: Math.max(4, size * 0.5),
                                        height: Math.max(4, size * 0.5),
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 区切り線 */}
            <div className="h-px bg-[var(--color-border)]" />

            {/* カラーパレット - グリッド配置 */}
            <div className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                    カラー
                </span>
                <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                    {COLOR_PALETTE.map((color) => (
                        <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={cn(
                                'color-btn',
                                drawing.brushColor === color && 'active',
                                color === '#FFFFFF' && 'border-[var(--color-border)] !border-2'
                            )}
                            style={{ backgroundColor: color }}
                            aria-label={`色: ${color}`}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            {/* 現在の選択表示 */}
            <div className="flex items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-canvas)] border border-[var(--color-border)]">
                    <div
                        className="w-5 h-5 rounded-full border border-[var(--color-border-dark)]"
                        style={{ backgroundColor: drawing.brushColor }}
                    />
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        {drawing.brushSize}px
                    </span>
                </div>
            </div>
        </div>
    );
}
