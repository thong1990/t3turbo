export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      abilities: {
        Row: {
          card_id: string | null
          created_at: string | null
          effect: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          effect?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          effect?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abilities_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      alternate_versions: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string
          rarity: string | null
          updated_at: string | null
          version_number: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          rarity?: string | null
          updated_at?: string | null
          version_number?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          rarity?: string | null
          updated_at?: string | null
          version_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alternate_versions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      attacks: {
        Row: {
          card_id: string | null
          costs: string[] | null
          created_at: string | null
          damage: string | null
          effect: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          costs?: string[] | null
          created_at?: string | null
          damage?: string | null
          effect?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          costs?: string[] | null
          created_at?: string | null
          damage?: string | null
          effect?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attacks_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          artist: string | null
          card_id: string
          card_type: string
          crafting_cost: number | null
          created_at: string | null
          evolution_type: string | null
          hp: number | null
          id: string
          image_url: string | null
          is_ex: boolean | null
          is_fullart: boolean | null
          name: string
          pack_type: string | null
          rarity: string | null
          retreat_cost: number | null
          set_id: string | null
          type: string | null
          updated_at: string | null
          weakness: string | null
        }
        Insert: {
          artist?: string | null
          card_id: string
          card_type: string
          crafting_cost?: number | null
          created_at?: string | null
          evolution_type?: string | null
          hp?: number | null
          id?: string
          image_url?: string | null
          is_ex?: boolean | null
          is_fullart?: boolean | null
          name: string
          pack_type?: string | null
          rarity?: string | null
          retreat_cost?: number | null
          set_id?: string | null
          type?: string | null
          updated_at?: string | null
          weakness?: string | null
        }
        Update: {
          artist?: string | null
          card_id?: string
          card_type?: string
          crafting_cost?: number | null
          created_at?: string | null
          evolution_type?: string | null
          hp?: number | null
          id?: string
          image_url?: string | null
          is_ex?: boolean | null
          is_fullart?: boolean | null
          name?: string
          pack_type?: string | null
          rarity?: string | null
          retreat_cost?: number | null
          set_id?: string | null
          type?: string | null
          updated_at?: string | null
          weakness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          channel_url: string
          created_at: string
          expires_at: string
          id: string
          participants: string[]
          status: string
          trade_id: string
          updated_at: string
        }
        Insert: {
          channel_url: string
          created_at?: string
          expires_at: string
          id?: string
          participants: string[]
          status?: string
          trade_id: string
          updated_at?: string
        }
        Update: {
          channel_url?: string
          created_at?: string
          expires_at?: string
          id?: string
          participants?: string[]
          status?: string
          trade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trade_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_cards: {
        Row: {
          card_id: string
          deck_id: string
          quantity: number
        }
        Insert: {
          card_id: string
          deck_id: string
          quantity: number
        }
        Update: {
          card_id?: string
          deck_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      probabilities: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string
          probability: number | null
          slot_type: string | null
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          probability?: number | null
          slot_type?: string | null
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          probability?: number | null
          slot_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "probabilities_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          id: string
          image_url: string | null
          set_code: string
          set_id: string
          set_name: string
        }
        Insert: {
          id?: string
          image_url?: string | null
          set_code: string
          set_id: string
          set_name: string
        }
        Update: {
          id?: string
          image_url?: string | null
          set_code?: string
          set_id?: string
          set_name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          payment_data: Json | null
          payment_provider: string | null
          plan_type: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          payment_data?: Json | null
          payment_provider?: string | null
          plan_type?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          payment_data?: Json | null
          payment_provider?: string | null
          plan_type?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_chats: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          trade_session_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          trade_session_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          trade_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_chats_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_chats_trade_session_id_fkey"
            columns: ["trade_session_id"]
            isOneToOne: false
            referencedRelation: "trade_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_session_card: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string
          quantity: number
          trade_session_id: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          quantity: number
          trade_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number
          trade_session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_session_card_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_session_card_trade_session_id_fkey"
            columns: ["trade_session_id"]
            isOneToOne: false
            referencedRelation: "trade_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_session_card_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_sessions: {
        Row: {
          created_at: string | null
          expired_at: string | null
          id: string
          initiator_id: string | null
          receiver_id: string | null
          sendbird_channel_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expired_at?: string | null
          id?: string
          initiator_id?: string | null
          receiver_id?: string | null
          sendbird_channel_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expired_at?: string | null
          id?: string
          initiator_id?: string | null
          receiver_id?: string | null
          sendbird_channel_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_sessions_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_sessions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          card_id: string
          id: string
          last_updated: string
          notes: string | null
          priority: number
          quantity_desired: number
          quantity_owned: number
          quantity_tradeable: number
          user_id: string
        }
        Insert: {
          card_id: string
          id?: string
          last_updated?: string
          notes?: string | null
          priority?: number
          quantity_desired?: number
          quantity_owned?: number
          quantity_tradeable?: number
          user_id: string
        }
        Update: {
          card_id?: string
          id?: string
          last_updated?: string
          notes?: string | null
          priority?: number
          quantity_desired?: number
          quantity_owned?: number
          quantity_tradeable?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_deck_interactions: {
        Row: {
          created_at: string
          deck_id: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_deck_interactions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_deck_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          failed_trades: number | null
          game_account_id: string | null
          game_account_ign: string | null
          id: string
          successful_trades: number | null
          total_trades: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          failed_trades?: number | null
          game_account_id?: string | null
          game_account_ign?: string | null
          id: string
          successful_trades?: number | null
          total_trades?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          failed_trades?: number | null
          game_account_id?: string | null
          game_account_ign?: string | null
          id?: string
          successful_trades?: number | null
          total_trades?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      utility_tokens: {
        Row: {
          amount: number
          created_at: string | null
          expires_at: string | null
          id: string
          token_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          token_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          token_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utility_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
