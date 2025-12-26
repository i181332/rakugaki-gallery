/** @type {import('next').NextConfig} */
const nextConfig = {
    // 画像最適化を無効化（Cloudflare Pagesでは非対応）
    images: {
        unoptimized: true,
    },

    // 環境変数をクライアントに公開しない
    // GEMINIのAPIキーはサーバーサイドでのみ使用
    env: {},
};

module.exports = nextConfig;
