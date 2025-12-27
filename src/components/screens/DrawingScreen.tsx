// src/components/screens/DrawingScreen.tsx
'use client';

/**
 * 描画画面
 * UI.htmlの設計に100%忠実な実装
 * すべてのクラス名・値はUI.htmlから直接コピー
 */

import React, { useRef, useCallback, useState } from 'react';
import { DrawingCanvas, DrawingCanvasHandle } from '../canvas/DrawingCanvas';

interface DrawingScreenProps {
  onComplete: (imageData: string) => void;
}

type Tool = 'pencil' | 'eraser' | 'fill';

// UI.htmlから完全コピーした色
const COLOR_PALETTE = [
  { color: 'bg-slate-800', hex: '#1e293b' },   // 黒
  { color: 'bg-red-400', hex: '#f87171' },     // 赤
  { color: 'bg-blue-400', hex: '#60a5fa' },    // 青
  { color: 'bg-green-400', hex: '#4ade80' },   // 緑
  { color: 'bg-yellow-300', hex: '#fde047' },  // 黄
  { color: 'bg-slate-200', hex: '#e2e8f0' },   // 白
];

const BRUSH_SIZES = [4, 8, 12, 20];

export function DrawingScreen({ onComplete }: DrawingScreenProps) {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [brushSize, setBrushSize] = useState(8);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const handleHistoryChange = useCallback(
    (canUndoNow: boolean, canRedoNow: boolean, hasContent: boolean) => {
      setCanUndo(canUndoNow);
      setCanRedo(canRedoNow);
      setHasDrawing(hasContent);
    },
    []
  );

  const handleToolSelect = useCallback((tool: Tool) => {
    setCurrentTool(tool);
  }, []);

  const handleColorSelect = useCallback((index: number) => {
    setCurrentColorIndex(index);
    if (currentTool === 'eraser') {
      setCurrentTool('pencil');
    }
  }, [currentTool]);

  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = 1 - clickY / rect.height;
    const sizeIndex = Math.min(
      Math.floor(percentage * BRUSH_SIZES.length),
      BRUSH_SIZES.length - 1
    );
    setBrushSize(BRUSH_SIZES[Math.max(0, sizeIndex)]);
  }, []);

  const handleUndo = useCallback(() => canvasRef.current?.undo(), []);
  const handleRedo = useCallback(() => canvasRef.current?.redo(), []);
  const handleClear = useCallback(() => {
    if (window.confirm('キャンバスをクリアしますか？')) {
      canvasRef.current?.clear();
    }
  }, []);

  const handleComplete = useCallback(() => {
    const imageData = canvasRef.current?.getImage();
    if (imageData && hasDrawing) {
      onComplete(imageData);
    }
  }, [hasDrawing, onComplete]);

  const sliderHeight = ((BRUSH_SIZES.indexOf(brushSize) + 1) / BRUSH_SIZES.length) * 100;
  const currentColor = currentTool === 'eraser' ? '#ffffff' : COLOR_PALETTE[currentColorIndex].hex;

  return (
    // UI.html: class="w-full max-w-6xl h-full max-h-[800px] flex gap-6 transition-all duration-300"
    <div className="w-full max-w-6xl h-full max-h-[800px] flex gap-6 transition-all duration-300">

      {/* === 左サイドバー === */}
      {/* UI.html: class="w-20 flex flex-col gap-4" */}
      <div className="w-20 flex flex-col gap-4">

        {/* ツールパネル */}
        {/* UI.html: class="bg-white rounded-2xl py-4 flex flex-col items-center gap-4 shadow-sm border border-slate-100" */}
        <div className="bg-white rounded-2xl py-4 flex flex-col items-center gap-4 shadow-sm border border-slate-100">

          {/* 鉛筆 - UI.html: active時 class="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center text-xl shadow-sm transition" */}
          <button
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition ${
              currentTool === 'pencil'
                ? 'bg-indigo-100 text-indigo-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
            onClick={() => handleToolSelect('pencil')}
            aria-label="鉛筆"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
              <path d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"/>
            </svg>
          </button>

          {/* 消しゴム - UI.html: class="w-12 h-12 text-slate-400 hover:bg-slate-50 rounded-xl flex items-center justify-center text-xl transition" */}
          <button
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition ${
              currentTool === 'eraser'
                ? 'bg-indigo-100 text-indigo-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
            onClick={() => handleToolSelect('eraser')}
            aria-label="消しゴム"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
              <path d="M497.941 273.941c18.745-18.745 18.745-49.137 0-67.882l-160-160c-18.745-18.745-49.136-18.746-67.883 0l-256 256c-18.745 18.745-18.745 49.137 0 67.882l96 96A48.004 48.004 0 0 0 144 480h356c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12H355.883l142.058-142.059zm-302.627-62.627l137.373 137.373L265.373 416H150.628l-80-80 124.686-124.686z"/>
            </svg>
          </button>

          {/* 塗りつぶし - UI.html: class="w-12 h-12 text-slate-400 hover:bg-slate-50 rounded-xl flex items-center justify-center text-xl transition" */}
          <button
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition ${
              currentTool === 'fill'
                ? 'bg-indigo-100 text-indigo-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
            onClick={() => handleToolSelect('fill')}
            aria-label="塗りつぶし"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 576 512">
              <path d="M512 320s-64 92.65-64 128c0 35.35 28.66 64 64 64s64-28.65 64-64-64-128-64-128zm-9.37-102.94L294.94 9.37C288.69 3.12 280.5 0 272.31 0s-16.38 3.12-22.62 9.37l-81.58 81.58L81.93 4.76c-6.25-6.25-16.38-6.25-22.62 0L36.69 27.38c-6.25 6.25-6.25 16.38 0 22.62l86.19 86.18-94.76 94.76c-37.49 37.48-37.49 98.26 0 135.75l117.19 117.19c18.74 18.74 43.31 28.12 67.87 28.12 24.57 0 49.13-9.37 67.87-28.12l221.57-221.57c12.5-12.5 12.5-32.75.01-45.25zm-116.22 70.97H65.93c1.36-3.84 3.57-7.98 7.43-11.83l13.15-13.15 81.61-81.61 58.6 58.6c12.49 12.49 32.75 12.49 45.24 0s12.49-32.75 0-45.24l-58.6-58.6 58.95-58.95 162.44 162.44-48.34 48.34z"/>
            </svg>
          </button>

          {/* 区切り線 - UI.html: class="h-px w-10 bg-slate-100 my-1" */}
          <div className="h-px w-10 bg-slate-100 my-1" />

          {/* サイズスライダー - UI.html: class="w-2 h-20 bg-slate-100 rounded-full relative cursor-pointer group" */}
          <div
            className="w-2 h-20 bg-slate-100 rounded-full relative cursor-pointer group"
            onClick={handleSliderClick}
            aria-label="サイズ調整"
          >
            {/* UI.html: class="absolute bottom-0 w-full h-10 bg-indigo-300 rounded-full group-hover:bg-indigo-400 transition" */}
            <div
              className="absolute bottom-0 w-full bg-indigo-300 rounded-full group-hover:bg-indigo-400 transition"
              style={{ height: `${sliderHeight}%` }}
            />
            {/* UI.html: class="absolute bottom-9 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-indigo-300 rounded-full shadow-sm" */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-indigo-300 rounded-full shadow-sm"
              style={{ bottom: `calc(${sliderHeight}% - 8px)` }}
            />
          </div>
        </div>

        {/* カラーパレット */}
        {/* UI.html: class="bg-white rounded-2xl py-4 flex flex-col items-center gap-3 flex-grow shadow-sm border border-slate-100 overflow-y-auto no-scrollbar" */}
        <div className="bg-white rounded-2xl py-4 flex flex-col items-center gap-3 flex-grow shadow-sm border border-slate-100 overflow-y-auto no-scrollbar">
          {COLOR_PALETTE.map((item, index) => (
            <button
              key={item.hex}
              // UI.html: active時 class="w-10 h-10 rounded-full bg-slate-800 ring-2 ring-offset-2 ring-slate-300 shadow-sm transform scale-110"
              // UI.html: 非active時 class="w-10 h-10 rounded-full bg-red-400 hover:scale-110 transition"
              className={`w-10 h-10 rounded-full ${item.color} transition ${
                currentColorIndex === index
                  ? 'ring-2 ring-offset-2 ring-slate-300 shadow-sm scale-110'
                  : 'hover:scale-110'
              }`}
              onClick={() => handleColorSelect(index)}
              aria-label={`色${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* === 中央キャンバス === */}
      {/* UI.html: class="flex-grow bg-white rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden group cursor-crosshair" */}
      <div className="flex-grow bg-white rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden group cursor-crosshair">
        {/* 背景アイコン - UI.html: class="absolute inset-0 flex items-center justify-center text-slate-100 pointer-events-none" */}
        {!hasDrawing && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-100 pointer-events-none">
            {/* UI.html: class="fas fa-paint-brush text-9xl opacity-30" */}
            <svg className="w-36 h-36 opacity-30" fill="currentColor" viewBox="0 0 512 512">
              <path d="M167.02 309.34c-40.12 2.58-76.53 17.86-97.19 72.3-2.35 6.21-8 9.98-14.59 9.98-11.11 0-45.46-27.67-55.25-34.35C0 439.62 37.93 512 128 512c75.86 0 128-43.77 128-120.19 0-3.11-.65-6.08-.97-9.13l-88.01-73.34zM457.89 0c-15.16 0-29.37 6.71-40.21 16.45C213.27 199.05 192 203.34 192 257.09c0 13.7 3.25 26.76 8.73 38.7l63.82 53.18c7.21 1.8 14.64 3.03 22.39 3.03 62.11 0 98.11-45.47 211.16-256.46 7.38-14.35 13.9-29.85 13.9-45.99C512 20.64 486 0 457.89 0z"/>
            </svg>
          </div>
        )}

        {/* キャンバスサイズ表示 - UI.html: class="absolute bottom-4 left-6 text-slate-300 text-xs font-bold select-none tracking-widest" */}
        <div className="absolute bottom-4 left-6 text-slate-300 text-xs font-bold select-none tracking-widest z-10">
          CANVAS 1920x1080
        </div>

        {/* 実際のキャンバス */}
        <DrawingCanvas
          ref={canvasRef}
          brushColor={currentColor}
          brushSize={brushSize}
          tool={currentTool}
          onHistoryChange={handleHistoryChange}
        />
      </div>

      {/* === 右サイドバー === */}
      {/* UI.html: class="w-20 flex flex-col justify-between h-full" */}
      <div className="w-20 flex flex-col justify-between h-full">

        {/* Undo/Redo/クリア */}
        {/* UI.html: class="bg-white rounded-2xl py-4 flex flex-col items-center gap-4 shadow-sm border border-slate-100" */}
        <div className="bg-white rounded-2xl py-4 flex flex-col items-center gap-4 shadow-sm border border-slate-100">

          {/* Undo - UI.html: class="w-12 h-12 text-slate-500 hover:bg-slate-50 rounded-full transition" */}
          <button
            className="w-12 h-12 text-slate-500 hover:bg-slate-50 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleUndo}
            disabled={!canUndo}
            title="元に戻す"
          >
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 512 512">
              <path d="M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z"/>
            </svg>
          </button>

          {/* Redo - UI.html: class="w-12 h-12 text-slate-500 hover:bg-slate-50 rounded-full transition" */}
          <button
            className="w-12 h-12 text-slate-500 hover:bg-slate-50 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleRedo}
            disabled={!canRedo}
            title="やり直す"
          >
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 512 512">
              <path d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"/>
            </svg>
          </button>

          {/* クリア - UI.html: class="w-12 h-12 text-rose-400 hover:bg-rose-50 rounded-full mt-2 transition" */}
          <button
            className="w-12 h-12 text-rose-400 hover:bg-rose-50 rounded-full mt-2 transition disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleClear}
            disabled={!hasDrawing}
            title="全消去"
          >
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 448 512">
              <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/>
            </svg>
          </button>
        </div>

        {/* 完成ボタン */}
        {/* UI.html: class="flex flex-col gap-2 mt-auto" */}
        <div className="flex flex-col gap-2 mt-auto">
          {/* UI.html: class="w-20 h-20 bg-emerald-400 hover:bg-emerald-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-200 transition transform hover:-translate-y-1" */}
          <button
            className="w-20 h-20 bg-emerald-400 hover:bg-emerald-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-200 transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-400 disabled:hover:transform-none"
            onClick={handleComplete}
            disabled={!hasDrawing}
          >
            {/* UI.html: class="fas fa-check text-2xl mb-1" */}
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 512 512">
              <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/>
            </svg>
            {/* UI.html: class="text-[10px] font-bold" */}
            <span className="text-[10px] font-bold">完成</span>
          </button>
        </div>
      </div>
    </div>
  );
}
