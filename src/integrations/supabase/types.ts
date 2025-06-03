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
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          display_order: number | null
          end_date: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          organization_id: string
          priority: string | null
          start_date: string | null
          target_audience: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          end_date?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          organization_id: string
          priority?: string | null
          start_date?: string | null
          target_audience?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          end_date?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          organization_id?: string
          priority?: string | null
          start_date?: string | null
          target_audience?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      component_permissions: {
        Row: {
          category: string | null
          component_id: string
          created_at: string
          dependencies: string[] | null
          description: string | null
          display_name: string | null
          enabled: boolean
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          component_id: string
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          display_name?: string | null
          enabled?: boolean
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          component_id?: string
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          display_name?: string | null
          enabled?: boolean
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_form_fields: {
        Row: {
          conditional_logic: Json | null
          created_at: string
          field_name: string
          field_options: Json | null
          field_order: number
          field_type: string
          form_id: string
          help_text: string | null
          id: string
          is_required: boolean
          label: string
          placeholder: string | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string
          field_name: string
          field_options?: Json | null
          field_order?: number
          field_type: string
          form_id: string
          help_text?: string | null
          id?: string
          is_required?: boolean
          label: string
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string
          field_name?: string
          field_options?: Json | null
          field_order?: number
          field_type?: string
          form_id?: string
          help_text?: string | null
          id?: string
          is_required?: boolean
          label?: string
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "contact_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_form_submissions: {
        Row: {
          admin_notes: string | null
          auto_response_sent: boolean
          created_at: string
          email_sent: boolean
          form_data: Json
          form_id: string
          id: string
          organization_id: string
          referrer: string | null
          status: string
          submitted_from_ip: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          auto_response_sent?: boolean
          created_at?: string
          email_sent?: boolean
          form_data: Json
          form_id: string
          id?: string
          organization_id: string
          referrer?: string | null
          status?: string
          submitted_from_ip?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          auto_response_sent?: boolean
          created_at?: string
          email_sent?: boolean
          form_data?: Json
          form_id?: string
          id?: string
          organization_id?: string
          referrer?: string | null
          status?: string
          submitted_from_ip?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "contact_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_forms: {
        Row: {
          allow_file_uploads: boolean
          auto_responder: boolean
          created_at: string
          description: string | null
          email_notifications: boolean
          id: string
          is_active: boolean
          max_file_size: number | null
          name: string
          organization_id: string
          redirect_url: string | null
          require_approval: boolean
          slug: string
          spam_protection: boolean
          success_message: string | null
          updated_at: string
        }
        Insert: {
          allow_file_uploads?: boolean
          auto_responder?: boolean
          created_at?: string
          description?: string | null
          email_notifications?: boolean
          id?: string
          is_active?: boolean
          max_file_size?: number | null
          name: string
          organization_id: string
          redirect_url?: string | null
          require_approval?: boolean
          slug: string
          spam_protection?: boolean
          success_message?: string | null
          updated_at?: string
        }
        Update: {
          allow_file_uploads?: boolean
          auto_responder?: boolean
          created_at?: string
          description?: string | null
          email_notifications?: boolean
          id?: string
          is_active?: boolean
          max_file_size?: number | null
          name?: string
          organization_id?: string
          redirect_url?: string | null
          require_approval?: boolean
          slug?: string
          spam_protection?: boolean
          success_message?: string | null
          updated_at?: string
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
      email_configurations: {
        Row: {
          created_at: string
          from_email: string
          from_name: string
          id: string
          notification_emails: string[] | null
          organization_id: string
          reply_to_email: string | null
          smtp_enabled: boolean
          smtp_settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          notification_emails?: string[] | null
          organization_id: string
          reply_to_email?: string | null
          smtp_enabled?: boolean
          smtp_settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          notification_emails?: string[] | null
          organization_id?: string
          reply_to_email?: string | null
          smtp_enabled?: boolean
          smtp_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          form_id: string | null
          html_content: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          form_id?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          form_id?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "contact_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      enabled_components: {
        Row: {
          component_id: string
          configuration: Json | null
          created_at: string
          id: string
          is_active: boolean
          organization_id: string | null
          position: number | null
          updated_at: string
        }
        Insert: {
          component_id: string
          configuration?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          position?: number | null
          updated_at?: string
        }
        Update: {
          component_id?: string
          configuration?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          position?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enabled_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attendee_email: string
          attendee_name: string
          attendee_phone: string | null
          created_at: string
          event_id: string
          id: string
          notes: string | null
          organization_id: string
          registration_date: string
          status: string
        }
        Insert: {
          attendee_email: string
          attendee_name: string
          attendee_phone?: string | null
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          organization_id: string
          registration_date?: string
          status?: string
        }
        Update: {
          attendee_email?: string
          attendee_name?: string
          attendee_phone?: string | null
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          registration_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          organization_id: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          organization_id: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_time: string
          featured: boolean
          id: string
          is_recurring: boolean | null
          location: string | null
          max_attendees: number | null
          organization_id: string
          published: boolean
          recurrence_pattern: Json | null
          registration_deadline: string | null
          registration_required: boolean
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_time: string
          featured?: boolean
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organization_id: string
          published?: boolean
          recurrence_pattern?: Json | null
          registration_deadline?: string | null
          registration_required?: boolean
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string
          featured?: boolean
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organization_id?: string
          published?: boolean
          recurrence_pattern?: Json | null
          registration_deadline?: string | null
          registration_required?: boolean
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      form_submission_attachments: {
        Row: {
          created_at: string
          field_name: string
          file_size: number
          id: string
          mime_type: string
          original_filename: string
          storage_path: string
          stored_filename: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          field_name: string
          file_size: number
          id?: string
          mime_type: string
          original_filename: string
          storage_path: string
          stored_filename: string
          submission_id: string
        }
        Update: {
          created_at?: string
          field_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_filename?: string
          storage_path?: string
          stored_filename?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_attachments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "contact_form_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      media_files: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          created_by: string | null
          duration: number | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          height: number | null
          id: string
          is_active: boolean | null
          mime_type: string
          organization_id: string
          source_id: string | null
          source_type: string
          source_url: string | null
          tags: string[] | null
          thumbnail_path: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          mime_type: string
          organization_id: string
          source_id?: string | null
          source_type?: string
          source_url?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string
          organization_id?: string
          source_id?: string | null
          source_type?: string
          source_url?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_quotas: {
        Row: {
          created_at: string | null
          id: string
          image_count: number | null
          image_limit: number | null
          organization_id: string
          storage_limit_bytes: number | null
          storage_used_bytes: number | null
          updated_at: string | null
          video_duration_limit_seconds: number | null
          video_duration_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_count?: number | null
          image_limit?: number | null
          organization_id: string
          storage_limit_bytes?: number | null
          storage_used_bytes?: number | null
          updated_at?: string | null
          video_duration_limit_seconds?: number | null
          video_duration_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_count?: number | null
          image_limit?: number | null
          organization_id?: string
          storage_limit_bytes?: number | null
          storage_used_bytes?: number | null
          updated_at?: string | null
          video_duration_limit_seconds?: number | null
          video_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_quotas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          contact_email: string | null
          contact_role: string | null
          created_at: string | null
          current_tier: string | null
          custom_domain: string | null
          description: string | null
          id: string
          name: string
          pastor_name: string | null
          phone_number: string | null
          slug: string
          subdomain: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
          website_enabled: boolean | null
        }
        Insert: {
          contact_email?: string | null
          contact_role?: string | null
          created_at?: string | null
          current_tier?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          name: string
          pastor_name?: string | null
          phone_number?: string | null
          slug: string
          subdomain?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          website_enabled?: boolean | null
        }
        Update: {
          contact_email?: string | null
          contact_role?: string | null
          created_at?: string | null
          current_tier?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          name?: string
          pastor_name?: string | null
          phone_number?: string | null
          slug?: string
          subdomain?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          website_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_current_tier_fkey"
            columns: ["current_tier"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["name"]
          },
        ]
      }
      page_versions: {
        Row: {
          change_description: string | null
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_major_version: boolean | null
          meta_description: string | null
          meta_title: string | null
          page_id: string
          published_at: string | null
          title: string
          version_number: number
        }
        Insert: {
          change_description?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_major_version?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          page_id: string
          published_at?: string | null
          title: string
          version_number: number
        }
        Update: {
          change_description?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_major_version?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          page_id?: string
          published_at?: string | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: Json
          created_at: string
          current_version: number | null
          draft_version: number | null
          id: string
          is_homepage: boolean
          meta_description: string | null
          meta_title: string | null
          organization_id: string
          parent_id: string | null
          published: boolean
          published_version: number | null
          show_in_navigation: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          current_version?: number | null
          draft_version?: number | null
          id?: string
          is_homepage?: boolean
          meta_description?: string | null
          meta_title?: string | null
          organization_id: string
          parent_id?: string | null
          published?: boolean
          published_version?: number | null
          show_in_navigation?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          current_version?: number | null
          draft_version?: number | null
          id?: string
          is_homepage?: boolean
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string
          parent_id?: string | null
          published?: boolean
          published_version?: number | null
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
      site_settings: {
        Row: {
          created_at: string
          favicon_url: string | null
          footer_config: Json
          header_config: Json
          id: string
          logo_url: string | null
          organization_id: string
          site_description: string | null
          site_title: string
          theme_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          favicon_url?: string | null
          footer_config?: Json
          header_config?: Json
          id?: string
          logo_url?: string | null
          organization_id: string
          site_description?: string | null
          site_title: string
          theme_config?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          favicon_url?: string | null
          footer_config?: Json
          header_config?: Json
          id?: string
          logo_url?: string | null
          organization_id?: string
          site_description?: string | null
          site_title?: string
          theme_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          phone: string | null
          photo_url: string | null
          position: string
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          photo_url?: string | null
          position: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          photo_url?: string | null
          position?: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_integrations: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean
          organization_id: string | null
          stripe_account_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean
          organization_id?: string | null
          stripe_account_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean
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
      subscription_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      super_admin_component_control: {
        Row: {
          category: string | null
          component_id: string
          created_at: string | null
          description: string | null
          id: string
          is_globally_enabled: boolean | null
          minimum_tier_required: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          component_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_globally_enabled?: boolean | null
          minimum_tier_required?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          component_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_globally_enabled?: boolean | null
          minimum_tier_required?: string | null
          updated_at?: string | null
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
      tier_component_permissions: {
        Row: {
          component_id: string
          created_at: string | null
          id: string
          is_included: boolean | null
          tier_id: string | null
        }
        Insert: {
          component_id: string
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          tier_id?: string | null
        }
        Update: {
          component_id?: string
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          tier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tier_component_permissions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
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
      can_organization_enable_component: {
        Args: { org_id: string; comp_id: string }
        Returns: boolean
      }
      check_if_super_admin: {
        Args: Record<PropertyKey, never> | { target_user_id: string }
        Returns: boolean
      }
      check_media_quota: {
        Args: {
          org_id: string
          file_type_param: string
          file_size_param: number
          duration_param?: number
        }
        Returns: boolean
      }
      check_subdomain_availability: {
        Args: { subdomain_name: string }
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
      create_default_contact_form: {
        Args: { org_id: string }
        Returns: string
      }
      create_page_version: {
        Args: {
          target_page_id: string
          new_title: string
          new_content: Json
          new_meta_title?: string
          new_meta_description?: string
          change_desc?: string
          is_major?: boolean
        }
        Returns: number
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
      get_available_components: {
        Args: { org_id: string }
        Returns: {
          component_id: string
          enabled: boolean
          configuration: Json
        }[]
      }
      get_enabled_church_components: {
        Args: { org_id: string }
        Returns: {
          component_id: string
          display_name: string
          description: string
          enabled: boolean
          configuration: Json
        }[]
      }
      get_my_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_super_admin: boolean
        }[]
      }
      get_organization_available_components: {
        Args: { org_id: string }
        Returns: {
          component_id: string
          display_name: string
          description: string
          category: string
          is_globally_enabled: boolean
          minimum_tier_required: string
          is_tier_included: boolean
          is_org_enabled: boolean
          can_enable: boolean
        }[]
      }
      get_page_version_history: {
        Args: { target_page_id: string }
        Returns: {
          version_number: number
          title: string
          created_at: string
          created_by_email: string
          change_description: string
          is_major_version: boolean
          is_published: boolean
          is_current: boolean
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
      publish_page_version: {
        Args: { target_page_id: string; target_version?: number }
        Returns: boolean
      }
      rbac_fetch_user_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          subdomain: string
          role: string
        }[]
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
      revert_to_page_version: {
        Args: { target_page_id: string; target_version: number }
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
      setup_new_organization: {
        Args: {
          org_name: string
          org_subdomain: string
          pastor_name?: string
          contact_email?: string
          contact_role?: string
          phone_number?: string
        }
        Returns: string
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
          contact_email: string | null
          contact_role: string | null
          created_at: string | null
          current_tier: string | null
          custom_domain: string | null
          description: string | null
          id: string
          name: string
          pastor_name: string | null
          phone_number: string | null
          slug: string
          subdomain: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
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
