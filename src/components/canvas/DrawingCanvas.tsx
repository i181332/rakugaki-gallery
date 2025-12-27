// src/components/canvas/DrawingCanvas.tsx
'use client';

/**
 * 描画キャンバスコンポーネント
 * UI.htmlの設計に100%忠実な実装
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

interface LineData {
  id: number;
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface HistoryState {
  lines: LineData[];
}

interface DrawingCanvasProps {
  brushColor: string;
  brushSize: number;
  tool: 'pencil' | 'eraser' | 'fill';
  onHistoryChange?: (canUndo: boolean, canRedo: boolean, hasContent: boolean) => void;
}

export interface DrawingCanvasHandle {
  getImage: () => string | null;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

let lineIdCounter = 0;
function generateLineId(): number {
  return ++lineIdCounter;
}

const MAX_HISTORY = 50;

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ brushColor, brushSize, tool, onHistoryChange }, ref) {
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<LineData[]>([]);
    const isDrawingRef = useRef(false);

    const [history, setHistory] = useState<HistoryState[]>([{ lines: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

    // レスポンシブサイズ調整
    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // 親要素のサイズに完全にフィット
          setCanvasSize({
            width: rect.width,
            height: rect.height
          });
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      const resizeObserver = new ResizeObserver(updateSize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        window.removeEventListener('resize', updateSize);
        resizeObserver.disconnect();
      };
    }, []);

    // 履歴変更通知
    useEffect(() => {
      const canUndo = historyIndex > 0;
      const canRedo = historyIndex < history.length - 1;
      const hasContent = lines.length > 0;
      onHistoryChange?.(canUndo, canRedo, hasContent);
    }, [historyIndex, history.length, lines.length, onHistoryChange]);

    // 履歴に保存
    const saveToHistory = useCallback((newLines: LineData[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ lines: newLines });
        if (newHistory.length > MAX_HISTORY) {
          return newHistory.slice(-MAX_HISTORY);
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    }, [historyIndex]);

    // Ref API公開
    useImperativeHandle(ref, () => ({
      getImage: () => {
        if (!stageRef.current) return null;
        return stageRef.current.toDataURL({ pixelRatio: 2 });
      },
      clear: () => {
        setLines([]);
        saveToHistory([]);
      },
      undo: () => {
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setLines(history[newIndex].lines);
        }
      },
      redo: () => {
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setLines(history[newIndex].lines);
        }
      },
    }));

    // タッチスクロール防止
    useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const container = stage.container();
      container.style.touchAction = 'none';
    }, []);

    // 描画開始
    const handlePointerDown = useCallback(
      (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (tool === 'fill') return;

        isDrawingRef.current = true;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        const newLine: LineData = {
          id: generateLineId(),
          points: [pos.x, pos.y],
          stroke: tool === 'eraser' ? '#ffffff' : brushColor,
          strokeWidth: brushSize,
        };

        setLines((prev) => [...prev, newLine]);
      },
      [brushColor, brushSize, tool]
    );

    // 描画中
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

    // 描画終了
    const handlePointerUp = useCallback(() => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      setLines((currentLines) => {
        if (currentLines.length > 0) {
          saveToHistory(currentLines);
        }
        return currentLines;
      });
    }, [saveToHistory]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0"
      >
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
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
            <Rect
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              fill="#ffffff"
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
    );
  }
);
