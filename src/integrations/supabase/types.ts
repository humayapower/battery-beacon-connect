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
          capacity: string
          created_at: string
          customer_id: string | null
          id: string
          imei_number: string | null
          last_maintenance: string | null
          location: string | null
          manufacturing_date: string | null
          model: string
          model_name: string | null
          partner_id: string | null
          purchase_date: string | null
          serial_number: string
          sim_number: string | null
          status: string
          updated_at: string
          voltage: number | null
          warranty_expiry: string | null
          warranty_period: number | null
        }
        Insert: {
          capacity: string
          created_at?: string
          customer_id?: string | null
          id?: string
          imei_number?: string | null
          last_maintenance?: string | null
          location?: string | null
          manufacturing_date?: string | null
          model: string
          model_name?: string | null
          partner_id?: string | null
          purchase_date?: string | null
          serial_number: string
          sim_number?: string | null
          status?: string
          updated_at?: string
          voltage?: number | null
          warranty_expiry?: string | null
          warranty_period?: number | null
        }
        Update: {
          capacity?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          imei_number?: string | null
          last_maintenance?: string | null
          location?: string | null
          manufacturing_date?: string | null
          model?: string
          model_name?: string | null
          partner_id?: string | null
          purchase_date?: string | null
          serial_number?: string
          sim_number?: string | null
          status?: string
          updated_at?: string
          voltage?: number | null
          warranty_expiry?: string | null
          warranty_period?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batteries_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_batteries_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          aadhaar_back_url: string | null
          aadhaar_front_url: string | null
          address: string | null
          battery_id: string | null
          created_at: string
          customer_id: string | null
          customer_photo_url: string | null
          email: string | null
          id: string
          id_type: string | null
          join_date: string | null
          last_payment_date: string | null
          monthly_amount: number | null
          name: string
          pan_card_url: string | null
          partner_id: string | null
          payment_type: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          address?: string | null
          battery_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_photo_url?: string | null
          email?: string | null
          id?: string
          id_type?: string | null
          join_date?: string | null
          last_payment_date?: string | null
          monthly_amount?: number | null
          name: string
          pan_card_url?: string | null
          partner_id?: string | null
          payment_type: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          address?: string | null
          battery_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_photo_url?: string | null
          email?: string | null
          id?: string
          id_type?: string | null
          join_date?: string | null
          last_payment_date?: string | null
          monthly_amount?: number | null
          name?: string
          pan_card_url?: string | null
          partner_id?: string | null
          payment_type?: string
          phone?: string
          status?: string
          updated_at?: string
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
            foreignKeyName: "customers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          password_hash: string
          phone: string
          updated_at: string
          username: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          password_hash: string
          phone: string
          updated_at?: string
          username: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          password_hash?: string
          phone?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          battery_id: string | null
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          partner_id: string | null
          payment_status: string
          remarks: string | null
          transaction_date: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          battery_id?: string | null
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          partner_id?: string | null
          payment_status?: string
          remarks?: string | null
          transaction_date?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          battery_id?: string | null
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          partner_id?: string | null
          payment_status?: string
          remarks?: string | null
          transaction_date?: string | null
          transaction_type?: string
          updated_at?: string
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
          {
            foreignKeyName: "transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          password_hash: string
          phone: string
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          password_hash: string
          phone: string
          role: string
          updated_at?: string
          username: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          password_hash?: string
          phone?: string
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_user: {
        Args: { p_username: string; p_password_hash: string }
        Returns: {
          id: string
          name: string
          phone: string
          username: string
          address: string
          role: string
        }[]
      }
      create_user: {
        Args: {
          p_name: string
          p_phone: string
          p_username: string
          p_password_hash: string
          p_role: string
          p_address?: string
        }
        Returns: string
      }
      get_partners_with_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          phone: string
          username: string
          address: string
          created_at: string
          updated_at: string
          battery_count: number
          customer_count: number
        }[]
      }
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
