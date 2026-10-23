export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "user" | "admin";
export type FileType = "pdf" | "epub" | "audio" | "image" | "doc" | "PDF" | "EPUB" | "AUDIO" | "IMAGE" | "DOC";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          full_name: string;
          email: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          role: AppRole;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          full_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          role?: AppRole;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          full_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          role?: AppRole;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          description: string | null;
          ai_summary: string | null;
          category_id: string | null;
          cover_url: string | null;
          file_url: string;
          file_type: string;
          file_size_bytes: number;
          page_count: number | null;
          duration_seconds: number | null;
          language: string;
          publisher: string | null;
          published_year: number | null;
          is_featured: boolean;
          is_archived: boolean;
          download_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          description?: string | null;
          ai_summary?: string | null;
          category_id?: string | null;
          cover_url?: string | null;
          file_url: string;
          file_type: string;
          file_size_bytes?: number;
          page_count?: number | null;
          duration_seconds?: number | null;
          language?: string;
          publisher?: string | null;
          published_year?: number | null;
          is_featured?: boolean;
          is_archived?: boolean;
          download_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string | null;
          description?: string | null;
          ai_summary?: string | null;
          category_id?: string | null;
          cover_url?: string | null;
          file_url?: string;
          file_type?: string;
          file_size_bytes?: number;
          page_count?: number | null;
          duration_seconds?: number | null;
          language?: string;
          publisher?: string | null;
          published_year?: number | null;
          is_featured?: boolean;
          is_archived?: boolean;
          download_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_books: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      downloads: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          ip_address: string | null;
          time: string;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          ip_address?: string | null;
          time?: string;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          ip_address?: string | null;
          time?: string;
          downloaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "downloads_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: AppRole;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type SavedBook = Database["public"]["Tables"]["saved_books"]["Row"];
export type Download = Database["public"]["Tables"]["downloads"]["Row"];

export type BookWithCategory = Book & {
  categories?: Category | null;
};
