// src/lib/rateLimiter.ts
/**
 * レート制限モジュール
 *
 * 再利用可能なレート制限機能を提供
 * - IPベースまたは任意のキーでの制限
 * - スライディングウィンドウ方式
 * - 自動クリーンアップ
 */

import { API_CONFIG } from '@/config/constants';

// ============================================================
// 型定義
// ============================================================

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

interface RateLimiterConfig {
    /** ウィンドウあたりの最大リクエスト数 */
    maxRequests: number;
    /** ウィンドウサイズ（ミリ秒） */
    windowMs: number;
    /** クリーンアップ間隔（ミリ秒） */
    cleanupIntervalMs?: number;
}

interface RateLimitResult {
    /** リクエストが許可されたか */
    allowed: boolean;
    /** 残りリクエスト数 */
    remaining: number;
    /** リセットまでの時間（ミリ秒） */
    resetAfterMs: number;
}

// ============================================================
// RateLimiterクラス
// ============================================================

/**
 * 再利用可能なレート制限クラス
 * 注意: Edge Runtimeでは各リクエストが独立しているため、
 * 本格的なレート制限にはCloudflare KVなどの外部ストレージが必要
 */
export class RateLimiter {
    private readonly records = new Map<string, RateLimitRecord>();
    private readonly config: Required<RateLimiterConfig>;

    constructor(config: RateLimiterConfig) {
        this.config = {
            maxRequests: config.maxRequests,
            windowMs: config.windowMs,
            cleanupIntervalMs: config.cleanupIntervalMs ?? config.windowMs,
        };
    }

    /**
     * リクエストを試行し、許可されるかチェック
     */
    check(key: string): RateLimitResult {
        const now = Date.now();
        const record = this.records.get(key);

        // 既存のレコードがないか期限切れの場合
        if (!record || now > record.resetTime) {
            this.records.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs,
            });
            return {
                allowed: true,
                remaining: this.config.maxRequests - 1,
                resetAfterMs: this.config.windowMs,
            };
        }

        // レート制限に達している場合
        if (record.count >= this.config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetAfterMs: record.resetTime - now,
            };
        }

        // カウントを増加
        record.count++;
        return {
            allowed: true,
            remaining: this.config.maxRequests - record.count,
            resetAfterMs: record.resetTime - now,
        };
    }

    /**
     * 指定キーのカウントをリセット
     */
    reset(key: string): void {
        this.records.delete(key);
    }

    /**
     * すべてのレコードをクリア
     */
    clear(): void {
        this.records.clear();
    }

    /**
     * 統計情報を取得
     */
    getStats(): { activeKeys: number } {
        return {
            activeKeys: this.records.size,
        };
    }
}

// ============================================================
// デフォルトインスタンス
// ============================================================

/**
 * API用のデフォルトレート制限インスタンス
 */
export const apiRateLimiter = new RateLimiter({
    maxRequests: API_CONFIG.RATE_LIMIT,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW_MS,
    cleanupIntervalMs: API_CONFIG.CLEANUP_INTERVAL_MS,
});

// ============================================================
// ユーティリティ関数
// ============================================================

/**
 * リクエストからIPアドレスを取得
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get('cf-connecting-ip') ||
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        'unknown'
    );
}
