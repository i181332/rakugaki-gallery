// src/components/gallery/GalleryCard.tsx
'use client';

/**
 * 作品展示カード
 *
 * 美術館風のフォーマットで評論済み作品を表示
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Artwork } from '@/types';
import { PriceTag } from './PriceTag';
import { CritiqueText } from './CritiqueText';
import { formatDate } from '@/lib/utils';

// ============================================================
// 型定義
// ============================================================

interface GalleryCardProps {
    /** 作品データ */
    artwork: Artwork;
    /** アニメーションを有効にするか */
    animated?: boolean;
}

// ============================================================
// コンポーネント
// ============================================================

export const GalleryCard = forwardRef<HTMLDivElement, GalleryCardProps>(
    function GalleryCard({ artwork, animated = true }, ref) {
        const { image, evaluation, seriesNumber, createdAt } = artwork;

        return (
            <motion.div
                ref={ref}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto"
                initial={animated ? { opacity: 0, y: 20 } : undefined}
                animate={animated ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* ヘッダー：アーティスト情報 */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm text-gray-400 uppercase tracking-wider">
                                Artist
                            </h3>
                            <p className="text-xl font-bold">{evaluation.artist}</p>
                        </div>
                        {seriesNumber > 1 && (
                            <div className="text-right">
                                <span className="text-xs text-gray-400">Series</span>
                                <p className="text-lg font-bold">#{seriesNumber}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 作品画像 */}
                <div className="relative bg-gray-100 p-4 sm:p-8">
                    <div className="relative mx-auto max-w-md">
                        {/* 額縁風のシャドウ */}
                        <div className="absolute inset-0 border-8 border-amber-900/20 rounded-lg pointer-events-none" />
                        {/* eslint-disable-next-line @next/next/no-img-element -- Base64画像のためImageコンポーネントは不適切 */}
                        <img
                            src={image}
                            alt={evaluation.title}
                            className="w-full aspect-square object-contain bg-white rounded shadow-inner"
                        />
                    </div>
                </div>

                {/* 作品情報 */}
                <div className="px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
                    {/* タイトル & メタ情報 */}
                    <div className="text-center">
                        <motion.h1
                            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-serif"
                            initial={animated ? { opacity: 0 } : undefined}
                            animate={animated ? { opacity: 1 } : undefined}
                            transition={{ delay: 0.3 }}
                        >
                            「{evaluation.title}」
                        </motion.h1>
                        <div className="text-sm text-gray-500 space-x-3">
                            <span>{evaluation.medium}</span>
                            <span>•</span>
                            <span>{evaluation.dimensions}</span>
                        </div>
                    </div>

                    {/* 評論文 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">📜</span>
                            <div className="flex-1">
                                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                                    Critique by Jean-Pierre Dubois
                                </h4>
                                <CritiqueText text={evaluation.critique} animated={animated} />
                            </div>
                        </div>
                    </div>

                    {/* 価格 */}
                    <div className="flex justify-center">
                        <PriceTag
                            price={evaluation.price}
                            priceChange={evaluation.priceChange}
                            priceChangeReason={evaluation.priceChangeReason}
                            size="lg"
                        />
                    </div>

                    {/* 次回作への期待 */}
                    <motion.div
                        className="text-center bg-blue-50 border border-blue-100 rounded-lg p-4"
                        initial={animated ? { opacity: 0, y: 10 } : undefined}
                        animate={animated ? { opacity: 1, y: 0 } : undefined}
                        transition={{ delay: 1.5 }}
                    >
                        <p className="text-sm text-blue-800 italic">
                            💬 {evaluation.nextExpectation}
                        </p>
                    </motion.div>

                    {/* 日時 */}
                    <div className="text-center text-xs text-gray-400">
                        作品登録日: {formatDate(createdAt)}
                    </div>
                </div>
            </motion.div>
        );
    }
);
