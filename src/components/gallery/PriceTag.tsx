// src/components/gallery/PriceTag.tsx
'use client';

/**
 * 価格表示タグ
 *
 * 美術品風の価格表示。価格変動も視覚的に表現
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPriceReadable } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ============================================================
// 型定義
// ============================================================

interface PriceTagProps {
    /** 価格 */
    price: number;
    /** 価格変動 */
    priceChange?: '上昇' | '下落' | '据え置き';
    /** 変動理由 */
    priceChangeReason?: string;
    /** サイズ */
    size?: 'sm' | 'md' | 'lg';
}

// ============================================================
// コンポーネント
// ============================================================

export function PriceTag({
    price,
    priceChange,
    priceChangeReason,
    size = 'md',
}: PriceTagProps) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
    };

    const iconSize = {
        sm: 14,
        md: 18,
        lg: 24,
    };

    return (
        <motion.div
            className={cn(
                'inline-flex flex-col items-center gap-1',
                'bg-gradient-to-b from-amber-50 to-amber-100',
                'border-2 border-amber-300 rounded-lg',
                'px-4 py-3 shadow-md'
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
        >
            {/* メイン価格 */}
            <div className={cn('font-bold text-amber-900', sizeClasses[size])}>
                {formatPriceReadable(price)}
            </div>

            {/* 価格変動（あれば） */}
            {priceChange && (
                <div
                    className={cn(
                        'flex items-center gap-1 text-sm font-medium',
                        priceChange === '上昇' && 'text-green-600',
                        priceChange === '下落' && 'text-red-600',
                        priceChange === '据え置き' && 'text-gray-500'
                    )}
                >
                    {priceChange === '上昇' && <TrendingUp size={iconSize[size]} />}
                    {priceChange === '下落' && <TrendingDown size={iconSize[size]} />}
                    {priceChange === '据え置き' && <Minus size={iconSize[size]} />}
                    <span>{priceChange}</span>
                </div>
            )}

            {/* 変動理由 */}
            {priceChangeReason && (
                <p className="text-xs text-amber-700 text-center max-w-[200px]">
                    {priceChangeReason}
                </p>
            )}
        </motion.div>
    );
}
