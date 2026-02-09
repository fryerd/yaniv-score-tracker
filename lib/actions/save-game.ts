'use server';

import { createClient } from '@/lib/supabase/server';
import { GameState } from '@/types/game';
import { Json } from '@/lib/supabase/types';
import { generateShareToken } from '@/lib/share-token';

export async function saveGame(gameState: GameState): Promise<{
  success: boolean;
  shareToken?: string;
  gameId?: string;
  error?: string;
}> {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if this game was already saved (by game state id)
  const { data: existing } = await supabase
    .from('games')
    .select('id, share_token')
    .eq('created_by', user.id)
    .filter('game_data->>id', 'eq', gameState.id)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      shareToken: existing.share_token,
      gameId: existing.id,
    };
  }

  // Generate unique share token (retry on collision)
  let shareToken = generateShareToken();
  let attempts = 0;
  while (attempts < 5) {
    const { data: collision } = await supabase
      .from('games')
      .select('id')
      .eq('share_token', shareToken)
      .maybeSingle();

    if (!collision) break;
    shareToken = generateShareToken();
    attempts++;
  }

  // Find winner name
  const winner = gameState.players.find(p => p.id === gameState.winnerId);

  const { data, error } = await supabase
    .from('games')
    .insert({
      share_token: shareToken,
      game_data: gameState as unknown as Json,
      created_by: user.id,
      played_at: gameState.createdAt,
      player_names: gameState.players.map(p => p.name),
      winner_name: winner?.name ?? null,
      round_count: gameState.rounds.length,
      player_count: gameState.players.length,
    })
    .select('id, share_token')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    shareToken: data.share_token,
    gameId: data.id,
  };
}
