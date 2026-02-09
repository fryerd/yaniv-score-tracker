'use client';

import { useState, useCallback } from 'react';
import { saveGame } from '@/lib/actions/save-game';
import { GameState } from '@/types/game';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSaveGame() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (gameState: GameState) => {
    setStatus('saving');
    setError(null);

    const result = await saveGame(gameState);

    if (result.success) {
      setStatus('saved');
      setShareToken(result.shareToken ?? null);
      setGameId(result.gameId ?? null);
    } else {
      setStatus('error');
      setError(result.error ?? 'Failed to save game');
    }

    return result;
  }, []);

  return {
    save,
    status,
    shareToken,
    gameId,
    error,
    isSaved: status === 'saved',
    isSaving: status === 'saving',
  };
}
