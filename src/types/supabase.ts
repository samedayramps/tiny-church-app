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
      contact_submissions: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          church_name: string | null;
          phone: string | null;
          interests: string[] | null;
          message: string | null;
          contact_time: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          church_name?: string | null;
          phone?: string | null;
          interests?: string[] | null;
          message?: string | null;
          contact_time?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          church_name?: string | null;
          phone?: string | null;
          interests?: string[] | null;
          message?: string | null;
          contact_time?: string | null;
          status?: string;
        };
      };
      // Other tables...
    }
  }
}
