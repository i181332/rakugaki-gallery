// src/lib/parseResponse.ts
/**
 * Gemini APIレスポンスのパーサー
 *
 * AIの出力は必ずしも完璧なJSONではないため、
 * 複数段階のクリーニングとバリデーションを行う
 */

import { evaluationSchema, type Evaluation } from '@/types';
import { ParseError } from './errors';

// 後方互換性のためにParseErrorを再エクスポート
export { ParseError };

/**
 * Geminiからの生レスポンスをパースし、型安全なEvaluationに変換
 *
 * @param raw - Gemini APIからの生テキスト
 * @returns パース済みのEvaluation
 * @throws JSONが見つからない、パースできない、バリデーションエラーの場合
 */
export function parseGeminiResponse(raw: string): Evaluation {
    // Step 1: 前後の空白を除去
    let cleaned = raw.trim();

    // Step 2: Markdownコードブロック記法を除去
    // AIが ```json ... ``` 形式で出力する場合がある
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');

    // Step 3: JSONオブジェクトの開始・終了位置を特定
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        throw new ParseError(
            'INVALID_JSON_STRUCTURE',
            'レスポンスに有効なJSONが見つかりません'
        );
    }

    const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

    // Step 4: JSONパース
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonString);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ParseError('JSON_PARSE_ERROR', `JSONパースエラー: ${message}`);
    }

    // Step 5: Zodによるスキーマバリデーション
    const result = evaluationSchema.safeParse(parsed);

    if (!result.success) {
        const issues = result.error.issues;
        const firstIssue = issues[0];
        const path = firstIssue ? firstIssue.path.map(String).join('.') : 'unknown';
        const message = firstIssue ? firstIssue.message : 'Validation failed';

        console.error('[parseGeminiResponse] Validation errors:', issues);

        throw new ParseError(
            'VALIDATION_ERROR',
            `バリデーションエラー: ${path} - ${message}`
        );
    }

    return result.data;
}
