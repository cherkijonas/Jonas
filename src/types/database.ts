export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'member'
          company_code: string | null
          assigned_team_id: string | null
          bio: string | null
          phone: string | null
          location: string | null
          preferences: Json
          connected_tools: Json
          health_score: number
          last_activity_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          company_code?: string | null
          assigned_team_id?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          preferences?: Json
          connected_tools?: Json
          health_score?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          company_code?: string | null
          assigned_team_id?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          preferences?: Json
          connected_tools?: Json
          health_score?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          created_by?: string | null
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          team_id: string
          tool_name: string
          status: 'connected' | 'error' | 'disconnected'
          config: Json
          last_sync: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          tool_name: string
          status?: 'connected' | 'error' | 'disconnected'
          config?: Json
          last_sync?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          tool_name?: string
          status?: 'connected' | 'error' | 'disconnected'
          config?: Json
          last_sync?: string | null
          created_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          team_id: string
          tool: string
          title: string
          description: string
          severity: 'critical' | 'high' | 'medium' | 'low'
          status: 'open' | 'in_progress' | 'resolved' | 'snoozed'
          assigned_to: string | null
          snoozed_until: string | null
          metadata: Json
          detected_at: string
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          tool: string
          title: string
          description: string
          severity: 'critical' | 'high' | 'medium' | 'low'
          status?: 'open' | 'in_progress' | 'resolved' | 'snoozed'
          assigned_to?: string | null
          snoozed_until?: string | null
          metadata?: Json
          detected_at?: string
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          tool?: string
          title?: string
          description?: string
          severity?: 'critical' | 'high' | 'medium' | 'low'
          status?: 'open' | 'in_progress' | 'resolved' | 'snoozed'
          assigned_to?: string | null
          snoozed_until?: string | null
          metadata?: Json
          detected_at?: string
          resolved_at?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          team_id: string
          user_id: string | null
          action_type: string
          entity_type: string
          entity_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id?: string | null
          action_type: string
          entity_type: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string | null
          action_type?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          theme: string
          language: string
          timezone: string
          settings: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean
          theme?: string
          language?: string
          timezone?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notifications_enabled?: boolean
          theme?: string
          language?: string
          timezone?: string
          settings?: Json
          updated_at?: string
        }
      }
      employee_metrics: {
        Row: {
          id: string
          user_id: string
          requests_submitted: number
          requests_approved: number
          requests_rejected: number
          integrations_connected: number
          issues_resolved: number
          teams_joined: number
          activity_score: number
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          requests_submitted?: number
          requests_approved?: number
          requests_rejected?: number
          integrations_connected?: number
          issues_resolved?: number
          teams_joined?: number
          activity_score?: number
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          requests_submitted?: number
          requests_approved?: number
          requests_rejected?: number
          integrations_connected?: number
          issues_resolved?: number
          teams_joined?: number
          activity_score?: number
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      employee_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_date: string | null
          progress: number
          status: 'active' | 'completed' | 'abandoned' | 'paused'
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          target_date?: string | null
          progress?: number
          status?: 'active' | 'completed' | 'abandoned' | 'paused'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_date?: string | null
          progress?: number
          status?: 'active' | 'completed' | 'abandoned' | 'paused'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      employee_feedback: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          feedback_text: string
          rating: number | null
          type: 'general' | 'performance' | 'recognition' | 'improvement'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          feedback_text: string
          rating?: number | null
          type?: 'general' | 'performance' | 'recognition' | 'improvement'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          feedback_text?: string
          rating?: number | null
          type?: 'general' | 'performance' | 'recognition' | 'improvement'
          is_read?: boolean
          created_at?: string
        }
      }
      frictions: {
        Row: {
          id: string
          user_id: string
          tool_name: string
          friction_type: string
          title: string
          description: string | null
          severity: 'high' | 'medium' | 'low'
          is_resolved: boolean
          resolved_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_name: string
          friction_type: string
          title: string
          description?: string | null
          severity?: 'high' | 'medium' | 'low'
          is_resolved?: boolean
          resolved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_name?: string
          friction_type?: string
          title?: string
          description?: string | null
          severity?: 'high' | 'medium' | 'low'
          is_resolved?: boolean
          resolved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      request_comments: {
        Row: {
          id: string
          request_id: string
          user_id: string
          comment_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          comment_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
