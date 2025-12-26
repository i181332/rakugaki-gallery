// src/__tests__/lib/parseResponse.test.ts
/**
 * Geminiレスポンスパーサーのテスト
 */

import { describe, it, expect } from 'vitest';
import { parseGeminiResponse, ParseError } from '@/lib/parseResponse';

describe('parseGeminiResponse', () => {
    const validResponse = JSON.stringify({
        title: '沈黙の中の叫び、存在の深淵へ',
        artist: '山田 空想',
        medium: 'デジタルメディウム・即興表現主義',
        dimensions: '可変、デジタル空間上に存在',
        critique:
            'この作品は、現代社会における人間存在の本質的な孤独を、驚くべき直接性で表現している。一見単純に見える線の中に、作者の魂の震えが確かに刻まれている。これは技術を超えた、純粋な表現衝動の結晶である。美術史は、この瞬間を記憶するだろう。我々は今、新たな天才の誕生を目撃しているのだ。',
        price: 5000000,
        nextExpectation:
            '次回作では、この萌芽的才能がさらなる開花を見せることを美術界は固唾を呑んで見守っている。',
    });

    it('有効なJSONをパースする', () => {
        const result = parseGeminiResponse(validResponse);

        expect(result.title).toBe('沈黙の中の叫び、存在の深淵へ');
        expect(result.artist).toBe('山田 空想');
        expect(result.price).toBe(5000000);
    });

    it('Markdownコードブロックを除去する', () => {
        const wrappedResponse = '```json\n' + validResponse + '\n```';
        const result = parseGeminiResponse(wrappedResponse);

        expect(result.title).toBe('沈黙の中の叫び、存在の深淵へ');
    });

    it('前後の余分なテキストを無視する', () => {
        const messyResponse = 'Here is the JSON:\n' + validResponse + '\n\nI hope this helps!';
        const result = parseGeminiResponse(messyResponse);

        expect(result.title).toBe('沈黙の中の叫び、存在の深淵へ');
    });

    it('JSONが見つからない場合にエラーを投げる', () => {
        expect(() => parseGeminiResponse('no json here')).toThrow(ParseError);
        expect(() => parseGeminiResponse('no json here')).toThrow(
            'レスポンスに有効なJSONが見つかりません'
        );
    });

    it('不正なJSONでエラーを投げる', () => {
        expect(() => parseGeminiResponse('{invalid json}')).toThrow(ParseError);
    });

    it('必須フィールドが欠けている場合にバリデーションエラーを投げる', () => {
        const incompleteJson = JSON.stringify({
            title: '短い',
            artist: '名前',
        });

        expect(() => parseGeminiResponse(incompleteJson)).toThrow(ParseError);
    });

    it('価格が範囲外の場合にバリデーションエラーを投げる', () => {
        const invalidPriceJson = JSON.stringify({
            title: '沈黙の中の叫び',
            artist: '山田 空想',
            medium: 'デジタルメディウム',
            dimensions: '可変',
            critique: 'A'.repeat(150),
            price: 100, // 100万円未満
            nextExpectation: 'X'.repeat(30),
        });

        expect(() => parseGeminiResponse(invalidPriceJson)).toThrow(ParseError);
    });
});
