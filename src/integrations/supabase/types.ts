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
      activities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          check_ins: number | null
          count: number
          created_at: string | null
          date: string
          event_id: string | null
          id: string
          new_visitors: number | null
          notes: string | null
          organization_id: string
          recorded_by: string | null
          service_type: string
          updated_at: string | null
        }
        Insert: {
          check_ins?: number | null
          count: number
          created_at?: string | null
          date: string
          event_id?: string | null
          id?: string
          new_visitors?: number | null
          notes?: string | null
          organization_id: string
          recorded_by?: string | null
          service_type: string
          updated_at?: string | null
        }
        Update: {
          check_ins?: number | null
          count?: number
          created_at?: string | null
          date?: string
          event_id?: string | null
          id?: string
          new_visitors?: number | null
          notes?: string | null
          organization_id?: string
          recorded_by?: string | null
          service_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      church_info: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          organization_id: string
          phone: string | null
          service_times: Json | null
          state: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          organization_id: string
          phone?: string | null
          service_times?: Json | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          organization_id?: string
          phone?: string | null
          service_times?: Json | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      domains: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          id: string
          organization_id: string | null
          provisioned: boolean | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          organization_id?: string | null
          provisioned?: boolean | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          organization_id?: string | null
          provisioned?: boolean | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          donation_date: string
          donor_id: string | null
          fund: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          organization_id: string
          payment_method: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          donation_date: string
          donor_id?: string | null
          fund?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          organization_id: string
          payment_method?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          donation_date?: string
          donor_id?: string | null
          fund?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          organization_id?: string
          payment_method?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          location: string | null
          organization_id: string
          recurrence_pattern: Json | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          organization_id: string
          recurrence_pattern?: Json | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          organization_id?: string
          recurrence_pattern?: Json | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      funds: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          description: string | null
          id: string
          name: string
          slug: string
          subdomain: string | null
          website_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          subdomain?: string | null
          website_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          subdomain?: string | null
          website_enabled?: boolean | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_homepage: boolean
          meta_description: string | null
          meta_title: string | null
          organization_id: string
          parent_id: string | null
          published: boolean
          show_in_navigation: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_homepage?: boolean
          meta_description?: string | null
          meta_title?: string | null
          organization_id: string
          parent_id?: string | null
          published?: boolean
          show_in_navigation?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_homepage?: boolean
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string
          parent_id?: string | null
          published?: boolean
          show_in_navigation?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          organization_id: string
          payment_method: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          organization_id: string
          payment_method?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          organization_id?: string
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          payment_method: Json | null
          subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          payment_method?: Json | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          payment_method?: Json | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          path: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          path?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_integrations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          stripe_account_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_account_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_account_id?: string
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          created_at: string | null
          id: string
          price_id: string
          quantity: number
          stripe_item_id: string | null
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_id: string
          quantity?: number
          stripe_item_id?: string | null
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_id?: string
          quantity?: number
          stripe_item_id?: string | null
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          organization_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      super_admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      super_admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          count: number
          created_at: string | null
          feature: string
          id: string
          last_used: string | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          count?: number
          created_at?: string | null
          feature: string
          id?: string
          last_used?: string | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          count?: number
          created_at?: string | null
          feature?: string
          id?: string
          last_used?: string | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_if_super_admin: {
        Args: Record<PropertyKey, never> | { target_user_id: string }
        Returns: boolean
      }
      check_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_super_admin: boolean
        }[]
      }
      check_super_admin_fixed: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_super_admin: boolean
        }[]
      }
      direct_super_admin_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      exec_sql: {
        Args: { query: string }
        Returns: undefined
      }
      fetch_user_claims: {
        Args: Record<PropertyKey, never> | { target_user_id: string }
        Returns: Json
      }
      fetch_user_organizations: {
        Args: Record<PropertyKey, never> | { target_user_id: string }
        Returns: {
          id: string
          name: string
          subdomain: string
          custom_domain: string
          created_at: string
          updated_at: string
          role: string
        }[]
      }
      fetch_user_roles: {
        Args: Record<PropertyKey, never> | { target_user_id: string }
        Returns: {
          organization_id: string
          role: string
        }[]
      }
      get_all_organizations_for_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          role: string
        }[]
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_super_admin: boolean
        }[]
      }
      get_single_super_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_super_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_super_admin: boolean
        }[]
      }
      get_super_admin_status_fixed: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_claims: {
        Args: { user_id?: string }
        Returns: Json
      }
      get_user_organizations: {
        Args: Record<PropertyKey, never> | { user_id?: string }
        Returns: {
          id: string
          name: string
          subdomain: string
          custom_domain: string
          created_at: string
          updated_at: string
          role: string
        }[]
      }
      get_user_roles: {
        Args: { user_id?: string }
        Returns: {
          organization_id: string
          role: string
        }[]
      }
      is_member_of_org: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_super_admin_by_id: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_super_admin_direct: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      rbac_get_user_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rbac_get_user_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          role: string
        }[]
      }
      rbac_get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          organization_id: string
          role: string
        }[]
      }
      rbac_is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      safe_super_admin_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      safe_super_admin_check_for_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      simple_get_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          role: string
        }[]
      }
      simple_is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      super_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      super_admin_view_all_members: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          organization_id: string
          organization_name: string
          user_id: string
          user_email: string
          role: string
          created_at: string
        }[]
      }
      super_admin_view_all_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          custom_domain: string | null
          description: string | null
          id: string
          name: string
          slug: string
          subdomain: string | null
          website_enabled: boolean | null
        }[]
      }
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
