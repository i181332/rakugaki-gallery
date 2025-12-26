// src/lib/artworkStore.ts
/**
 * 作品データの一時保存ストア
 *
 * 開発環境: インメモリストレージ
 * 本番環境: Cloudflare KV または Vercel KV を使用
 *
 * 注: このインメモリ実装は開発用です。
 * サーバーレス環境では永続化されません。
 */

import type { Artwork } from '@/types';
import { CACHE_CONFIG } from '@/config/constants';

// ============================================================
// インメモリストレージ（開発用）
// ============================================================

const artworkCache = new Map<string, { artwork: Artwork; expiresAt: number }>();

// ============================================================
// ストア関数
// ============================================================

/**
 * 作品を保存
 */
export async function saveArtwork(artwork: Artwork): Promise<void> {
    // 古いエントリをクリーンアップ
    cleanupExpiredEntries();

    // キャッシュサイズ制限
    if (artworkCache.size >= CACHE_CONFIG.MAX_SIZE) {
        const oldestKey = artworkCache.keys().next().value;
        if (oldestKey) {
            artworkCache.delete(oldestKey);
        }
    }

    artworkCache.set(artwork.id, {
        artwork,
        expiresAt: Date.now() + CACHE_CONFIG.TTL_MS,
    });

    console.log(`[ArtworkStore] Saved artwork: ${artwork.id}`);
}

/**
 * 作品を取得
 */
export async function getArtwork(id: string): Promise<Artwork | null> {
    const entry = artworkCache.get(id);

    if (!entry) {
        console.log(`[ArtworkStore] Artwork not found: ${id}`);
        return null;
    }

    // 有効期限チェック
    if (Date.now() > entry.expiresAt) {
        artworkCache.delete(id);
        console.log(`[ArtworkStore] Artwork expired: ${id}`);
        return null;
    }

    console.log(`[ArtworkStore] Retrieved artwork: ${id}`);
    return entry.artwork;
}

/**
 * 作品を削除
 */
export async function deleteArtwork(id: string): Promise<boolean> {
    const deleted = artworkCache.delete(id);
    console.log(`[ArtworkStore] Deleted artwork: ${id}, success: ${deleted}`);
    return deleted;
}

/**
 * 期限切れエントリをクリーンアップ
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, entry] of artworkCache.entries()) {
        if (now > entry.expiresAt) {
            artworkCache.delete(id);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`[ArtworkStore] Cleaned up ${cleaned} expired entries`);
    }
}

/**
 * ストアの統計情報を取得（デバッグ用）
 */
export function getStoreStats(): { size: number; maxSize: number } {
    return {
        size: artworkCache.size,
        maxSize: CACHE_CONFIG.MAX_SIZE,
    };
}
