// src/__tests__/lib/utils.test.ts
/**
 * ユーティリティ関数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
    cn,
    formatPrice,
    formatPriceReadable,
    formatDate,
    debounce,
} from '@/lib/utils';

describe('cn (className merge)', () => {
    it('複数のクラスをマージする', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('条件付きクラスを処理する', () => {
        expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('Tailwindの競合するクラスを解決する', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('空の入力を処理する', () => {
        expect(cn()).toBe('');
        expect(cn('')).toBe('');
    });
});

describe('formatPrice', () => {
    it('価格を円形式でフォーマットする', () => {
        expect(formatPrice(1000000)).toBe('¥1,000,000');
        expect(formatPrice(50000000)).toBe('¥50,000,000');
    });

    it('0を正しくフォーマットする', () => {
        expect(formatPrice(0)).toBe('¥0');
    });
});

describe('formatPriceReadable', () => {
    it('100万円未満を円単位で表示する', () => {
        expect(formatPriceReadable(5000)).toBe('5,000円');
    });

    it('100万円以上を万円単位で表示する', () => {
        expect(formatPriceReadable(1000000)).toBe('100万円');
        expect(formatPriceReadable(5000000)).toBe('500万円');
        expect(formatPriceReadable(15000000)).toBe('1,500万円');
    });

    it('1億円以上を億円単位で表示する', () => {
        expect(formatPriceReadable(100000000)).toBe('1億円');
        expect(formatPriceReadable(150000000)).toBe('1.5億円');
        expect(formatPriceReadable(1000000000)).toBe('10億円');
    });
});

describe('formatDate', () => {
    it('ISO日付を日本語形式でフォーマットする', () => {
        const result = formatDate('2024-01-15T10:30:00.000Z');
        expect(result).toContain('2024');
        expect(result).toContain('1');
        expect(result).toContain('15');
    });
});

describe('debounce', () => {
    it('関数呼び出しをデバウンスする', async () => {
        let callCount = 0;
        const fn = () => {
            callCount++;
        };
        const debouncedFn = debounce(fn, 50);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        expect(callCount).toBe(0);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(callCount).toBe(1);
    });
});
