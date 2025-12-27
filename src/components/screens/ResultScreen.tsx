// src/components/screens/ResultScreen.tsx
'use client';

/**
 * 結果画面
 * UI.htmlの設計に100%忠実な実装
 * すべてのクラス名・値はUI.htmlから直接コピー
 */

import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface Evaluation {
  title: string;
  artist: string;
  critique: string;
  nextExpectation: string;
  price: number;
}

interface ResultScreenProps {
  imageData: string;
  evaluation: Evaluation;
  artistName: string;
  onBack: () => void;
  onContinue: () => void;
  onExit: () => void;
}

function formatPrice(price: number): string {
  if (price >= 100_000_000) {
    return `¥${(price / 100_000_000).toFixed(0)}億`;
  }
  if (price >= 10_000) {
    return `¥${(price / 10_000).toLocaleString()}万`;
  }
  return `¥${price.toLocaleString()}`;
}

function formatPriceDisplay(price: number): string {
  return `¥${price.toLocaleString()}`;
}

export function ResultScreen({
  imageData,
  evaluation,
  artistName,
  onBack,
  onContinue,
  onExit,
}: ResultScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `rakugaki-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('画像の生成に失敗しました');
    }
  }, []);

  const handleShareX = useCallback(() => {
    const text = `私の落書きが「${evaluation.title}」として ${formatPrice(evaluation.price)} の評価を受けました！\n\n#RakugakiGallery #落書き美術館`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }, [evaluation.title, evaluation.price]);

  const handleShareLine = useCallback(() => {
    const text = `私の落書きが「${evaluation.title}」として ${formatPrice(evaluation.price)} の評価を受けました！`;
    const url = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }, [evaluation.title, evaluation.price]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('リンクをコピーしました！');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('コピーに失敗しました');
    }
  }, []);

  return (
    // UI.html: class="w-full max-w-6xl h-full max-h-[800px] flex gap-8 items-center"
    <div className="w-full max-w-6xl h-full max-h-[800px] flex gap-8 items-center">

      {/* === 左側：作品展示エリア === */}
      {/* UI.html: class="flex-1 flex flex-col gap-6 h-full" */}
      <div className="flex-1 flex flex-col gap-6 h-full">

        {/* アーティスト名バッジ */}
        {/* UI.html: class="flex justify-center items-end pb-2" */}
        <div className="flex justify-center items-end pb-2">
          {/* UI.html: class="bg-white px-8 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-3" */}
          <div className="bg-white px-8 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-3">
            {/* UI.html: class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500" */}
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              {/* UI.html: class="text-[10px] text-slate-400 font-bold uppercase tracking-wider" */}
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Artist
              </span>
              {/* UI.html: class="text-sm font-bold text-slate-700" */}
              <span className="text-sm font-bold text-slate-700">
                {artistName}
              </span>
            </div>
          </div>
        </div>

        {/* 美術館フレーム */}
        {/* UI.html: class="flex-grow flex items-center justify-center relative p-4" */}
        <div className="flex-grow flex items-center justify-center relative p-4" ref={cardRef}>
          {/* UI.html: class="museum-frame w-full h-full flex items-center justify-center" */}
          <div className="museum-frame w-full h-full flex items-center justify-center">
            {/* UI.html: class="museum-frame-inner-gold w-full h-full" */}
            <div className="museum-frame-inner-gold w-full h-full">
              {/* UI.html: class="museum-mat w-full h-full p-8 flex items-center justify-center" */}
              <div className="museum-mat w-full h-full p-8 flex items-center justify-center">
                {/* UI.html: class="bg-white w-full h-full shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 relative" */}
                <div className="bg-white w-full h-full shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 relative">
                  <img
                    src={imageData}
                    alt={evaluation.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        {/* UI.html: class="flex gap-4" */}
        <div className="flex gap-4">
          {/* 戻る - UI.html: class="px-6 py-3 bg-white text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition border border-slate-200 shadow-sm flex items-center gap-2" */}
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition border border-slate-200 shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
              <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"/>
            </svg>
            戻る
          </button>

          {/* 続けて描く - UI.html: class="flex-1 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2" */}
          <button
            onClick={onContinue}
            className="flex-1 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2 py-3"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
              <path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z"/>
            </svg>
            続けて描く
          </button>

          {/* 終了する - UI.html: class="flex-1 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-300 flex items-center justify-center gap-2" */}
          <button
            onClick={onExit}
            className="flex-1 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-300 flex items-center justify-center gap-2 py-3"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
              <path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/>
            </svg>
            終了する
          </button>
        </div>
      </div>

      {/* === 右側：評論パネル === */}
      {/* UI.html: class="w-[420px] h-full flex flex-col gap-5 py-4" */}
      <div className="w-[420px] h-full flex flex-col gap-5 py-4">

        {/* 評論カード */}
        {/* UI.html: class="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100 flex-grow flex flex-col relative overflow-hidden" */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100 flex-grow flex flex-col relative overflow-hidden">

          {/* ヘッダー */}
          {/* UI.html: class="mb-6" */}
          <div className="mb-6">
            {/* UI.html: class="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-2" */}
            <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-2">
              Rakugaki Gallery Collection
            </div>
            {/* UI.html: class="text-2xl font-bold serif-font text-slate-800" */}
            <h2 className="text-2xl font-bold serif-font text-slate-800">
              「{evaluation.title}」
            </h2>
          </div>

          {/* 評論文 */}
          {/* UI.html: class="flex-grow overflow-y-auto pr-2 space-y-4" */}
          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {/* UI.html: class="serif-font text-sm leading-7 text-slate-600 text-justify" */}
            <p className="serif-font text-sm leading-7 text-slate-600 text-justify">
              {evaluation.critique}
            </p>

            {/* 次回作への期待（引用スタイル） */}
            {/* UI.html: class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed mt-4" */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed mt-4">
              {/* UI.html: class="fas fa-quote-left text-indigo-200 text-xl block mb-2" */}
              <svg className="w-5 h-5 text-indigo-200 mb-2" fill="currentColor" viewBox="0 0 512 512">
                <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"/>
              </svg>
              {evaluation.nextExpectation}
              {/* UI.html: class="text-right mt-2 font-bold text-slate-400" */}
              <div className="text-right mt-2 font-bold text-slate-400">
                - ジャン＝ピエール・デュボワ (AI)
              </div>
            </div>
          </div>
        </div>

        {/* 価格表示 */}
        {/* UI.html: class="bg-slate-800 text-white px-6 py-5 rounded-2xl shadow-lg flex justify-between items-center group cursor-default" */}
        <div className="bg-slate-800 text-white px-6 py-5 rounded-2xl shadow-lg flex justify-between items-center group cursor-default">
          {/* UI.html: class="text-xs text-slate-400 font-bold tracking-wider" */}
          <div className="text-xs text-slate-400 font-bold tracking-wider">
            ESTIMATED VALUE
          </div>
          {/* UI.html: class="text-3xl font-bold text-yellow-400 font-mono group-hover:scale-105 transition" */}
          <div className="text-3xl font-bold text-yellow-400 font-mono group-hover:scale-105 transition">
            {formatPriceDisplay(evaluation.price)}
          </div>
        </div>

        {/* シェアボタン */}
        {/* UI.html: class="grid grid-cols-4 gap-3" */}
        <div className="grid grid-cols-4 gap-3">
          {/* X - UI.html: class="bg-black text-white rounded-xl py-3 flex flex-col items-center justify-center hover:opacity-80 transition shadow-md" */}
          <button
            onClick={handleShareX}
            className="bg-black text-white rounded-xl py-3 flex flex-col items-center justify-center hover:opacity-80 transition shadow-md"
            aria-label="Xに投稿"
          >
            {/* UI.html: class="w-5 h-5 fill-current" */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          {/* LINE - UI.html: class="bg-[#06C755] text-white rounded-xl py-3 flex flex-col items-center justify-center hover:opacity-90 transition shadow-md shadow-green-100" */}
          <button
            onClick={handleShareLine}
            className="bg-[#06C755] text-white rounded-xl py-3 flex flex-col items-center justify-center hover:opacity-90 transition shadow-md shadow-green-100"
            aria-label="LINEで送る"
          >
            {/* UI.html: class="fab fa-line text-2xl" - LINEアイコンをSVGで */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </button>

          {/* Save - UI.html: class="bg-white text-slate-600 border border-slate-200 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-slate-50 transition" */}
          <button
            onClick={handleDownload}
            className="bg-white text-slate-600 border border-slate-200 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-slate-50 transition"
            aria-label="画像を保存"
          >
            {/* UI.html: class="fas fa-download text-xl mb-1" */}
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 512 512">
              <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"/>
            </svg>
            {/* UI.html: class="text-[10px] font-bold" */}
            <span className="text-[10px] font-bold">Save</span>
          </button>

          {/* Link - UI.html: class="bg-white text-slate-600 border border-slate-200 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-slate-50 transition" */}
          <button
            onClick={handleCopyLink}
            className="bg-white text-slate-600 border border-slate-200 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-slate-50 transition"
            aria-label="リンクをコピー"
          >
            {/* UI.html: class="fas fa-link text-xl mb-1" */}
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 512 512">
              <path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"/>
            </svg>
            {/* UI.html: class="text-[10px] font-bold" */}
            <span className="text-[10px] font-bold">Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
