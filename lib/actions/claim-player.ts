'use server';

import { createClient } from '@/lib/supabase/server';

export async function claimPlayer(
  gameId: string,
  playerId: string,
  playerName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if user already claimed a player in this game
  const { data: existingClaim } = await supabase
    .from('player_claims')
    .select('id, player_name')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingClaim) {
    return { success: true }; // Already claimed, no-op
  }

  // Check if the player slot is already claimed
  const { data: slotTaken } = await supabase
    .from('player_claims')
    .select('id')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (slotTaken) {
    return { success: false, error: 'This player has already been claimed' };
  }

  const { error } = await supabase
    .from('player_claims')
    .insert({
      game_id: gameId,
      player_id: playerId,
      user_id: user.id,
      player_name: playerName,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
