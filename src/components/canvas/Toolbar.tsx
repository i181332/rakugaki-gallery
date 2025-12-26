// src/components/canvas/Toolbar.tsx
'use client';

/**
 * 描画ツールバー
 *
 * ブラシサイズ、色選択、Undo/Redo、クリアボタンを提供
 */

import React, { useCallback } from 'react';
import { Undo2, Redo2, Trash2, Palette, Minus } from 'lucide-react';
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
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 space-y-4 shadow-sm border border-gray-200">
            {/* 履歴操作ボタン */}
            <div className="flex justify-center gap-2">
                <ToolButton
                    onClick={undo}
                    disabled={!canUndo}
                    icon={<Undo2 size={18} />}
                    label="元に戻す"
                />
                <ToolButton
                    onClick={redo}
                    disabled={!canRedo}
                    icon={<Redo2 size={18} />}
                    label="やり直す"
                />
                <ToolButton
                    onClick={handleClear}
                    icon={<Trash2 size={18} />}
                    label="クリア"
                    variant="danger"
                />
            </div>

            {/* ブラシサイズ選択 */}
            <div className="flex justify-center items-center gap-2">
                <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Minus size={14} />
                    サイズ
                </span>
                <div className="flex gap-1.5">
                    {BRUSH_SIZES.map((size) => (
                        <button
                            key={size}
                            onClick={() => setBrushSize(size)}
                            className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                                drawing.brushSize === size
                                    ? 'bg-gray-800 text-white shadow-md scale-105'
                                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            )}
                            aria-label={`ブラシサイズ ${size}px`}
                            title={`${size}px`}
                        >
                            <div
                                className={cn(
                                    'rounded-full',
                                    drawing.brushSize === size ? 'bg-white' : 'bg-gray-700'
                                )}
                                style={{ width: size * 0.6, height: size * 0.6 }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* カラーパレット */}
            <div className="flex justify-center items-center gap-2">
                <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Palette size={14} />
                    色
                </span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                    {COLOR_PALETTE.map((color) => (
                        <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={cn(
                                'w-8 h-8 rounded-full transition-all duration-200 border-2',
                                drawing.brushColor === color
                                    ? 'border-gray-800 ring-2 ring-gray-300 ring-offset-1 scale-110'
                                    : 'border-transparent hover:scale-110 hover:shadow-md'
                            )}
                            style={{ backgroundColor: color }}
                            aria-label={`色: ${color}`}
                            title={color}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// サブコンポーネント
// ============================================================

interface ToolButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
    variant?: 'default' | 'danger';
}

function ToolButton({
    onClick,
    icon,
    label,
    disabled = false,
    variant = 'default',
}: ToolButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'p-2.5 rounded-lg transition-all duration-200',
                'flex items-center justify-center',
                disabled && 'opacity-40 cursor-not-allowed',
                variant === 'default' &&
                'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                variant === 'danger' &&
                'bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
            )}
            aria-label={label}
            title={label}
        >
            {icon}
        </button>
    );
}
