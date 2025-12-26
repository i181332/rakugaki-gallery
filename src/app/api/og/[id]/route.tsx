// src/app/api/og/[id]/route.tsx
/**
 * OGP画像生成 API Route
 *
 * GET /api/og/[id]
 * - 指定された作品のOGP画像を動的に生成
 * - SNSシェア時のプレビュー画像として使用
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getArtwork } from '@/lib/artworkStore';
import { formatPriceReadable } from '@/lib/utils';

// ============================================================
// 設定
// ============================================================

export const runtime = 'edge';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// ============================================================
// API ハンドラ
// ============================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const artwork = await getArtwork(id);

        if (!artwork) {
            // 作品が見つからない場合のフォールバック画像
            return new ImageResponse(
                (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        <div style={{ fontSize: 80, marginBottom: 20 }}>🎨</div>
                        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#333' }}>
                            Rakugaki Gallery
                        </div>
                        <div style={{ fontSize: 24, color: '#666', marginTop: 16 }}>
                            落書き美術館
                        </div>
                    </div>
                ),
                { width: OG_WIDTH, height: OG_HEIGHT }
            );
        }

        const { evaluation, image } = artwork;
        const priceText = formatPriceReadable(evaluation.price);

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* 左側: 作品画像 */}
                    <div
                        style={{
                            width: '45%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 40,
                        }}
                    >
                        <div
                            style={{
                                width: 400,
                                height: 400,
                                background: 'white',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={image}
                                alt={evaluation.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                    </div>

                    {/* 右側: 情報 */}
                    <div
                        style={{
                            width: '55%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '40px 50px 40px 20px',
                            color: 'white',
                        }}
                    >
                        {/* ロゴ */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginBottom: 24,
                            }}
                        >
                            <span style={{ fontSize: 32 }}>🎨</span>
                            <span style={{ fontSize: 20, opacity: 0.8 }}>
                                Rakugaki Gallery
                            </span>
                        </div>

                        {/* タイトル */}
                        <div
                            style={{
                                fontSize: 42,
                                fontWeight: 'bold',
                                marginBottom: 16,
                                lineHeight: 1.2,
                            }}
                        >
                            「{evaluation.title}」
                        </div>

                        {/* アーティスト */}
                        <div
                            style={{
                                fontSize: 24,
                                opacity: 0.8,
                                marginBottom: 24,
                            }}
                        >
                            by {evaluation.artist}
                        </div>

                        {/* 価格 */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                borderRadius: 12,
                                color: '#1a1a2e',
                                width: 'fit-content',
                            }}
                        >
                            <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                                評価額
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 'bold' }}>
                                {priceText}
                            </span>
                        </div>

                        {/* 評論抜粋 */}
                        <div
                            style={{
                                fontSize: 16,
                                opacity: 0.7,
                                marginTop: 24,
                                lineHeight: 1.6,
                                maxWidth: 500,
                            }}
                        >
                            {evaluation.critique.slice(0, 80)}...
                        </div>

                        {/* フッター */}
                        <div
                            style={{
                                fontSize: 14,
                                opacity: 0.5,
                                marginTop: 32,
                            }}
                        >
                            🧐 評論家: ジャン＝ピエール・デュボワ
                        </div>
                    </div>
                </div>
            ),
            { width: OG_WIDTH, height: OG_HEIGHT }
        );
    } catch (error) {
        console.error('[API] OG image generation error:', error);

        // エラー時のフォールバック
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        color: 'white',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{ fontSize: 80, marginBottom: 20 }}>🎨</div>
                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>
                        Rakugaki Gallery
                    </div>
                    <div style={{ fontSize: 24, opacity: 0.7, marginTop: 16 }}>
                        あなたの落書きを美術品に
                    </div>
                </div>
            ),
            { width: OG_WIDTH, height: OG_HEIGHT }
        );
    }
}
