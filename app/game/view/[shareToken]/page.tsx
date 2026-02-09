import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GameState } from '@/types/game';
import { GameViewClient } from './game-view-client';
import { Database } from '@/lib/supabase/types';

type GameRow = Database['public']['Tables']['games']['Row'];

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default async function SharedGamePage({ params }: PageProps) {
  const { shareToken } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('share_token', shareToken)
    .returns<GameRow[]>()
    .single();

  if (!game) {
    notFound();
  }

  // Fetch player claims for this game
  const { data: claims } = await supabase
    .from('player_claims')
    .select('*')
    .eq('game_id', game.id)
    .returns<{ player_id: string; user_id: string; player_name: string }[]>();

  const gameData = game.game_data as unknown as GameState;

  return (
    <GameViewClient
      gameData={gameData}
      claims={claims ?? []}
      playedAt={game.played_at}
    />
  );
}
