// src/app/share/[id]/SharePageClient.tsx
'use client';

/**
 * シェアページのクライアントコンポーネント
 *
 * 作品表示とインタラクション
 */

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pencil, Home } from 'lucide-react';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { ShareButtons } from '@/components/share/ShareButtons';
import { Button } from '@/components/ui/Button';
import type { Artwork } from '@/types';

// ============================================================
// 型定義
// ============================================================

interface SharePageClientProps {
    artwork: Artwork;
}

// ============================================================
// コンポーネント
// ============================================================

export function SharePageClient({ artwork }: SharePageClientProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* ヘッダー */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🎨</span>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            <span className="hidden sm:inline">Rakugaki Gallery</span>
                            <span className="sm:hidden">落書き美術館</span>
                        </h1>
                    </Link>
                    <Link href="/">
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil size={16} />}
                        >
                            自分も描く
                        </Button>
                    </Link>
                </div>
            </header>

            {/* メインコンテンツ */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* 共有された作品バッジ */}
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            <span>🖼️</span>
                            シェアされた作品
                        </span>
                    </div>

                    {/* ギャラリーカード */}
                    <GalleryCard ref={cardRef} artwork={artwork} animated={false} />

                    {/* シェアボタン */}
                    <ShareButtons artwork={artwork} cardRef={cardRef} />

                    {/* CTAセクション */}
                    <motion.div
                        className="text-center pt-8 pb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-gray-600 mb-4">
                            あなたも落書きを評論してもらいませんか？
                        </p>
                        <Link href="/">
                            <Button
                                size="lg"
                                leftIcon={<Pencil size={20} />}
                            >
                                自分の落書きを評論してもらう
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* フッター */}
            <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
                <p>
                    🧐 評論家: ジャン＝ピエール・デュボワ
                </p>
                <p className="mt-1">
                    ※ 本アプリの評論はAIによるパロディです
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 mt-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <Home size={14} />
                    トップページへ
                </Link>
            </footer>
        </main>
    );
}
