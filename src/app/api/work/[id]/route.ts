// src/app/api/work/[id]/route.ts
/**
 * 作品取得 API Route
 *
 * GET /api/work/[id]
 * - 指定IDの作品データを取得
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getArtwork } from '@/lib/artworkStore';
import type { Artwork } from '@/types';

// ============================================================
// 型定義
// ============================================================

interface WorkResponse {
    success: true;
    artwork: Artwork;
}

interface WorkErrorResponse {
    success: false;
    error: string;
    code: 'NOT_FOUND' | 'INVALID_ID';
}

// ============================================================
// API ハンドラ
// ============================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<WorkResponse | WorkErrorResponse>> {
    try {
        const { id } = await params;

        // IDバリデーション
        if (!id || typeof id !== 'string' || id.length < 5) {
            return NextResponse.json(
                {
                    success: false,
                    error: '無効な作品IDです',
                    code: 'INVALID_ID',
                },
                { status: 400 }
            );
        }

        // 作品取得
        const artwork = await getArtwork(id);

        if (!artwork) {
            return NextResponse.json(
                {
                    success: false,
                    error: '作品が見つかりません',
                    code: 'NOT_FOUND',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            artwork,
        });
    } catch (error) {
        console.error('[API] Work retrieval error:', error);

        return NextResponse.json(
            {
                success: false,
                error: '作品の取得に失敗しました',
                code: 'NOT_FOUND',
            },
            { status: 500 }
        );
    }
}
