// src/components/screens/LoadingScreen.tsx
'use client';

/**
 * ローディング画面
 * UI.htmlの設計に100%忠実な実装
 * すべてのクラス名・値はUI.htmlから直接コピー
 */

import React, { useState, useEffect } from 'react';

const MURMURS = [
  '美術界に激震が走るだろう...',
  'この線の意味するところは...',
  '実に興味深い構図だ...',
  '芸術の新境地が開かれようとしている...',
  'これは...革命的だ...',
  '歴史に残る作品になるかもしれない...',
  '天才か、それとも狂気か...',
  '私の目に狂いはない...',
  'コレクターたちが殺到するだろう...',
  'まさに唯一無二の才能...',
];

export function LoadingScreen() {
  const getRandomMurmur = () => {
    const randomIndex = Math.floor(Math.random() * MURMURS.length);
    return MURMURS[randomIndex];
  };

  const [murmur, setMurmur] = useState(() => getRandomMurmur());

  useEffect(() => {
    const interval = setInterval(() => {
      setMurmur(getRandomMurmur());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    // UI.html: class="w-full max-w-md flex flex-col items-center justify-center gap-8 transition-all duration-300"
    <div className="w-full max-w-md flex flex-col items-center justify-center gap-8 transition-all duration-300">

      {/* UI.html: class="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-indigo-50 w-full text-center flex flex-col items-center" */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-indigo-50 w-full text-center flex flex-col items-center">

        {/* ヘッダー */}
        {/* UI.html: class="mb-8 flex flex-col items-center" */}
        <div className="mb-8 flex flex-col items-center">
          {/* UI.html: class="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4" */}
          <div className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4">
            🎨 Rakugaki Gallery
          </div>

          {/* スピナー */}
          {/* UI.html: class="relative" */}
          <div className="relative">
            {/* UI.html: class="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center text-6xl relative z-10" */}
            <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center text-6xl relative z-10">
              🧐
            </div>
            {/* UI.html: class="absolute inset-0 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" style="animation-duration: 1.5s;" */}
            <div
              className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-500 rounded-full"
              style={{ animation: 'spin 1.5s linear infinite' }}
            />
          </div>
        </div>

        {/* メインテキスト */}
        {/* UI.html: class="text-2xl font-extrabold text-slate-800 mb-4 animate-pulse" */}
        <h2 className="text-2xl font-extrabold text-slate-800 mb-4 animate-pulse">
          評論家が鑑定中..
        </h2>

        {/* つぶやき */}
        {/* UI.html: class="mb-8" */}
        <div className="mb-8">
          {/* UI.html: class="serif-font text-xl text-indigo-600 italic font-bold leading-relaxed" */}
          <p className="serif-font text-xl text-indigo-600 italic font-bold leading-relaxed">
            「{murmur}」
          </p>
        </div>

        {/* フッター */}
        {/* UI.html: class="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-full" */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-full flex-wrap">
          {/* UI.html: class="fas fa-pen-fancy text-indigo-400" */}
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 512 512">
            <path d="M467.14 44.84c-62.55-62.48-161.67-64.78-228.09-5.52a190.57 190.57 0 0 0-44.43 60.8l-19.63 48.12-25.16 61.7c-3.94 9.66-1.88 20.75 5.31 28.35l96.26 102.41 103.14 97.65c7.5 7.1 18.55 9.11 28.11 5.12l61.38-25.61 47.69-19.92a189.19 189.19 0 0 0 60.35-44.66c58.83-66.74 56.53-165.86-5.93-228.44zM327.77 229.06a43.65 43.65 0 1 1 56.92-66.24 43.65 43.65 0 0 1-56.92 66.24zM166.51 503.51c-2.92 4.13-8.12 6.32-13.26 4.92-1.47-.4-2.92-.89-4.37-1.43l-82.86-31.35c-7.83-2.96-14.12-9.14-17.2-16.91l-33.63-84.1c-.53-1.32-1-2.66-1.41-4.01-1.44-4.92.64-10.23 4.74-13.27L96.72 296l28.05 29.83L65.03 449.5l121.26-61.63 29.83 28.05-49.61 87.59z"/>
          </svg>
          <span>ジャン＝ピエール・デュボワ氏が</span>
          <br className="sm:hidden" />
          <span>評論を執筆しています</span>

          {/* バウンスドット */}
          {/* UI.html: class="flex gap-1 ml-1" */}
          <div className="flex gap-1 ml-1">
            {/* UI.html: class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0s" */}
            <div
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
