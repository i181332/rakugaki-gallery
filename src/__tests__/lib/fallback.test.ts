// src/__tests__/lib/fallback.test.ts
/**
 * フォールバック評論生成のテスト
 */

import { describe, it, expect } from 'vitest';
import { generateFallbackEvaluation } from '@/lib/fallback';
import { evaluationSchema } from '@/types';

describe('generateFallbackEvaluation', () => {
    it('有効なEvaluationを生成する', () => {
        const evaluation = generateFallbackEvaluation();

        // Zodスキーマでバリデーション
        const result = evaluationSchema.safeParse(evaluation);
        if (!result.success) {
            console.error('Validation errors:', result.error.issues);
            console.error('Evaluation:', evaluation);
        }
        expect(result.success).toBe(true);
    });

    it('必要なすべてのフィールドを持つ', () => {
        const evaluation = generateFallbackEvaluation();

        expect(evaluation).toHaveProperty('title');
        expect(evaluation).toHaveProperty('artist');
        expect(evaluation).toHaveProperty('medium');
        expect(evaluation).toHaveProperty('dimensions');
        expect(evaluation).toHaveProperty('critique');
        expect(evaluation).toHaveProperty('price');
        expect(evaluation).toHaveProperty('nextExpectation');
    });

    it('価格が有効な範囲内', () => {
        // 複数回実行してランダム性を確認
        for (let i = 0; i < 10; i++) {
            const evaluation = generateFallbackEvaluation();
            expect(evaluation.price).toBeGreaterThanOrEqual(1_000_000);
            expect(evaluation.price).toBeLessThanOrEqual(100_000_000);
        }
    });

    it('毎回異なる結果を生成する可能性がある', () => {
        const results = new Set<string>();

        for (let i = 0; i < 10; i++) {
            const evaluation = generateFallbackEvaluation();
            results.add(evaluation.title);
        }

        // 10回中、少なくとも2つ以上の異なるタイトルがあるはず
        expect(results.size).toBeGreaterThanOrEqual(2);
    });
});
