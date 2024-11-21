// Define interfaces for all settings types
export interface CustomField {
  name: string;
  type: string;
  options?: string[];
  required: boolean;
}

export interface MemberFields {
  required_fields: string[];
  optional_fields: string[];
  custom_fields: CustomField[];
}

export interface EventSettings {
  categories: string[];
  custom_fields: CustomField[];
  registration_enabled: boolean;
  reminder_hours: number;
  allow_comments: boolean;
  allow_photos: boolean;
  attendance_tracking: boolean;
}

export interface GroupSettings {
  types: string[];
  custom_fields: CustomField[];
  allow_resources: boolean;
  allow_discussions: boolean;
  allow_events: boolean;
  allow_subgroups: boolean;
}

export interface ServiceTime {
  day: string;
  time: string;
  name: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface OrganizationSettings {
  id: string;
  church_name: string;
  year_established?: number;
  tax_id?: string;
  email: string;
  phone?: string;
  website_url?: string;
  social_media: SocialMedia;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  service_times: ServiceTime[];
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  default_email_sender_name?: string;
  default_email_footer?: string;
  enable_sms_notifications: boolean;
  enable_email_notifications: boolean;
  member_fields: MemberFields;
  event_settings: EventSettings;
  group_settings: GroupSettings;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  language: string;
  created_at: string;
  updated_at: string;
  last_updated_by?: string;
} 