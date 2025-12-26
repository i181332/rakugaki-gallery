/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cloudflare Pages対応
    output: 'standalone',

    // 画像最適化を無効化（Cloudflare Pagesでは非対応）
    images: {
        unoptimized: true,
    },

    // 実験的機能
    experimental: {
        // Partial Prerendering（Next.js 14.2+）
        // ppr: true,
    },

    // 環境変数をクライアントに公開しない
    // GEMINIのAPIキーはサーバーサイドでのみ使用
    env: {},

    // ログ設定
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

module.exports = nextConfig;
