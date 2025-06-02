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
      batteries: {
        Row: {
          battery_id: string
          capacity: string
          created_at: string | null
          id: string
          last_maintenance: string | null
          location: string | null
          model: string
          partner_id: string | null
          purchase_date: string | null
          status: string
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          battery_id: string
          capacity: string
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model: string
          partner_id?: string | null
          purchase_date?: string | null
          status: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          battery_id?: string
          capacity?: string
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string
          partner_id?: string | null
          purchase_date?: string | null
          status?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          battery_id: string | null
          created_at: string | null
          customer_id: string
          email: string
          id: string
          join_date: string | null
          last_payment_date: string | null
          monthly_fee: number | null
          name: string
          partner_id: string | null
          phone: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          battery_id?: string | null
          created_at?: string | null
          customer_id: string
          email: string
          id?: string
          join_date?: string | null
          last_payment_date?: string | null
          monthly_fee?: number | null
          name: string
          partner_id?: string | null
          phone?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          battery_id?: string | null
          created_at?: string | null
          customer_id?: string
          email?: string
          id?: string
          join_date?: string | null
          last_payment_date?: string | null
          monthly_fee?: number | null
          name?: string
          partner_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_battery_id_fkey"
            columns: ["battery_id"]
            isOneToOne: false
            referencedRelation: "batteries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customers_battery"
            columns: ["battery_id"]
            isOneToOne: false
            referencedRelation: "batteries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          battery_id: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          partner_id: string | null
          status: string
          transaction_date: string | null
          transaction_id: string
          type: string
        }
        Insert: {
          amount: number
          battery_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          partner_id?: string | null
          status: string
          transaction_date?: string | null
          transaction_id: string
          type: string
        }
        Update: {
          amount?: number
          battery_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          partner_id?: string | null
          status?: string
          transaction_date?: string | null
          transaction_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_battery_id_fkey"
            columns: ["battery_id"]
            isOneToOne: false
            referencedRelation: "batteries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "partner"
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
    Enums: {
      user_role: ["admin", "partner"],
    },
  },
} as const
