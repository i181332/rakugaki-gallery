// src/components/canvas/DrawingCanvas.tsx
'use client';

/**
 * 描画キャンバスコンポーネント
 *
 * Konvaを使用したインタラクティブなキャンバス
 * - マウス/タッチ対応
 * - リアルタイム描画
 * - 木枠風のフレームデザイン
 */

import React, {
    useRef,
    useCallback,
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { useGalleryStore } from '@/stores/galleryStore';
import { CANVAS_CONFIG } from '@/config/constants';

// ============================================================
// 型定義
// ============================================================

interface LineData {
    id: number;
    points: number[];
    stroke: string;
    strokeWidth: number;
}

// ============================================================
// ID生成用カウンター
// ============================================================

let lineIdCounter = 0;
function generateLineId(): number {
    return ++lineIdCounter;
}

export interface DrawingCanvasHandle {
    getImage: () => string | null;
    clear: () => void;
}

// ============================================================
// コンポーネント
// ============================================================

export const DrawingCanvas = forwardRef<DrawingCanvasHandle>(
    function DrawingCanvas(_props, ref) {
        const stageRef = useRef<Konva.Stage>(null);
        const [lines, setLines] = useState<LineData[]>([]);
        const isDrawingRef = useRef(false);
        const [canvasSize, setCanvasSize] = useState<number>(CANVAS_CONFIG.DEFAULT_SIZE);

        const { drawing, saveToHistory } = useGalleryStore();

        // ========== レスポンシブサイズ調整 ==========
        useEffect(() => {
            const updateSize = () => {
                const maxWidth = window.innerWidth - CANVAS_CONFIG.HORIZONTAL_PADDING;
                const newSize = Math.min(maxWidth, CANVAS_CONFIG.DEFAULT_SIZE);
                setCanvasSize(newSize);
            };

            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }, []);

        // ========== Ref API公開 ==========
        useImperativeHandle(ref, () => ({
            getImage: () => {
                if (!stageRef.current) return null;
                return stageRef.current.toDataURL({ pixelRatio: CANVAS_CONFIG.PIXEL_RATIO });
            },
            clear: () => {
                setLines([]);
            },
        }));

        // ========== タッチスクロール防止 ==========
        useEffect(() => {
            const stage = stageRef.current;
            if (!stage) return;

            const container = stage.container();
            container.style.touchAction = 'none';
        }, []);

        // ========== 描画イベントハンドラ ==========
        const handlePointerDown = useCallback(
            (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
                isDrawingRef.current = true;
                const pos = e.target.getStage()?.getPointerPosition();
                if (!pos) return;

                setLines((prev) => [
                    ...prev,
                    {
                        id: generateLineId(),
                        points: [pos.x, pos.y],
                        stroke: drawing.brushColor,
                        strokeWidth: drawing.brushSize,
                    },
                ]);
            },
            [drawing.brushColor, drawing.brushSize]
        );

        const handlePointerMove = useCallback(
            (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
                if (!isDrawingRef.current) return;

                const stage = e.target.getStage();
                const pos = stage?.getPointerPosition();
                if (!pos) return;

                setLines((prev) => {
                    if (prev.length === 0) return prev;

                    const lastLine = prev[prev.length - 1];
                    const newPoints = [...lastLine.points, pos.x, pos.y];

                    return [
                        ...prev.slice(0, -1),
                        { ...lastLine, points: newPoints },
                    ];
                });
            },
            []
        );

        const handlePointerUp = useCallback(() => {
            if (!isDrawingRef.current) return;
            isDrawingRef.current = false;

            const stage = stageRef.current;
            if (stage && lines.length > 0) {
                requestAnimationFrame(() => {
                    const dataUrl = stage.toDataURL({ pixelRatio: CANVAS_CONFIG.PIXEL_RATIO });
                    saveToHistory(dataUrl);
                });
            }
        }, [lines.length, saveToHistory]);

        // ========== レンダリング ==========
        return (
            <div className="flex justify-center">
                {/* 木枠風フレーム */}
                <div className="wood-frame">
                    <div
                        className="wood-frame-inner relative overflow-hidden"
                        style={{ width: canvasSize, height: canvasSize }}
                    >
                        {/* 描画案内（キャンバスが空の時） */}
                        {lines.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="text-center">
                                    <p className="text-[var(--color-text-muted)] text-lg font-medium select-none">
                                        ここに描いてください
                                    </p>
                                    <p className="text-[var(--color-text-muted)] text-sm mt-1 opacity-60 select-none">
                                        マウスまたはタッチで描画
                                    </p>
                                </div>
                            </div>
                        )}

                        <Stage
                            ref={stageRef}
                            width={canvasSize}
                            height={canvasSize}
                            onMouseDown={handlePointerDown}
                            onMouseMove={handlePointerMove}
                            onMouseUp={handlePointerUp}
                            onMouseLeave={handlePointerUp}
                            onTouchStart={handlePointerDown}
                            onTouchMove={handlePointerMove}
                            onTouchEnd={handlePointerUp}
                            className="cursor-crosshair"
                        >
                            <Layer>
                                {/* 背景レイヤー（toDataURLに含まれるよう実体として描画） */}
                                <Rect
                                    x={0}
                                    y={0}
                                    width={canvasSize}
                                    height={canvasSize}
                                    fill="#FFFCF8"
                                />
                                {lines.map((line) => (
                                    <Line
                                        key={line.id}
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
            </div>
        );
    }
);
