// src/lib/gemini.ts
/**
 * Gemini API クライアント
 *
 * 画像からの評論生成を行うサーバーサイド専用モジュール
 * - リトライロジック
 * - レスポンスパース
 * - フォールバック処理
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Evaluation } from '@/types';
import { GEMINI_CONFIG } from '@/config/constants';
import { INITIAL_CRITIQUE_PROMPT, buildContinuationPrompt } from './prompts';
import { parseGeminiResponse } from './parseResponse';
import { generateFallbackEvaluation } from './fallback';
import { GeminiError, ParseError } from './errors';

// 後方互換性のためにGeminiErrorを再エクスポート
export { GeminiError };

// ============================================================
// 型定義
// ============================================================

export interface PreviousWork {
    id?: string;
    title: string;
    artist: string;
    critique: string;
    price: number;
    seriesNumber: number;
}

// ============================================================
// メイン関数
// ============================================================

/**
 * サーバーサイドでのみ使用可能なGemini API初期化
 */
function getGenAI(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new GeminiError(
            'API_ERROR',
            'GEMINI_API_KEY environment variable is not set'
        );
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * 画像から評論を生成
 *
 * @param imageBase64 - Base64エンコードされた画像（data:image/...;base64, プレフィックス付きでも可）
 * @param previousWork - 前作の情報（続編作成時のみ）
 * @returns 生成された評論データ
 */
export async function generateCritique(
    imageBase64: string,
    previousWork?: PreviousWork
): Promise<Evaluation> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: GEMINI_CONFIG.MODEL,
        generationConfig: {
            temperature: GEMINI_CONFIG.GENERATION.TEMPERATURE,
            topP: GEMINI_CONFIG.GENERATION.TOP_P,
            topK: GEMINI_CONFIG.GENERATION.TOP_K,
            maxOutputTokens: GEMINI_CONFIG.GENERATION.MAX_OUTPUT_TOKENS,
        },
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= GEMINI_CONFIG.MAX_RETRIES; attempt++) {
        try {
            // プロンプト構築
            const basePrompt = previousWork
                ? buildContinuationPrompt(previousWork)
                : INITIAL_CRITIQUE_PROMPT;

            // リトライ時は警告を追加
            const prompt =
                attempt > 0
                    ? `${basePrompt}\n\n【重要警告】前回の出力が不正でした。純粋なJSONのみを出力せよ。`
                    : basePrompt;

            // Base64プレフィックスを除去（あれば）
            const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            console.log(
                `[Gemini] Attempt ${attempt + 1}/${GEMINI_CONFIG.MAX_RETRIES + 1} - Starting request`
            );

            // API呼び出し
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: imageData,
                    },
                },
                { text: prompt },
            ]);

            const response = result.response;
            const text = response.text();

            console.log(
                `[Gemini] Attempt ${attempt + 1} - Response received (${text.length} chars)`
            );

            // パース
            const evaluation = parseGeminiResponse(text);

            console.log(`[Gemini] Successfully parsed evaluation: "${evaluation.title}"`);

            return evaluation;
        } catch (error) {
            lastError = error as Error;

            console.warn(`[Gemini] Attempt ${attempt + 1} failed:`, error);

            // レート制限エラーは即座に投げる（リトライしても無駄）
            if (error instanceof Error && error.message.includes('429')) {
                throw new GeminiError('RATE_LIMIT', 'APIのレート制限に達しました');
            }

            // パースエラーはリトライする価値がある
            if (error instanceof ParseError) {
                continue;
            }

            // その他のAPIエラー
            if (error instanceof Error && !error.message.includes('parse')) {
                throw new GeminiError('API_ERROR', error.message);
            }
        }
    }

    // すべてのリトライが失敗した場合はフォールバック
    console.error('[Gemini] All retries exhausted, using fallback:', lastError);
    return generateFallbackEvaluation();
}
