/**
 * src/lib/database.types.ts
 *
 * TypeScript types auto-generated from the Supabase schema.
 * These are MANUALLY maintained (matching schema.sql) because we want
 * zero build-time Supabase CLI dependency in CI.
 *
 * When you add new columns, update this file in sync with schema.sql.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id:         string;
          title:      string;
          category:   string;
          year:       string;
          tags:       string[];
          image_url:  string;
          color:      string;
          sort_order: number;
          published:  boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };

      services: {
        Row: {
          id:          string;
          number:      string;
          title:       string;
          description: string;
          items:       string[];
          image_url:   string;
          category:    string;
          sort_order:  number;
          published:   boolean;
          created_at:  string;
          updated_at:  string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };

      team_members: {
        Row: {
          id:         string;
          name:       string;
          role:       string;
          image_url:  string;
          tags:       string[];
          sort_order: number;
          published:  boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["team_members"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
      };

      process_steps: {
        Row: {
          id:          string;
          number:      string;
          title:       string;
          description: string;
          sort_order:  number;
          created_at:  string;
          updated_at:  string;
        };
        Insert: Omit<Database["public"]["Tables"]["process_steps"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["process_steps"]["Insert"]>;
      };

      site_content: {
        Row: {
          key:         string;
          value:       string;
          description: string | null;
          updated_at:  string;
        };
        Insert: {
          key:         string;
          value:       string;
          description?: string | null;
          updated_at?:  string;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Insert"]>;
      };

      analytics_events: {
        Row: {
          id:          number;
          session_id:  string;
          event_type:  string;
          event_data:  Json | null;
          referrer:    string | null;
          user_agent:  string | null;
          country:     string | null;
          device_type: string | null;
          created_at:  string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
      };

      inquiries: {
        Row: {
          id: string;
          type: "contact" | "lead";
          name: string | null;
          email: string;
          project_type: string | null;
          budget: string | null;
          message: string | null;
          session_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inquiries"]["Row"], "id" | "created_at" | "status"> & {
          id?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
      };
    };
  };
}
