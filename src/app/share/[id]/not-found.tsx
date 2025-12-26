// src/app/share/[id]/not-found.tsx
/**
 * シェアページの404エラー表示
 */

import Link from 'next/link';
import { Home, Pencil } from 'lucide-react';

export default function ShareNotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
            <div className="text-center px-4">
                <div className="text-6xl mb-6">🖼️</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    作品が見つかりません
                </h1>
                <p className="text-gray-600 mb-8 max-w-md">
                    この作品は存在しないか、保存期限が切れています。
                    <br />
                    作品は作成から24時間後に自動的に削除されます。
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                        <Pencil size={18} />
                        新しく描く
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Home size={18} />
                        トップへ戻る
                    </Link>
                </div>
            </div>
        </main>
    );
}
