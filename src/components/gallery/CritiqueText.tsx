// src/components/gallery/CritiqueText.tsx
'use client';

/**
 * 評論テキスト表示
 *
 * タイプライター効果で評論文を段階的に表示
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// 型定義
// ============================================================

interface CritiqueTextProps {
    /** 評論文 */
    text: string;
    /** タイプライター効果を使用するか */
    animated?: boolean;
    /** 1文字あたりの表示間隔（ms） */
    charDelay?: number;
}

// ============================================================
// コンポーネント
// ============================================================

export function CritiqueText({
    text,
    animated = true,
    charDelay = 30,
}: CritiqueTextProps) {
    const [displayedText, setDisplayedText] = useState(animated ? '' : text);
    const [isComplete, setIsComplete] = useState(!animated);

    useEffect(() => {
        if (!animated) {
            setDisplayedText(text);
            setIsComplete(true);
            return;
        }

        setDisplayedText('');
        setIsComplete(false);

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, charDelay);

        return () => clearInterval(interval);
    }, [text, animated, charDelay]);

    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-serif">
                {displayedText}
                {/* カーソルアニメーション */}
                {!isComplete && (
                    <motion.span
                        className="inline-block w-0.5 h-4 bg-gray-800 ml-0.5 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                )}
            </p>
        </motion.div>
    );
}
