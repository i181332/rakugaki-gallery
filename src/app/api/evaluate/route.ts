// src/app/api/evaluate/route.ts
/**
 * 評論生成 API Route
 *
 * POST /api/evaluate
 * - 画像と過去作品情報を受け取り、Gemini APIで評論を生成
 * - レート制限、バリデーション、エラーハンドリング
 */

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { generateCritique, GeminiError } from '@/lib/gemini';
import { saveArtwork } from '@/lib/artworkStore';
import { apiRateLimiter, getClientIP } from '@/lib/rateLimiter';
import { API_CONFIG } from '@/config/constants';
import type {
    EvaluateRequest,
    EvaluateResponse,
    EvaluateErrorResponse,
    Artwork,
} from '@/types';

// ============================================================
// API ハンドラ
// ============================================================

export async function POST(request: NextRequest) {
    try {
        // IPアドレス取得
        const ip = getClientIP(request.headers);

        // レート制限チェック
        const rateLimitResult = apiRateLimiter.check(ip);
        if (!rateLimitResult.allowed) {
            console.log(`[API] Rate limit exceeded for IP: ${ip}`);
            const response: EvaluateErrorResponse = {
                success: false,
                error: '評論家が休憩中です。1分後にもう一度お試しください。',
                code: 'RATE_LIMIT',
            };
            return NextResponse.json(response, {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil(rateLimitResult.resetAfterMs / 1000)),
                    'X-RateLimit-Remaining': '0',
                },
            });
        }

        // リクエストボディのパース
        let body: EvaluateRequest;
        try {
            body = await request.json();
        } catch {
            const response: EvaluateErrorResponse = {
                success: false,
                error: 'リクエストの形式が不正です',
                code: 'VALIDATION_ERROR',
            };
            return NextResponse.json(response, { status: 400 });
        }

        // バリデーション
        if (!body.image) {
            const response: EvaluateErrorResponse = {
                success: false,
                error: '画像が提供されていません',
                code: 'VALIDATION_ERROR',
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Base64画像のサイズチェック
        const base64Size = body.image.length * 0.75; // Base64は約33%オーバーヘッド
        if (base64Size > API_CONFIG.MAX_IMAGE_SIZE) {
            const response: EvaluateErrorResponse = {
                success: false,
                error: '画像サイズが大きすぎます（10MB以下にしてください）',
                code: 'VALIDATION_ERROR',
            };
            return NextResponse.json(response, { status: 400 });
        }

        console.log(
            `[API] Generating critique for IP: ${ip}, hasPreviousWork: ${!!body.previousWork}`
        );

        // 評論生成
        const evaluation = await generateCritique(body.image, body.previousWork);

        // 作品データ構築
        const artwork: Artwork = {
            id: nanoid(10),
            image: body.image,
            evaluation,
            seriesNumber: body.previousWork ? body.previousWork.seriesNumber + 1 : 1,
            createdAt: new Date().toISOString(),
            previousWorkId: body.previousWork?.id,
        };

        // 作品をストアに保存（シェア機能用）
        await saveArtwork(artwork);

        console.log(
            `[API] Critique generated successfully: "${evaluation.title}" - ¥${evaluation.price.toLocaleString()}`
        );

        const response: EvaluateResponse = {
            success: true,
            artwork,
        };

        return NextResponse.json(response, {
            headers: {
                'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            },
        });
    } catch (error) {
        console.error('[API] Evaluate error:', error);

        // Gemini固有のエラー
        if (error instanceof GeminiError) {
            if (error.code === 'RATE_LIMIT') {
                const response: EvaluateErrorResponse = {
                    success: false,
                    error: 'APIのレート制限に達しました。しばらくお待ちください。',
                    code: 'RATE_LIMIT',
                };
                return NextResponse.json(response, { status: 429 });
            }
        }

        // 一般的なエラー
        const response: EvaluateErrorResponse = {
            success: false,
            error: '評論の生成に失敗しました。もう一度お試しください。',
            code: 'API_ERROR',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
