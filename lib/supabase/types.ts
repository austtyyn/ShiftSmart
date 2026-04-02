export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "manager" | "crew";
export type MessageUrgency = "normal" | "heads_up" | "911";
export type MessageType = "message" | "handoff" | "task" | "swap_request" | "quick_reply";
export type PresenceStatus = "on_shift" | "off_shift" | "starting_soon" | "unavailable";
export type SwapStatus = "open" | "pending_approval" | "approved" | "cancelled";
export type TaskUrgency = "low" | "medium" | "high";
export type AvailabilityType = "recurring" | "block_out" | "constraint";

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand?: string | null;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string | null;
          owner_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          avatar_emoji: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          avatar_emoji?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          avatar_emoji?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string | null;
          location_id: string | null;
          role: UserRole;
          joined_at: string;
          is_active: boolean;
          presence: PresenceStatus;
          presence_updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          location_id?: string | null;
          role?: UserRole;
          joined_at?: string;
          is_active?: boolean;
          presence?: PresenceStatus;
          presence_updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          location_id?: string | null;
          role?: UserRole;
          joined_at?: string;
          is_active?: boolean;
          presence?: PresenceStatus;
          presence_updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          location_id: string | null;
          sender_id: string | null;
          content: string;
          is_announcement: boolean;
          urgency: MessageUrgency;
          message_type: MessageType;
          thread_parent_id: string | null;
          thread_reply_count: number;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id?: string | null;
          sender_id?: string | null;
          content: string;
          is_announcement?: boolean;
          urgency?: MessageUrgency;
          message_type?: MessageType;
          thread_parent_id?: string | null;
          thread_reply_count?: number;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string | null;
          sender_id?: string | null;
          content?: string;
          is_announcement?: boolean;
          urgency?: MessageUrgency;
          message_type?: MessageType;
          thread_parent_id?: string | null;
          thread_reply_count?: number;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      acknowledgements: {
        Row: {
          id: string;
          message_id: string | null;
          user_id: string | null;
          acknowledged_at: string;
        };
        Insert: {
          id?: string;
          message_id?: string | null;
          user_id?: string | null;
          acknowledged_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string | null;
          user_id?: string | null;
          acknowledged_at?: string;
        };
        Relationships: [];
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          location_id: string | null;
          created_by: string | null;
          role: UserRole;
          expires_at: string;
          used_by: string | null;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          location_id?: string | null;
          created_by?: string | null;
          role?: UserRole;
          expires_at?: string;
          used_by?: string | null;
          used_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          location_id?: string | null;
          created_by?: string | null;
          role?: UserRole;
          expires_at?: string;
          used_by?: string | null;
          used_at?: string | null;
        };
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          location_id: string | null;
          user_id: string | null;
          start_time: string;
          end_time: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id?: string | null;
          user_id?: string | null;
          start_time: string;
          end_time: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string | null;
          user_id?: string | null;
          start_time?: string;
          end_time?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          message_id: string | null;
          user_id: string | null;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id?: string | null;
          user_id?: string | null;
          emoji: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string | null;
          user_id?: string | null;
          emoji?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      handoffs: {
        Row: {
          id: string;
          location_id: string | null;
          message_id: string | null;
          outgoing_user_id: string | null;
          incoming_user_id: string | null;
          shift_label: string | null;
          notes: Json;
          crew_tonight: string[] | null;
          tasks_carried_over: number;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id?: string | null;
          message_id?: string | null;
          outgoing_user_id?: string | null;
          incoming_user_id?: string | null;
          shift_label?: string | null;
          notes?: Json;
          crew_tonight?: string[] | null;
          tasks_carried_over?: number;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string | null;
          message_id?: string | null;
          outgoing_user_id?: string | null;
          incoming_user_id?: string | null;
          shift_label?: string | null;
          notes?: Json;
          crew_tonight?: string[] | null;
          tasks_carried_over?: number;
          accepted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          location_id: string | null;
          source_message_id: string | null;
          title: string;
          assigned_to: string | null;
          created_by: string | null;
          urgency: TaskUrgency;
          due_at: string | null;
          completed_at: string | null;
          completion_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id?: string | null;
          source_message_id?: string | null;
          title: string;
          assigned_to?: string | null;
          created_by?: string | null;
          urgency?: TaskUrgency;
          due_at?: string | null;
          completed_at?: string | null;
          completion_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string | null;
          source_message_id?: string | null;
          title?: string;
          assigned_to?: string | null;
          created_by?: string | null;
          urgency?: TaskUrgency;
          due_at?: string | null;
          completed_at?: string | null;
          completion_message_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      swap_requests: {
        Row: {
          id: string;
          location_id: string | null;
          shift_id: string | null;
          message_id: string | null;
          requested_by: string | null;
          covered_by: string | null;
          approved_by: string | null;
          status: SwapStatus;
          note: string | null;
          escalated_at: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id?: string | null;
          shift_id?: string | null;
          message_id?: string | null;
          requested_by?: string | null;
          covered_by?: string | null;
          approved_by?: string | null;
          status?: SwapStatus;
          note?: string | null;
          escalated_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string | null;
          shift_id?: string | null;
          message_id?: string | null;
          requested_by?: string | null;
          covered_by?: string | null;
          approved_by?: string | null;
          status?: SwapStatus;
          note?: string | null;
          escalated_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      availability: {
        Row: {
          id: string;
          user_id: string | null;
          location_id: string | null;
          type: AvailabilityType;
          day_of_week: number | null;
          start_time: string | null;
          end_time: string | null;
          start_date: string | null;
          end_date: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          location_id?: string | null;
          type: AvailabilityType;
          day_of_week?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          location_id?: string | null;
          type?: AvailabilityType;
          day_of_week?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Acknowledgement = Database["public"]["Tables"]["acknowledgements"]["Row"];
export type InviteCode = Database["public"]["Tables"]["invite_codes"]["Row"];
export type Shift = Database["public"]["Tables"]["shifts"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type Handoff = Database["public"]["Tables"]["handoffs"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type SwapRequest = Database["public"]["Tables"]["swap_requests"]["Row"];
export type Availability = Database["public"]["Tables"]["availability"]["Row"];

export interface MessageWithSender extends Message {
  sender: Profile | null;
  acknowledgements?: Acknowledgement[];
  ack_count?: number;
  reactions?: ReactionGroup[];
  thread_replies?: MessageWithSender[];
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  user_ids: string[];
}

export interface MemberWithProfile {
  membership: Membership;
  profile: Profile;
}

export interface ShiftWithProfile extends Shift {
  profile: Profile | null;
}

export interface HandoffWithProfiles extends Handoff {
  outgoing: Profile | null;
  incoming: Profile | null;
}

export interface TaskWithProfiles extends Task {
  assigned_profile: Profile | null;
  created_profile: Profile | null;
}

export interface SwapRequestWithProfiles extends SwapRequest {
  requested_profile: Profile | null;
  covered_profile: Profile | null;
  shift: Shift | null;
}

export interface HandoffNote {
  type: "warning" | "check" | "info";
  text: string;
}

export interface QuickReplyOption {
  id: string;
  label: string;
  emoji: string;
}

export interface QuickReplyMetadata {
  options: QuickReplyOption[];
  responses: { user_id: string; option_id: string; name: string }[];
}
