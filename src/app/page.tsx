// src/app/page.tsx
'use client';

/**
 * Rakugaki Gallery - メインページ
 *
 * 画面ステートに応じた表示を制御
 * - drawing: 描画キャンバス
 * - evaluating: ローディング
 * - gallery: 評論結果表示
 */

import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pencil, RotateCcw } from 'lucide-react';
import { DrawingCanvas, type DrawingCanvasHandle } from '@/components/canvas/DrawingCanvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { ShareButtons } from '@/components/share/ShareButtons';
import { Button } from '@/components/ui/Button';
import {
  useGalleryStore,
  useCurrentScreen,
  useError,
  useCurrentArtwork,
} from '@/stores/galleryStore';
import type { EvaluateRequest, EvaluateResponse, EvaluateErrorResponse } from '@/types';

// ============================================================
// コンポーネント
// ============================================================

export default function HomePage() {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentScreen = useCurrentScreen();
  const error = useError();
  const currentArtwork = useCurrentArtwork();
  const { setScreen, setCurrentArtwork, setError, reset } =
    useGalleryStore();

  // 評論をリクエスト
  const handleSubmit = useCallback(async () => {
    const image = canvasRef.current?.getImage();

    if (!image) {
      setError('キャンバスに何か描いてください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setScreen('evaluating');

    try {
      // 続編機能: 直近の作品情報を取得
      const { artworkHistory } = useGalleryStore.getState();
      const lastArtwork = artworkHistory[artworkHistory.length - 1];

      const requestBody: EvaluateRequest = {
        image,
        previousWork: lastArtwork
          ? {
            id: lastArtwork.id,
            title: lastArtwork.evaluation.title,
            artist: lastArtwork.evaluation.artist,
            critique: lastArtwork.evaluation.critique,
            price: lastArtwork.evaluation.price,
            seriesNumber: lastArtwork.seriesNumber,
          }
          : undefined,
      };

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: EvaluateResponse | EvaluateErrorResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setCurrentArtwork(data.artwork);
      setScreen('gallery');
    } catch (err) {
      console.error('[HomePage] Submit error:', err);
      setError(
        err instanceof Error
          ? err.message
          : '評論の生成に失敗しました。もう一度お試しください。'
      );
      setScreen('drawing');
    } finally {
      setIsSubmitting(false);
    }
  }, [setScreen, setCurrentArtwork, setError]);

  // 新しい作品を描く
  const handleNewArtwork = useCallback(() => {
    canvasRef.current?.clear();
    reset();
  }, [reset]);

  // 続けて描く（同じアーティストとして）
  const handleContinue = useCallback(() => {
    canvasRef.current?.clear();
    setScreen('drawing');
    setError(null);
  }, [setScreen, setError]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <span className="hidden sm:inline">Rakugaki Gallery</span>
            <span className="sm:hidden">落書き美術館</span>
          </h1>
          {currentScreen !== 'drawing' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewArtwork}
              leftIcon={<Pencil size={16} />}
            >
              新しく描く
            </Button>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* 描画画面 */}
          {currentScreen === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* 説明 */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  あなたの落書きを評論します
                </h2>
                <p className="text-gray-500">
                  どんな落書きでも、世界的美術評論家が大真面目に評価します
                </p>
              </div>

              {/* キャンバス */}
              <DrawingCanvas ref={canvasRef} />

              {/* ツールバー */}
              <Toolbar />

              {/* エラー表示 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* 送信ボタン */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  leftIcon={<Sparkles size={20} />}
                  className="min-w-[200px]"
                >
                  評論をもらう
                </Button>
              </div>
            </motion.div>
          )}

          {/* ローディング画面 */}
          {currentScreen === 'evaluating' && (
            <motion.div
              key="evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingAnimation />
            </motion.div>
          )}

          {/* 結果表示画面 */}
          {currentScreen === 'gallery' && currentArtwork && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* ギャラリーカード */}
              <GalleryCard ref={cardRef} artwork={currentArtwork} />

              {/* シェアボタン */}
              <ShareButtons artwork={currentArtwork} cardRef={cardRef} />

              {/* 続けて描くボタン */}
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  variant="secondary"
                  onClick={handleContinue}
                  leftIcon={<RotateCcw size={18} />}
                >
                  続けて描く
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* フッター */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
        <p>
          🧐 評論家: ジャン＝ピエール・デュボワ
        </p>
        <p className="mt-1">
          ※ 本アプリの評論はAIによるパロディです
        </p>
      </footer>
    </main>
  );
}
