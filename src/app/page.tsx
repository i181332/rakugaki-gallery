// src/app/page.tsx
'use client';

import React, { useRef, useCallback, useState } from 'react';
import { DrawingCanvas, type DrawingCanvasHandle } from '@/components/canvas/DrawingCanvas';
import {
  useGalleryStore,
  useCurrentScreen,
  useError,
  useCurrentArtwork,
  useArtistName,
  useAvatarSeed,
} from '@/stores/galleryStore';
import type { EvaluateRequest, EvaluateResponse, EvaluateErrorResponse } from '@/types';

export default function HomePage() {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentScreen = useCurrentScreen();
  const error = useError();
  const currentArtwork = useCurrentArtwork();
  const artistName = useArtistName();
  const avatarSeed = useAvatarSeed();
  const {
    setScreen,
    setCurrentArtwork,
    setError,
    reset,
    setArtistName,
    setAvatarSeed,
    undo,
    redo,
    clearCanvas,
    setBrushColor,
    drawing,
  } = useGalleryStore();

  const handleSubmit = useCallback(async () => {
    const image = canvasRef.current?.getImage();
    if (!image) {
      setError('キャンバスに何か描いてください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setScreen('evaluating');

    try {
      const { artworkHistory } = useGalleryStore.getState();
      const lastArtwork = artworkHistory[artworkHistory.length - 1];

      const requestBody: EvaluateRequest = {
        image,
        previousWork: lastArtwork
          ? {
              id: lastArtwork.id,
              title: lastArtwork.evaluation.title,
              artist: lastArtwork.evaluation.artist,
              critique: lastArtwork.evaluation.critique,
              price: lastArtwork.evaluation.price,
              seriesNumber: lastArtwork.seriesNumber,
            }
          : undefined,
      };

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: EvaluateResponse | EvaluateErrorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setCurrentArtwork(data.artwork);
      setScreen('gallery');
    } catch (err) {
      console.error('[HomePage] Submit error:', err);
      setError(
        err instanceof Error
          ? err.message
          : '評論の生成に失敗しました。もう一度お試しください。'
      );
      setScreen('drawing');
    } finally {
      setIsSubmitting(false);
    }
  }, [setScreen, setCurrentArtwork, setError]);

  const handleNewArtwork = useCallback(() => {
    canvasRef.current?.clear();
    reset();
  }, [reset]);

  const handleContinue = useCallback(() => {
    canvasRef.current?.clear();
    setScreen('drawing');
    setError(null);
  }, [setScreen, setError]);

  const handleRefreshAvatar = useCallback(() => {
    const seeds = ['Felix', 'Aneka', 'Milo', 'Jasper', 'Luna', 'Oliver', 'Bella', 'Max', 'Coco', 'Rocky'];
    const newSeed = seeds[Math.floor(Math.random() * seeds.length)];
    setAvatarSeed(newSeed);
  }, [setAvatarSeed]);

  const colors = [
    { color: '#1e293b', label: '黒' },
    { color: '#f87171', label: '赤' },
    { color: '#60a5fa', label: '青' },
    { color: '#4ade80', label: '緑' },
    { color: '#fde047', label: '黄' },
    { color: '#e2e8f0', label: '白' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="bg-slate-50 text-slate-600 h-screen overflow-hidden flex flex-col items-center justify-center p-6">
      {/* ログイン画面 */}
      {currentScreen === 'login' && (
        <div className="w-full max-w-md flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              <span className="text-indigo-500">Rakugaki</span> Gallery
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-bold">キミの落書きが、名画になる。</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group cursor-pointer" onClick={handleRefreshAvatar}>
                <div className="w-24 h-24 bg-indigo-100 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`}
                    alt="Avatar"
                    className="w-20 h-20"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-500 transition">
                  <i className="fas fa-sync-alt text-xs"></i>
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="nickname" className="block text-xs font-bold text-slate-400 mb-2 ml-2">
                  アーティスト名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nickname"
                    placeholder="名前を入力..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pl-10 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                  />
                  <i className="fas fa-palette absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
              </div>
              <button
                onClick={() => setScreen('drawing')}
                className="w-full bg-slate-800 hover:bg-indigo-600 text-white rounded-2xl py-4 font-extrabold text-lg shadow-lg shadow-indigo-200 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <i className="fas fa-play"></i>START
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 描画画面 */}
      {currentScreen === 'drawing' && (
        <div className="w-full max-w-6xl h-full max-h-[800px] flex gap-6">
          {/* 左サイドバー */}
          <div className="w-20 flex flex-col gap-4">
            <div className="bg-white rounded-2xl py-4 flex flex-col items-center gap-4 shadow-sm border border-slate-100">
              <button
                className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center text-xl shadow-sm transition"
                aria-label="鉛筆"
              >
                <i className="fas fa-pencil-alt"></i>
              </button>
              <button
                className="w-12 h-12 text-slate-400 hover:bg-slate-50 rounded-xl flex items-center justify-center text-xl transition"
                aria-label="消しゴム"
              >
                <i className="fas fa-eraser"></i>
              </button>
              <button
                className="w-12 h-12 text-slate-400 hover:bg-slate-50 rounded-xl flex items-center justify-center text-xl transition"
                aria-label="塗りつぶし"
              >
                <i className="fas fa-fill-drip"></i>
              </button>
              <div className="h-px w-10 bg-slate-100 my-1"></div>
              <div className="w-2 h-20 bg-slate-100 rounded-full relative cursor-pointer group" aria-label="サイズ調整">
                <div
                  className="absolute bottom-0 w-full bg-indigo-300 rounded-full group-hover:bg-indigo-400 transition"
                  style={{ height: '50%' }}
                ></div>
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-indigo-300 rounded-full shadow-sm"
                  style={{ bottom: 'calc(50% - 8px)' }}
                ></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl py-4 flex flex-col items-center gap-3 flex-grow shadow-sm border border-slate-100 overflow-y-auto">
              {colors.map((c, i) => (
                <button
                  key={c.color}
                  className={`w-10 h-10 rounded-full transition ${
                    i === 0
                      ? 'ring-2 ring-offset-2 ring-slate-300 shadow-sm transform scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.color }}
                  aria-label={c.label}
                  onClick={() => setBrushColor(c.color)}
                ></button>
              ))}
            </div>
          </div>

          {/* キャンバス */}
          <div className="flex-grow bg-white rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
            <DrawingCanvas ref={canvasRef} />
          </div>

          {/* 右サイドバー */}
          <div className="w-20 flex flex-col justify-between h-full">
            <div className="bg-white rounded-2xl py-4 flex flex-col items-center gap-4 shadow-sm border border-slate-100">
              <button
                className="w-12 h-12 text-slate-500 hover:bg-slate-50 rounded-full transition"
                title="元に戻す"
                onClick={undo}
              >
                <i className="fas fa-undo"></i>
              </button>
              <button
                className="w-12 h-12 text-slate-500 hover:bg-slate-50 rounded-full transition"
                title="やり直す"
                onClick={redo}
              >
                <i className="fas fa-redo"></i>
              </button>
              <button
                className="w-12 h-12 text-rose-400 hover:bg-rose-50 rounded-full mt-2 transition"
                title="全消去"
                onClick={() => {
                  canvasRef.current?.clear();
                  clearCanvas();
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              {error && (
                <div className="text-xs text-red-500 text-center mb-2">{error}</div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-20 h-20 bg-emerald-400 hover:bg-emerald-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-200 transition transform hover:-translate-y-1 disabled:opacity-50"
              >
                <i className="fas fa-check text-2xl mb-1"></i>
                <span className="text-[10px] font-bold">完成</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ローディング画面 */}
      {currentScreen === 'evaluating' && (
        <div className="w-full max-w-md flex flex-col items-center justify-center gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-indigo-50 w-full text-center flex flex-col items-center">
            <div className="mb-8 flex flex-col items-center">
              <div className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4">
                🎨 Rakugaki Gallery
              </div>
              <div className="relative">
                <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center text-6xl relative z-10">
                  🧐
                </div>
                <div
                  className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"
                  style={{ animationDuration: '1.5s' }}
                ></div>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-4 animate-pulse">評論家が鑑定中..</h2>
            <div className="mb-8">
              <p className="serif-font text-xl text-indigo-600 italic font-bold leading-relaxed">
                「美術界に激震が走るだろう...」
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-full">
              <i className="fas fa-pen-fancy text-indigo-400"></i>
              <span>ジャン＝ピエール・デュボワ氏が評論を執筆しています</span>
              <div className="flex gap-1 ml-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 結果画面 */}
      {currentScreen === 'gallery' && currentArtwork && (
        <div className="w-full max-w-6xl h-full max-h-[800px] flex gap-8 items-center">
          {/* 左カラム */}
          <div className="flex-1 flex flex-col gap-6 h-full">
            <div className="flex justify-center items-end pb-2">
              <div className="bg-white px-8 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                  <i className="fas fa-user"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Artist</span>
                  <span className="text-sm font-bold text-slate-700">{artistName}</span>
                </div>
              </div>
            </div>
            <div className="flex-grow flex items-center justify-center relative p-4">
              <div className="museum-frame w-full h-full flex items-center justify-center">
                <div className="museum-frame-inner-gold w-full h-full">
                  <div className="museum-mat w-full h-full p-8 flex items-center justify-center">
                    <div className="bg-white w-full h-full shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 relative">
                      <img
                        src={currentArtwork.image}
                        alt={currentArtwork.evaluation.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setScreen('drawing')}
                className="px-6 py-3 bg-white text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition border border-slate-200 shadow-sm flex items-center gap-2"
              >
                <i className="fas fa-arrow-left"></i> 戻る
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-pen"></i> 続けて描く
              </button>
              <button
                onClick={() => setScreen('login')}
                className="flex-1 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i> 終了する
              </button>
            </div>
          </div>

          {/* 右カラム */}
          <div className="w-[420px] h-full flex flex-col gap-5 py-4">
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100 flex-grow flex flex-col relative overflow-hidden">
              <div className="mb-6">
                <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-2">
                  Rakugaki Gallery Collection
                </div>
                <h2 className="text-2xl font-bold serif-font text-slate-800">
                  「{currentArtwork.evaluation.title}」
                </h2>
              </div>
              <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <p className="serif-font text-sm leading-7 text-slate-600 text-justify">
                  {currentArtwork.evaluation.critique}
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed mt-4">
                  <i className="fas fa-quote-left text-indigo-200 text-xl block mb-2"></i>
                  {currentArtwork.evaluation.nextExpectation}
                  <div className="text-right mt-2 font-bold text-slate-400">- ジャン＝ピエール・デュボワ (AI)</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 text-white px-6 py-5 rounded-2xl shadow-lg flex justify-between items-center group cursor-default">
              <div className="text-xs text-slate-400 font-bold tracking-wider">ESTIMATED VALUE</div>
              <div className="text-3xl font-bold text-yellow-400 font-mono group-hover:scale-105 transition">
                {formatPrice(currentArtwork.evaluation.price)}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button
                className="bg-black text-white rounded-xl py-3 flex flex-col items-center justify-center hover:opacity-80 transition shadow-md"
                aria-label="Xに投稿"
                onClick={() => {
                  const text = `「${currentArtwork.evaluation.title}」\n評価額: ${formatPrice(currentArtwork.evaluation.price)}\n\n#RakugakiGallery`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </button>
              <button
                className="bg-[#06C755] text-white rounded-xl py-3 flex flex-col items-center justify-center hover:opacity-90 transition shadow-md shadow-green-100"
                aria-label="LINEで送る"
                onClick={() => {
                  const text = `「${currentArtwork.evaluation.title}」 評価額: ${formatPrice(currentArtwork.evaluation.price)}`;
                  window.open(`https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                <i className="fab fa-line text-2xl"></i>
              </button>
              <button
                className="bg-white text-slate-600 border border-slate-200 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-slate-50 transition"
                aria-label="画像を保存"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${currentArtwork.evaluation.title}.png`;
                  link.href = currentArtwork.image;
                  link.click();
                }}
              >
                <i className="fas fa-download text-xl mb-1"></i>
                <span className="text-[10px] font-bold">Save</span>
              </button>
              <button
                className="bg-white text-slate-600 border border-slate-200 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-slate-50 transition"
                aria-label="リンクをコピー"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                <i className="fas fa-link text-xl mb-1"></i>
                <span className="text-[10px] font-bold">Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
