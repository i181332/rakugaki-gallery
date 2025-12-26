// src/lib/utils.ts
/**
 * ユーティリティ関数
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラスをマージ（clsx + tailwind-merge）
 * 重複するクラスを適切に処理する
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * 価格を日本円形式でフォーマット
 *
 * @param price - 価格（整数）
 * @returns フォーマット済み文字列（例: "¥1,234,567"）
 */
export function formatPrice(price: number): string {
    return `¥${price.toLocaleString('ja-JP')}`;
}

/**
 * 価格を読みやすい形式でフォーマット
 *
 * @param price - 価格（整数）
 * @returns フォーマット済み文字列（例: "1,234万円" or "1.2億円"）
 */
export function formatPriceReadable(price: number): string {
    if (price >= 100_000_000) {
        // 億円単位
        const oku = price / 100_000_000;
        return `${oku.toFixed(oku % 1 === 0 ? 0 : 1)}億円`;
    } else if (price >= 10_000) {
        // 万円単位
        const man = Math.floor(price / 10_000);
        return `${man.toLocaleString('ja-JP')}万円`;
    }
    return `${price.toLocaleString('ja-JP')}円`;
}

/**
 * 日付をフォーマット
 *
 * @param isoString - ISO 8601形式の日付文字列
 * @returns フォーマット済み文字列（例: "2024年1月1日"）
 */
export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * 遅延実行
 *
 * @param ms - 待機時間（ミリ秒）
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), wait);
    };
}
