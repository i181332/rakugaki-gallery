// src/components/screens/LoginScreen.tsx
'use client';

import React, { useState, useCallback } from 'react';

interface LoginScreenProps {
  onStart: (artistName: string, avatarSeed: string) => void;
}

const AVATAR_SEEDS = [
  'Felix', 'Luna', 'Max', 'Coco', 'Oliver', 'Milo', 'Charlie', 'Lucy',
  'Bella', 'Leo', 'Daisy', 'Oscar', 'Lily', 'Jack', 'Sophie', 'Teddy',
];

export function LoginScreen({ onStart }: LoginScreenProps) {
  const [artistName, setArtistName] = useState('名無しのアトリエ');
  const [avatarSeed, setAvatarSeed] = useState('Felix');

  const handleRandomAvatar = useCallback(() => {
    const currentIndex = AVATAR_SEEDS.indexOf(avatarSeed);
    let nextIndex = Math.floor(Math.random() * AVATAR_SEEDS.length);
    while (nextIndex === currentIndex && AVATAR_SEEDS.length > 1) {
      nextIndex = Math.floor(Math.random() * AVATAR_SEEDS.length);
    }
    setAvatarSeed(AVATAR_SEEDS[nextIndex]);
  }, [avatarSeed]);

  const handleStart = useCallback(() => {
    if (artistName.trim()) {
      onStart(artistName.trim(), avatarSeed);
    }
  }, [artistName, avatarSeed, onStart]);

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center gap-8 transition-all duration-300">
      {/* タイトル */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          <span className="text-indigo-500 italic">Rakugaki</span> Gallery
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-bold">
          キミの落書きが、名画になる。
        </p>
      </div>

      {/* メインカード */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 w-full">
        <div className="flex flex-col items-center gap-6">
          {/* アバター */}
          <div className="relative group cursor-pointer" onClick={handleRandomAvatar}>
            <div className="w-24 h-24 bg-indigo-100 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`}
                alt="Avatar"
                className="w-20 h-20"
              />
            </div>
            {/* リフレッシュボタン */}
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-500 transition">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 512 512">
                <path d="M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317.25-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.57l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z"/>
              </svg>
            </div>
          </div>

          {/* アーティスト名入力 */}
          <div className="w-full">
            <label
              htmlFor="nickname"
              className="block text-xs font-bold text-slate-400 mb-2 ml-2"
            >
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
                maxLength={20}
              />
              {/* パレットアイコン */}
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 512 512"
              >
                <path d="M204.3 5C104.9 24.4 24.8 104.3 5.2 203.4c-37 187 131.7 326.4 258.8 306.7 41.2-6.4 61.4-54.6 42.5-91.7-23.1-45.4 9.9-98.4 60.9-98.4h79.7c35.8 0 64.8-29.6 64.9-65.3C511.5 97.1 368.1-26.9 204.3 5zM96 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm32-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
              </svg>
            </div>
          </div>

          {/* スタートボタン */}
          <button
            onClick={handleStart}
            disabled={!artistName.trim()}
            className="w-full bg-slate-800 hover:bg-indigo-600 text-white rounded-2xl py-4 font-extrabold text-lg shadow-lg shadow-indigo-200 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:transform-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
              <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/>
            </svg>
            START
          </button>
        </div>
      </div>
    </div>
  );
}
