// src/components/share/ShareButtons.tsx
'use client';

/**
 * シェアボタン
 *
 * X (Twitter)、LINE、画像保存、リンクコピー
 */

import React, { useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Download, Link2 } from 'lucide-react';
import type { Artwork } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPriceReadable } from '@/lib/utils';

// ============================================================
// 型定義
// ============================================================

interface ShareButtonsProps {
    artwork: Artwork;
    cardRef: React.RefObject<HTMLDivElement | null>;
}

// ============================================================
// コンポーネント
// ============================================================

export function ShareButtons({ artwork, cardRef }: ShareButtonsProps) {
    const shareText = `私の落書きが「${artwork.evaluation.title}」として ${formatPriceReadable(artwork.evaluation.price)} の評価を受けました！\n\n#RakugakiGallery #落書き美術館`;

    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/share/${artwork.id}`
            : '';

    // 画像ダウンロード
    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;

        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });

            const link = document.createElement('a');
            link.download = `rakugaki-${artwork.id}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('[ShareButtons] Failed to generate image:', error);
            alert('画像の生成に失敗しました');
        }
    }, [artwork.id, cardRef]);

    // X (Twitter) シェア
    const handleShareX = useCallback(() => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
    }, [shareText, shareUrl]);

    // LINE シェア
    const handleShareLine = useCallback(() => {
        const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=550,height=420');
    }, [shareText, shareUrl]);

    // リンクコピー
    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('リンクをコピーしました！');
        } catch (error) {
            console.error('[ShareButtons] Failed to copy:', error);
            alert('コピーに失敗しました');
        }
    }, [shareUrl]);

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-6">
            {/* X (Twitter) */}
            <button
                onClick={handleShareX}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md"
            >
                <span className="font-bold text-lg">𝕏</span>
                <span>シェア</span>
            </button>

            {/* LINE */}
            <button
                onClick={handleShareLine}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00B900] text-white rounded-xl font-semibold hover:bg-[#00A000] transition-colors shadow-md"
            >
                <span>LINE</span>
            </button>

            {/* 画像ダウンロード */}
            <Button
                variant="outline"
                onClick={handleDownload}
                leftIcon={<Download size={18} />}
            >
                画像保存
            </Button>

            {/* リンクコピー */}
            <Button
                variant="outline"
                onClick={handleCopyLink}
                leftIcon={<Link2 size={18} />}
            >
                リンク
            </Button>
        </div>
    );
}
