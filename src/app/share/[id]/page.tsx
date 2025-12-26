// src/app/share/[id]/page.tsx
/**
 * シェアページ
 *
 * SNSでシェアされた作品を表示するページ
 * - 動的OGPメタデータ
 * - 作品の閲覧・新規作成への導線
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArtwork } from '@/lib/artworkStore';
import { formatPriceReadable } from '@/lib/utils';
import { SharePageClient } from './SharePageClient';

// ============================================================
// 型定義
// ============================================================

interface SharePageProps {
    params: Promise<{ id: string }>;
}

// ============================================================
// メタデータ生成
// ============================================================

export async function generateMetadata({
    params,
}: SharePageProps): Promise<Metadata> {
    const { id } = await params;
    const artwork = await getArtwork(id);

    if (!artwork) {
        return {
            title: '作品が見つかりません | Rakugaki Gallery',
            description: '指定された作品は存在しないか、期限切れです。',
        };
    }

    const { evaluation } = artwork;
    const priceText = formatPriceReadable(evaluation.price);

    return {
        title: `「${evaluation.title}」 by ${evaluation.artist} | Rakugaki Gallery`,
        description: `${evaluation.critique.slice(0, 100)}...`,
        openGraph: {
            title: `「${evaluation.title}」- ${priceText}`,
            description: evaluation.critique,
            type: 'article',
            images: [
                {
                    url: `/api/og/${id}`,
                    width: 1200,
                    height: 630,
                    alt: evaluation.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `「${evaluation.title}」- ${priceText}`,
            description: evaluation.critique.slice(0, 100),
            images: [`/api/og/${id}`],
        },
    };
}

// ============================================================
// ページコンポーネント
// ============================================================

export default async function SharePage({ params }: SharePageProps) {
    const { id } = await params;
    const artwork = await getArtwork(id);

    if (!artwork) {
        notFound();
    }

    return <SharePageClient artwork={artwork} />;
}
