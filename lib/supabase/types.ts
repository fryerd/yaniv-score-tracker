export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_color?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_color?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      games: {
        Row: {
          id: string;
          share_token: string;
          game_data: Json;
          created_by: string;
          played_at: string;
          player_names: string[];
          winner_name: string | null;
          round_count: number;
          player_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          share_token: string;
          game_data: Json;
          created_by: string;
          played_at: string;
          player_names: string[];
          winner_name?: string | null;
          round_count: number;
          player_count: number;
        };
        Update: {
          game_data?: Json;
          player_names?: string[];
          winner_name?: string | null;
          round_count?: number;
          player_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'games_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      player_claims: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          user_id: string;
          player_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          user_id: string;
          player_name: string;
        };
        Update: {
          player_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_claims_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'player_claims_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
