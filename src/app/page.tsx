// src/app/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { EvaluateResponse, EvaluateErrorResponse, Artwork } from '@/types';

type Screen = 'login' | 'draw' | 'loading' | 'result';
type Tool = 'pencil' | 'eraser' | 'fill' | 'hand';

const AVATAR_SEEDS = ['Felix', 'Luna', 'Max', 'Coco', 'Oliver', 'Milo'];
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const COLORS = [
  { name: '黒', hex: '#1e293b' },
  { name: '赤', hex: '#f87171' },
  { name: '青', hex: '#60a5fa' },
  { name: '緑', hex: '#4ade80' },
  { name: '黄', hex: '#fde047' },
  { name: '白', hex: '#e2e8f0' },
];

const LOADING_QUOTES = [
  '「美術界に激震が走るだろう...」',
  '「これは...天才の所業か...」',
  '「言葉を失うほどの衝撃...」',
  '「歴史が動く瞬間に立ち会っている...」',
  '「まさに現代のダ・ヴィンチ...」',
  '「この作品は人類の宝だ...」',
  '「涙が止まらない...」',
  '「100年に一度の才能...」',
  '「美の概念が覆される...」',
  '「震えが止まらない...」',
];

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('login');
  const [artistName, setArtistName] = useState('名無しのアトリエ');
  const [avatarSeed, setAvatarSeed] = useState('Felix');

  // Drawing state
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [brushSize, setBrushSize] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Pan (hand tool) state
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Canvas initialized flag
  const canvasInitializedRef = useRef(false);

  // Loading screen state
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);

  // Result state
  const [currentArtwork, setCurrentArtwork] = useState<Artwork | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const resultScreenRef = useRef<HTMLDivElement>(null);

  // Canvas setup - 初回は初期化、戻り時は保存画像から復元
  useEffect(() => {
    if (screen === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!canvasInitializedRef.current) {
        // 初回: キャンバスを初期化
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          contextRef.current = ctx;
          saveToHistory();
          canvasInitializedRef.current = true;
        }
      } else if (ctx && imageDataUrl) {
        // 戻り時: 保存した画像から復元
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          contextRef.current = ctx;
        };
        img.src = imageDataUrl;
      }
    }
  }, [screen, imageDataUrl]);

  // Loading quote rotation
  useEffect(() => {
    if (screen === 'loading') {
      setLoadingQuoteIndex(0);
      const interval = setInterval(() => {
        setLoadingQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const saveToHistory = () => {
    if (!canvasRef.current || !contextRef.current) return;
    const imageData = contextRef.current.getImageData(
      0, 0, canvasRef.current.width, canvasRef.current.height
    );
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(imageData);
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      contextRef.current?.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      contextRef.current?.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;
    contextRef.current.fillStyle = '#ffffff';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasContent(false);
    saveToHistory();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentTool === 'fill') return;

    if (currentTool === 'hand') {
      setIsPanning(true);
      let clientX: number, clientY: number;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }
      lastPanPositionRef.current = { x: clientX, y: clientY };
      return;
    }

    setIsDrawing(true);
    const pos = getPosition(e);
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentTool === 'hand' && isPanning && lastPanPositionRef.current) {
      let clientX: number, clientY: number;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }
      const deltaX = clientX - lastPanPositionRef.current.x;
      const deltaY = clientY - lastPanPositionRef.current.y;
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      lastPanPositionRef.current = { x: clientX, y: clientY };
      return;
    }

    if (!isDrawing || currentTool === 'fill') return;
    const pos = getPosition(e);
    if (contextRef.current) {
      contextRef.current.strokeStyle = currentTool === 'eraser' ? '#ffffff' : COLORS[currentColorIndex].hex;
      contextRef.current.lineWidth = brushSize;
      contextRef.current.lineTo(pos.x, pos.y);
      contextRef.current.stroke();
      setHasContent(true);
    }
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      lastPanPositionRef.current = null;
    }
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleSliderInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let clientY: number;
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }
    const clickY = clientY - rect.top;
    const percentage = 1 - (clickY / rect.height);
    const size = Math.max(4, Math.min(24, Math.round(percentage * 24)));
    setBrushSize(size);
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    if (!canvasRef.current || !contextRef.current) return;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    const hex = fillColor.replace('#', '');
    const fillR = parseInt(hex.substring(0, 2), 16);
    const fillG = parseInt(hex.substring(2, 4), 16);
    const fillB = parseInt(hex.substring(4, 6), 16);

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const pos = (y * canvas.width + x) * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];

      const tolerance = 32;
      if (Math.abs(r - startR) > tolerance || Math.abs(g - startG) > tolerance || Math.abs(b - startB) > tolerance) continue;

      visited.add(key);
      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      data[pos + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    setHasContent(true);
    saveToHistory();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (currentTool === 'fill') {
      const pos = getPosition(e);
      floodFill(Math.floor(pos.x), Math.floor(pos.y), COLORS[currentColorIndex].hex);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * zoomFactor));

    const zoomRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - panOffset.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - panOffset.y) * zoomRatio;

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  const handleTouchStartZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else {
      startDrawing(e);
    }
  };

  const handleTouchMoveZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      const zoomFactor = distance / lastTouchDistanceRef.current;
      const newZoom = Math.max(0.5, Math.min(5, zoom * zoomFactor));

      const zoomRatio = newZoom / zoom;
      const newPanX = centerX - (centerX - panOffset.x) * zoomRatio;
      const newPanY = centerY - (centerY - panOffset.y) * zoomRatio;

      setZoom(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
      lastTouchDistanceRef.current = distance;
    } else if (e.touches.length === 1) {
      draw(e);
    }
  };

  const handleTouchEndZoom = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDistanceRef.current = null;
      lastTouchCenterRef.current = null;
    }
    if (e.touches.length === 0) {
      stopDrawing();
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleRandomAvatar = () => {
    const nextIndex = Math.floor(Math.random() * AVATAR_SEEDS.length);
    setAvatarSeed(AVATAR_SEEDS[nextIndex]);
  };

  // 完成ボタン - API呼び出し
  const handleComplete = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const base64Image = canvas.toDataURL('image/png').split(',')[1];
    setImageDataUrl(canvas.toDataURL('image/png'));

    setScreen('loading');

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, artistName }),
      });

      const data: EvaluateResponse | EvaluateErrorResponse = await response.json();

      if (data.success) {
        setCurrentArtwork(data.artwork);
        setScreen('result');
      } else {
        alert(data.error);
        setScreen('draw');
      }
    } catch (err) {
      console.error('API Error:', err);
      alert('通信エラーが発生しました');
      setScreen('draw');
    }
  };

  const sliderHeight = (brushSize / 24) * 100;

  // ログイン画面
  if (screen === 'login') {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'M PLUS Rounded 1c', sans-serif"
      }}>
        <div style={{ width: '100%', maxWidth: '448px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              <span style={{ color: '#6366f1', fontStyle: 'italic' }}>Rakugaki</span> Gallery
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px', fontWeight: 700 }}>
              キミの落書きが、名画になる。
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(226, 232, 240, 0.6)', border: '1px solid #f1f5f9', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleRandomAvatar}>
                <div style={{ width: '96px', height: '96px', backgroundColor: '#e0e7ff', borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`} alt="Avatar" style={{ width: '80px', height: '80px' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', borderRadius: '50%', padding: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', fontSize: '10px' }}>🔄</div>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', marginLeft: '8px' }}>アーティスト名</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🎨</span>
                  <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} maxLength={20} style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px 12px 40px', fontWeight: 700, color: '#334155', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button onClick={() => setScreen('draw')} disabled={!artistName.trim()} style={{ width: '100%', backgroundColor: '#1e293b', color: 'white', borderRadius: '16px', padding: '16px', fontWeight: 800, fontSize: '1.125rem', border: 'none', cursor: artistName.trim() ? 'pointer' : 'not-allowed', opacity: artistName.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                ▶ START
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 描画画面
  if (screen === 'draw') {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'M PLUS Rounded 1c', sans-serif"
      }}>
        <div style={{ width: '100%', maxWidth: '1152px', height: 'calc(100vh - 48px)', maxHeight: '800px', display: 'flex', gap: '24px' }}>

          {/* 左サイドバー */}
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ツールパネル */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              {/* 鉛筆 */}
              <button onClick={() => setCurrentTool('pencil')} style={{ width: '48px', height: '48px', backgroundColor: currentTool === 'pencil' ? '#e0e7ff' : 'transparent', color: currentTool === 'pencil' ? '#6366f1' : '#94a3b8', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✏️</button>
              {/* 消しゴム */}
              <button onClick={() => setCurrentTool('eraser')} style={{ width: '48px', height: '48px', backgroundColor: currentTool === 'eraser' ? '#e0e7ff' : 'transparent', color: currentTool === 'eraser' ? '#6366f1' : '#94a3b8', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 21h10" />
                  <path d="M5.5 11.5L16 2l6 6-10.5 10.5c-.83.83-2.17.83-3 0L5.5 15.5a2.12 2.12 0 0 1 0-3Z" />
                  <path d="M18.5 5.5 8 16" />
                </svg>
              </button>
              {/* 塗りつぶし */}
              <button onClick={() => setCurrentTool('fill')} style={{ width: '48px', height: '48px', backgroundColor: currentTool === 'fill' ? '#e0e7ff' : 'transparent', color: currentTool === 'fill' ? '#6366f1' : '#94a3b8', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🪣</button>
              {/* ハンドツール */}
              <button onClick={() => setCurrentTool('hand')} style={{ width: '48px', height: '48px', backgroundColor: currentTool === 'hand' ? '#e0e7ff' : 'transparent', color: currentTool === 'hand' ? '#6366f1' : '#94a3b8', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✋</button>
              {/* 区切り線 */}
              <div style={{ height: '1px', width: '40px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />
              {/* サイズスライダー */}
              <div
                onClick={handleSliderInteraction}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const updateSize = (clientY: number) => {
                    const clickY = clientY - rect.top;
                    const percentage = Math.max(0, Math.min(1, 1 - (clickY / rect.height)));
                    const size = Math.max(4, Math.min(24, Math.round(percentage * 24)));
                    setBrushSize(size);
                  };
                  updateSize(e.clientY);
                  const onMove = (ev: MouseEvent) => updateSize(ev.clientY);
                  const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
                style={{ width: '8px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '9999px', position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${sliderHeight}%`, backgroundColor: '#a5b4fc', borderRadius: '9999px' }} />
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: `calc(${sliderHeight}% - 8px)`, width: '16px', height: '16px', backgroundColor: 'white', border: '2px solid #a5b4fc', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
            {/* カラーパレット */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flexGrow: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              {COLORS.map((color, index) => (
                <button key={color.hex} onClick={() => { setCurrentColorIndex(index); if (currentTool === 'eraser') setCurrentTool('pencil'); }} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: color.hex, border: 'none', cursor: 'pointer', transform: currentColorIndex === index ? 'scale(1.1)' : 'scale(1)', boxShadow: currentColorIndex === index ? '0 0 0 2px white, 0 0 0 4px #cbd5e1' : 'none', transition: 'transform 0.15s' }} />
              ))}
            </div>
          </div>

          {/* 中央キャンバス */}
          <div style={{ flexGrow: 1, backgroundColor: '#f1f5f9', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden', cursor: currentTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair' }}>
            {/* 背景アイコン */}
            {!hasContent && zoom === 1 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
                <span style={{ fontSize: '144px', opacity: 0.1, color: '#94a3b8' }}>🖌️</span>
              </div>
            )}
            {/* キャンバスサイズ・ズーム表示 */}
            <div style={{ position: 'absolute', bottom: '16px', left: '24px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', userSelect: 'none', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>CANVAS 1920x1080</span>
              {zoom !== 1 && (
                <button onClick={resetZoom} style={{ backgroundColor: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  {Math.round(zoom * 100)}% ✕
                </button>
              )}
            </div>
            {/* 実際のキャンバス */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onWheel={handleWheel}
              onTouchStart={handleTouchStartZoom}
              onTouchMove={handleTouchMoveZoom}
              onTouchEnd={handleTouchEndZoom}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                display: 'block',
                margin: 'auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom})`,
                transformOrigin: 'center center',
                backgroundColor: 'white',
              }}
            />
          </div>

          {/* 右サイドバー */}
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {/* Undo/Redo/Clear */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <button onClick={undo} style={{ width: '48px', height: '48px', backgroundColor: 'transparent', color: '#64748b', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '18px' }}>↩️</button>
              <button onClick={redo} style={{ width: '48px', height: '48px', backgroundColor: 'transparent', color: '#64748b', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '18px' }}>↪️</button>
              <button onClick={clearCanvas} style={{ width: '48px', height: '48px', backgroundColor: 'transparent', color: '#f87171', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '18px', marginTop: '8px' }}>🗑️</button>
            </div>
            {/* 完成ボタン */}
            <div style={{ marginTop: 'auto' }}>
              <button onClick={handleComplete} style={{ width: '80px', height: '80px', backgroundColor: '#4ade80', color: 'white', borderRadius: '16px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(134, 239, 172, 0.5)', fontSize: '24px' }}>
                ✓
                <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>完成</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ローディング画面
  if (screen === 'loading') {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'M PLUS Rounded 1c', sans-serif"
      }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(129, 140, 248, 0.5)',
          border: '1px solid #eef2ff',
          width: '100%',
          maxWidth: '448px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#818cf8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              🎨 Rakugaki Gallery
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '112px',
                height: '112px',
                backgroundColor: '#eef2ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                position: 'relative',
                zIndex: 10
              }}>
                🧐
              </div>
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '4px solid #e0e7ff',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 1.5s linear infinite'
              }} />
            </div>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '16px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            評論家が鑑定中..
          </h2>

          <div style={{ marginBottom: '32px', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
            <p style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: '20px',
              color: '#4f46e5',
              fontStyle: 'italic',
              fontWeight: 700,
              lineHeight: 1.6,
              transition: 'opacity 0.3s ease-in-out'
            }}>
              {LOADING_QUOTES[loadingQuoteIndex]}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: '#f8fafc',
            padding: '8px 16px',
            borderRadius: '9999px',
            flexWrap: 'wrap'
          }}>
            <span style={{ color: '#818cf8' }}>✏️</span>
            <span style={{ textAlign: 'center' }}>
              ジャン＝ピエール・デュボワ氏が<br />評論を執筆しています
            </span>
            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#818cf8',
                borderRadius: '50%',
                animation: 'bounce 1s ease-in-out infinite',
                animationDelay: '0s'
              }} />
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#818cf8',
                borderRadius: '50%',
                animation: 'bounce 1s ease-in-out infinite',
                animationDelay: '0.1s'
              }} />
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#818cf8',
                borderRadius: '50%',
                animation: 'bounce 1s ease-in-out infinite',
                animationDelay: '0.2s'
              }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 結果画面 - UI.htmlに100%忠実な実装
  if (screen === 'result' && currentArtwork) {
    const formatPrice = (price: number) => {
      return '¥' + price.toLocaleString();
    };

    // 結果画面全体をキャプチャしてシェア
    const captureResultScreen = async (): Promise<string | null> => {
      if (!resultScreenRef.current) return null;
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(resultScreenRef.current, {
          backgroundColor: '#f8fafc',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        return canvas.toDataURL('image/png', 0.95);
      } catch (err) {
        console.error('Failed to capture result screen:', err);
        return null;
      }
    };

    const handleShare = async (platform: 'x' | 'line') => {
      const text = `「${currentArtwork.evaluation.title}」\n評価額: ${formatPrice(currentArtwork.evaluation.price)}\n#RakugakiGallery`;
      const url = window.location.href;
      if (platform === 'x') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      } else {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      }
    };

    const handleSaveImage = async () => {
      const capturedImage = await captureResultScreen();
      if (capturedImage) {
        const link = document.createElement('a');
        link.download = `rakugaki-${currentArtwork.id}.png`;
        link.href = capturedImage;
        link.click();
      } else if (imageDataUrl) {
        // フォールバック: キャプチャ失敗時は元の画像を保存
        const link = document.createElement('a');
        link.download = `rakugaki-${currentArtwork.id}.png`;
        link.href = imageDataUrl;
        link.click();
      }
    };

    const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました');
    };

    return (
      <div style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'M PLUS Rounded 1c', sans-serif"
      }}>
        <div
          ref={resultScreenRef}
          style={{
            width: '100%',
            maxWidth: '1152px',
            height: 'calc(100vh - 48px)',
            maxHeight: '800px',
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '24px'
          }}>
          {/* 左側: アートワーク表示 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            {/* アーティストバッジ */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '8px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '8px 32px',
                borderRadius: '9999px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`}
                    alt="Avatar"
                    style={{ width: '28px', height: '28px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Artist</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{artistName}</span>
                </div>
              </div>
            </div>

            {/* ミュージアムフレーム */}
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '16px' }}>
              <div style={{
                backgroundColor: '#4a3b32',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 4px 8px rgba(255, 255, 255, 0.1), inset 0 -4px 8px rgba(0, 0, 0, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7)',
                  padding: '3px',
                  borderRadius: '4px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
                  width: '100%',
                  height: '100%'
                }}>
                  <div style={{
                    backgroundColor: '#fdfbf7',
                    boxShadow: 'inset 0 6px 15px rgba(0, 0, 0, 0.2)',
                    borderRadius: '2px',
                    padding: '32px',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      width: '100%',
                      height: '100%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #f1f5f9'
                    }}>
                      {imageDataUrl && (
                        <img
                          src={imageDataUrl}
                          alt="Your artwork"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setScreen('login')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#64748b',
                  borderRadius: '12px',
                  fontWeight: 700,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← 戻る
              </button>
              <button
                onClick={() => setScreen('draw')}
                style={{
                  flex: 1,
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  borderRadius: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ✏️ 続けて描く
              </button>
              <button
                onClick={() => setScreen('login')}
                style={{
                  flex: 1,
                  backgroundColor: '#1e293b',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(148, 163, 184, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🚪 終了する
              </button>
            </div>
          </div>

          {/* 右側: 評論パネル */}
          <div style={{ width: '420px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 0' }}>
            {/* 評論カード */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(226, 232, 240, 0.6)',
              border: '1px solid #f1f5f9',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* ヘッダー */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#818cf8',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Rakugaki Gallery Collection
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: "'Noto Serif JP', serif",
                  color: '#1e293b'
                }}>
                  「{currentArtwork.evaluation.title}」
                </h2>
              </div>

              {/* 評論テキスト */}
              <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '8px' }}>
                <p style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: '14px',
                  lineHeight: '28px',
                  color: '#475569',
                  textAlign: 'justify',
                  marginBottom: '16px'
                }}>
                  {currentArtwork.evaluation.critique}
                </p>

                {/* 次回作への期待（引用ボックス） */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  fontSize: '12px',
                  color: '#64748b',
                  lineHeight: '20px',
                  marginTop: '16px'
                }}>
                  <span style={{ color: '#c7d2fe', fontSize: '24px', display: 'block', marginBottom: '8px' }}>❝</span>
                  {currentArtwork.evaluation.nextExpectation}
                  <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: 700, color: '#94a3b8' }}>
                    - ジャン＝ピエール・デュボワ (AI)
                  </div>
                </div>
              </div>
            </div>

            {/* 価格表示 */}
            <div style={{
              backgroundColor: '#1e293b',
              color: 'white',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                ESTIMATED VALUE
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#facc15',
                fontFamily: 'monospace'
              }}>
                {formatPrice(currentArtwork.evaluation.price)}
              </div>
            </div>

            {/* シェアボタン */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {/* X (Twitter) */}
              <button
                onClick={() => handleShare('x')}
                style={{
                  backgroundColor: '#000000',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'currentColor' }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              {/* LINE */}
              <button
                onClick={() => handleShare('line')}
                style={{
                  backgroundColor: '#06C755',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(6, 199, 85, 0.3)'
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: 'currentColor' }}>
                  <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.63 1.34 4.98 3.43 6.54.17.13.27.33.27.54 0 .13-.03.26-.08.38-.26.6-.68 1.5-1.12 2.37-.1.2-.02.45.18.54.1.05.2.07.3.07.15 0 .3-.06.41-.17 1.32-1.32 3.02-2.4 3.9-2.82.3-.14.64-.22.98-.22.23 0 .46.02.68.06.57.08 1.16.13 1.75.13 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"/>
                </svg>
              </button>
              {/* Save */}
              <button
                onClick={handleSaveImage}
                style={{
                  backgroundColor: 'white',
                  color: '#475569',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '20px', marginBottom: '4px' }}>⬇️</span>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>Save</span>
              </button>
              {/* Link */}
              <button
                onClick={handleCopyLink}
                style={{
                  backgroundColor: 'white',
                  color: '#475569',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '20px', marginBottom: '4px' }}>🔗</span>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // フォールバック
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'M PLUS Rounded 1c', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>画面: {screen}</p>
        <button onClick={() => setScreen('login')} style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          ログインに戻る
        </button>
      </div>
    </div>
  );
}
