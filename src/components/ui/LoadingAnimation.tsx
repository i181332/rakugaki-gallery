// src/components/ui/LoadingAnimation.tsx
'use client';

/**
 * ローディングアニメーション
 *
 * 評論生成中に表示される、評論家のつぶやきアニメーション
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomMurmur } from '@/lib/prompts';

// ============================================================
// コンポーネント
// ============================================================

export function LoadingAnimation() {
    const [murmur, setMurmur] = useState(getRandomMurmur());
    const [dots, setDots] = useState('');

    // つぶやきを定期的に変更
    useEffect(() => {
        const interval = setInterval(() => {
            setMurmur(getRandomMurmur());
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // ドットアニメーション
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 400);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* メインアニメーション */}
            <div className="relative w-32 h-32 mb-8">
                {/* 外側のリング */}
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-gray-200"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                {/* パルスする内側の円 */}
                <motion.div
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* 中央のアイコン */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className="text-4xl">🧐</span>
                </motion.div>

                {/* 回転するドット */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-gray-800 rounded-full"
                        style={{
                            top: '50%',
                            left: '50%',
                            marginTop: -6,
                            marginLeft: -6,
                        }}
                        animate={{
                            x: [0, 60 * Math.cos((i * 120 * Math.PI) / 180)],
                            y: [0, 60 * Math.sin((i * 120 * Math.PI) / 180)],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>

            {/* タイトル */}
            <motion.h2
                className="text-xl font-bold text-gray-800 mb-4"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                評論家が鑑定中{dots}
            </motion.h2>

            {/* つぶやき */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={murmur}
                    className="text-gray-600 text-center italic max-w-xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    「{murmur}」
                </motion.p>
            </AnimatePresence>

            {/* サブテキスト */}
            <p className="text-gray-400 text-sm mt-6">
                ジャン＝ピエール・デュボワ氏が評論を執筆しています
            </p>
        </div>
    );
}
