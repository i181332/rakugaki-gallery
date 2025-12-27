// src/app/page.tsx
'use client';

/**
 * Rakugaki Gallery - メインアプリケーション
 * UI.htmlの設計に100%忠実な実装
 */

import React, { useState, useCallback } from 'react';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { DrawingScreen } from '@/components/screens/DrawingScreen';
import { LoadingScreen } from '@/components/screens/LoadingScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import type { EvaluateRequest, EvaluateResponse, EvaluateErrorResponse } from '@/types';

type Screen = 'login' | 'draw' | 'loading' | 'result';

interface Evaluation {
  title: string;
  artist: string;
  critique: string;
  nextExpectation: string;
  price: number;
}

interface AppState {
  screen: Screen;
  artistName: string;
  avatarSeed: string;
  imageData: string | null;
  evaluation: Evaluation | null;
}

export default function HomePage() {
  const [state, setState] = useState<AppState>({
    screen: 'login',
    artistName: '名無しのアトリエ',
    avatarSeed: 'Felix',
    imageData: null,
    evaluation: null,
  });

  const handleStart = useCallback((artistName: string, avatarSeed: string) => {
    setState((prev) => ({
      ...prev,
      screen: 'draw',
      artistName,
      avatarSeed,
    }));
  }, []);

  const handleComplete = useCallback(
    async (imageData: string) => {
      setState((prev) => ({
        ...prev,
        screen: 'loading',
        imageData,
      }));

      try {
        const requestBody: EvaluateRequest = {
          image: imageData,
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

        const evaluation: Evaluation = {
          title: data.artwork.evaluation.title,
          artist: data.artwork.evaluation.artist,
          critique: data.artwork.evaluation.critique,
          nextExpectation: data.artwork.evaluation.nextExpectation,
          price: data.artwork.evaluation.price,
        };

        setState((prev) => ({
          ...prev,
          screen: 'result',
          evaluation,
        }));
      } catch (error) {
        console.error('Evaluation error:', error);
        alert(error instanceof Error ? error.message : '評論の生成に失敗しました');
        setState((prev) => ({
          ...prev,
          screen: 'draw',
        }));
      }
    },
    []
  );

  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'draw',
    }));
  }, []);

  const handleContinue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'draw',
      imageData: null,
      evaluation: null,
    }));
  }, []);

  const handleExit = useCallback(() => {
    setState({
      screen: 'login',
      artistName: '名無しのアトリエ',
      avatarSeed: 'Felix',
      imageData: null,
      evaluation: null,
    });
  }, []);

  return (
    // UI.html: body class="bg-slate-50 text-slate-600 h-screen overflow-hidden flex flex-col items-center justify-center p-6"
    <div className="bg-slate-50 text-slate-600 h-screen overflow-hidden flex flex-col items-center justify-center p-6">
      {state.screen === 'login' && <LoginScreen onStart={handleStart} />}
      {state.screen === 'draw' && <DrawingScreen onComplete={handleComplete} />}
      {state.screen === 'loading' && <LoadingScreen />}
      {state.screen === 'result' && state.imageData && state.evaluation && (
        <ResultScreen
          imageData={state.imageData}
          evaluation={state.evaluation}
          artistName={state.artistName}
          onBack={handleBack}
          onContinue={handleContinue}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
